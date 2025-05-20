import { type NextRequest, NextResponse } from "next/server"
import {
  createForecastingJob,
  getJobStatus,
  deployBestModel,
  getEndpointStatus,
  getForecastFromEndpoint,
  cleanupSageMakerResources,
} from "@/lib/sagemaker-client"
import { getPresignedUploadUrl } from "@/lib/s3-client"

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    switch (action) {
      case "create_job":
        // Create a new forecasting job
        const { historicalData } = data
        const result = await createForecastingJob(historicalData)
        return NextResponse.json(result)

      case "get_job_status":
        // Get the status of an existing job
        const { jobName } = data
        const status = await getJobStatus(jobName)
        return NextResponse.json(status)

      case "deploy_model":
        // Deploy the best model from a job
        const { jobName: deployJobName } = data
        const deployResult = await deployBestModel(deployJobName)
        return NextResponse.json(deployResult)

      case "get_endpoint_status":
        // Get the status of an endpoint
        const { endpointName: statusEndpointName } = data
        const endpointStatus = await getEndpointStatus(statusEndpointName)
        return NextResponse.json(endpointStatus)

      case "get_forecast":
        // Get forecast from a deployed endpoint
        const { endpointName, historicalData: histData, forecastHorizon } = data
        const forecast = await getForecastFromEndpoint(endpointName, histData, forecastHorizon)
        return NextResponse.json({ forecast })

      case "cleanup_resources":
        // Clean up SageMaker resources
        const { endpointName: cleanupEndpointName, endpointConfigName, modelName } = data
        const cleanupResult = await cleanupSageMakerResources(cleanupEndpointName, endpointConfigName, modelName)
        return NextResponse.json(cleanupResult)

      case "get_upload_url":
        // Get a presigned URL for uploading a file
        const { filename, contentType } = data
        const uploadUrl = await getPresignedUploadUrl(filename, contentType)
        return NextResponse.json({ uploadUrl })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in forecast API:", error)
    return NextResponse.json(
      {
        error: "Failed to process your request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
