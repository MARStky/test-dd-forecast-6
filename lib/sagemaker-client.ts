import {
  CreateAutoMLJobCommand,
  DescribeAutoMLJobCommand,
  ListCandidatesForAutoMLJobCommand,
  CreateModelCommand,
  CreateEndpointConfigCommand,
  CreateEndpointCommand,
  DescribeEndpointCommand,
  InvokeEndpointCommand,
  DeleteEndpointCommand,
  DeleteEndpointConfigCommand,
  DeleteModelCommand,
} from "@aws-sdk/client-sagemaker"
import { getSageMakerClient } from "./aws-config"
import { uploadDatasetToS3 } from "./s3-client"
import { getConfig } from "./config"
import type { DataPoint } from "./types"

const JOB_PREFIX = "retail-forecast-"

/**
 * Creates a SageMaker AutoML job for time series forecasting
 */
export async function createForecastingJob(historicalData: DataPoint[], targetColumn = "value") {
  try {
    // 1. Get configuration
    const config = await getConfig()

    // 2. Upload data to S3
    const datasetPath = await uploadDatasetToS3(historicalData)

    // 3. Create a unique job name
    const jobName = `${JOB_PREFIX}${Date.now()}`

    // 4. Get SageMaker client
    const sageMakerClient = await getSageMakerClient()

    // 5. Create AutoML job
    const response = await sageMakerClient.send(
      new CreateAutoMLJobCommand({
        AutoMLJobName: jobName,
        ProblemType: "Forecasting",
        AutoMLJobConfig: {
          CompletionCriteria: {
            MaxCandidates: 10,
            MaxRuntimePerTrainingJobInSeconds: 3600,
          },
        },
        InputDataConfig: [
          {
            DataSource: {
              S3DataSource: {
                S3DataType: "S3Prefix",
                S3Uri: datasetPath,
              },
            },
            TargetAttributeName: targetColumn,
          },
        ],
        OutputDataConfig: {
          S3OutputPath: `s3://${config.dataBucket}/output/`,
        },
        RoleArn: config.sageMakerRoleArn,
      }),
    )

    return {
      jobName,
      jobArn: response.AutoMLJobArn,
    }
  } catch (error) {
    console.error("Error creating forecasting job:", error)
    throw error
  }
}

/**
 * Gets the status of an AutoML job
 */
export async function getJobStatus(jobName: string) {
  try {
    const sageMakerClient = await getSageMakerClient()

    const response = await sageMakerClient.send(
      new DescribeAutoMLJobCommand({
        AutoMLJobName: jobName,
      }),
    )

    // Get best candidate if job is complete
    let bestCandidate = null
    if (response.AutoMLJobStatus === "Completed") {
      const candidatesResponse = await sageMakerClient.send(
        new ListCandidatesForAutoMLJobCommand({
          AutoMLJobName: jobName,
        }),
      )

      bestCandidate = candidatesResponse.Candidates?.[0]
    }

    return {
      jobName,
      status: response.AutoMLJobStatus,
      bestCandidate,
      endTime: response.EndTime,
      failureReason: response.FailureReason,
    }
  } catch (error) {
    console.error("Error getting job status:", error)
    throw error
  }
}

/**
 * Deploys the best model from an AutoML job to an endpoint
 */
export async function deployBestModel(jobName: string) {
  try {
    const sageMakerClient = await getSageMakerClient()
    const config = await getConfig()

    // 1. Get the best candidate
    const candidatesResponse = await sageMakerClient.send(
      new ListCandidatesForAutoMLJobCommand({
        AutoMLJobName: jobName,
      }),
    )

    const bestCandidate = candidatesResponse.Candidates?.[0]
    if (!bestCandidate || !bestCandidate.CandidateName) {
      throw new Error("No candidates found for the job")
    }

    // 2. Create model
    const modelName = `${jobName}-model`
    await sageMakerClient.send(
      new CreateModelCommand({
        ModelName: modelName,
        PrimaryContainer: {
          ModelDataUrl: bestCandidate.InferenceContainers?.[0]?.ModelDataUrl,
          Image: bestCandidate.InferenceContainers?.[0]?.Image,
          Environment: bestCandidate.InferenceContainers?.[0]?.Environment,
        },
        ExecutionRoleArn: config.sageMakerRoleArn,
      }),
    )

    // 3. Create endpoint configuration
    const endpointConfigName = `${jobName}-config`
    await sageMakerClient.send(
      new CreateEndpointConfigCommand({
        EndpointConfigName: endpointConfigName,
        ProductionVariants: [
          {
            VariantName: "AllTraffic",
            ModelName: modelName,
            InitialInstanceCount: 1,
            InstanceType: "ml.m5.large",
          },
        ],
      }),
    )

    // 4. Create endpoint
    const endpointName = `${jobName}-endpoint`
    await sageMakerClient.send(
      new CreateEndpointCommand({
        EndpointName: endpointName,
        EndpointConfigName: endpointConfigName,
      }),
    )

    return {
      modelName,
      endpointConfigName,
      endpointName,
    }
  } catch (error) {
    console.error("Error deploying best model:", error)
    throw error
  }
}

