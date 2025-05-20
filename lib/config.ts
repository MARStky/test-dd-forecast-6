import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm"

interface AppConfig {
  dataBucket: string
  sageMakerRoleArn: string
  region: string
  environment: string
}

// Default configuration for local development
const defaultConfig: AppConfig = {
  dataBucket: process.env.DATA_BUCKET || "retail-forecasting-data-dev",
  sageMakerRoleArn: process.env.SAGEMAKER_ROLE_ARN || "arn:aws:iam::123456789012:role/SageMakerExecutionRole-dev",
  region: "us-east-1",
  environment: process.env.NODE_ENV || "development",
}

// Cache the config to avoid repeated SSM calls
let cachedConfig: AppConfig | null = null

/**
 * Gets application configuration from SSM Parameter Store or environment variables
 */
export async function getConfig(): Promise<AppConfig> {
  // Return cached config if available
  if (cachedConfig) {
    return cachedConfig
  }

  // In development, use environment variables
  if (process.env.NODE_ENV !== "production") {
    return defaultConfig
  }

  try {
    // In production, get config from SSM Parameter Store
    const environment = process.env.ENVIRONMENT || "prod"
    const parameterName = `/retail-forecasting/${environment}/config`

    const ssmClient = new SSMClient({ region: "us-east-1" })
    const command = new GetParameterCommand({
      Name: parameterName,
      WithDecryption: true,
    })

    const response = await ssmClient.send(command)
    const configValue = response.Parameter?.Value

    if (!configValue) {
      console.warn(`No configuration found in SSM for ${parameterName}, using default config`)
      return defaultConfig
    }

    // Parse the JSON config
    const config = JSON.parse(configValue) as AppConfig
    cachedConfig = config
    return config
  } catch (error) {
    console.error("Error fetching configuration from SSM:", error)
    return defaultConfig
  }
}