/**
 * Gets the status of an endpoint
 */
export async function getEndpointStatus(endpointName: string) {
  try {
    const sageMakerClient = await getSageMakerClient()

    const response = await sageMakerClient.send(
      new DescribeEndpointCommand({
        EndpointName: endpointName,
      }),
    )

    return {
      endpointName,
      status: response.EndpointStatus,
      failureReason: response.FailureReason,
      creationTime: response.CreationTime,
      lastModifiedTime: response.LastModifiedTime,
    }
  } catch (error) {
    console.error("Error getting endpoint status:", error)
    throw error
  }
}

/**
 * Gets forecast from a deployed SageMaker endpoint
 */
export async function getForecastFromEndpoint(
  endpointName: string,
  historicalData: DataPoint[],
  forecastHorizon: number,
) {
  try {
    const sageMakerClient = await getSageMakerClient()

    // Prepare input data in the format expected by the model
    const inputData = prepareInputData(historicalData, forecastHorizon)

    // Invoke the endpoint
    const response = await sageMakerClient.send(
      new InvokeEndpointCommand({
        EndpointName: endpointName,
        ContentType: "application/json",
        Body: Buffer.from(JSON.stringify(inputData)),
      }),
    )

    // Parse the response
    const responseBody = JSON.parse(Buffer.from(response.Body).toString())

    // Convert to DataPoint format
    return convertResponseToDataPoints(responseBody, historicalData)
  } catch (error) {
    console.error("Error getting forecast from endpoint:", error)
    throw error
  }
}

/**
 * Prepares input data for the SageMaker endpoint
 */
function prepareInputData(historicalData: DataPoint[], forecastHorizon: number) {
  // Extract dates and values
  const dates = historicalData.map((point) => {
    const date = new Date(point.date)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(
      2,
      "0",
    )}`
  })

  const values = historicalData.map((point) => point.actual || 0)

  // Format depends on the specific model being used
  // This is a simplified example for DeepAR
  return {
    instances: [
      {
        start: dates[0],
        target: values,
      },
    ],
    configuration: {
      num_samples: 50,
      output_types: ["mean", "quantiles", "samples"],
      quantiles: ["0.1", "0.5", "0.9"],
      prediction_length: forecastHorizon,
    },
  }
}

/**
 * Converts SageMaker response to DataPoint format
 */
function convertResponseToDataPoints(response: any, historicalData: DataPoint[]): DataPoint[] {
  // This would need to be adapted based on the actual response format
  // from your specific SageMaker model

  const lastDate = new Date(historicalData[historicalData.length - 1].date)
  const predictions = response.predictions[0]

  return predictions.mean.map((value: number, index: number) => {
    const forecastDate = new Date(lastDate)
    forecastDate.setMonth(lastDate.getMonth() + index + 1)

    return {
      date: forecastDate.toISOString(),
      actual: null,
      forecast: value,
    }
  })
}

/**
 * Cleans up SageMaker resources
 */
export async function cleanupSageMakerResources(endpointName: string, endpointConfigName: string, modelName: string) {
  try {
    const sageMakerClient = await getSageMakerClient()

    // Delete endpoint
    await sageMakerClient.send(
      new DeleteEndpointCommand({
        EndpointName: endpointName,
      }),
    )

    // Delete endpoint configuration
    await sageMakerClient.send(
      new DeleteEndpointConfigCommand({
        EndpointConfigName: endpointConfigName,
      }),
    )

    // Delete model
    await sageMakerClient.send(
      new DeleteModelCommand({
        ModelName: modelName,
      }),
    )

    return {
      success: true,
      message: "Resources cleaned up successfully",
    }
  } catch (error) {
    console.error("Error cleaning up SageMaker resources:", error)
    throw error
  }
}
