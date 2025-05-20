import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime"
import { SageMakerClient } from "@aws-sdk/client-sagemaker"
import { fromSSO } from "@aws-sdk/credential-providers"
import { fromNodeProviderChain } from "@aws-sdk/credential-providers"

// AWS SDK v3 configuration with us-east-1 region
export const getBedrockClient = async () => {
  try {
    // Determine if we're running in production or development
    const isProduction = process.env.NODE_ENV === "production"

    // For local development, check if AWS_PROFILE is set
    const hasAwsProfile = !!process.env.AWS_PROFILE

    // Use SSO in development when AWS_PROFILE is set, otherwise use default provider chain
    return new BedrockRuntimeClient({
      region: "us-east-1", // Hardcoded to us-east-1 as specified
      credentials:
        !isProduction && hasAwsProfile
          ? fromSSO({
              profile: process.env.AWS_PROFILE,
            })
          : fromNodeProviderChain(), // Use default provider chain (will use IAM role in Amplify)
    })
  } catch (error) {
    console.error("Error initializing Bedrock client:", error)
    throw error
  }
}

export const getSageMakerClient = async () => {
  try {
    // Determine if we're running in production or development
    const isProduction = process.env.NODE_ENV === "production"

    // For local development, check if AWS_PROFILE is set
    const hasAwsProfile = !!process.env.AWS_PROFILE

    // Use SSO in development when AWS_PROFILE is set, otherwise use default provider chain
    return new SageMakerClient({
      region: "us-east-1", // Hardcoded to us-east-1 as specified
      credentials:
        !isProduction && hasAwsProfile
          ? fromSSO({
              profile: process.env.AWS_PROFILE,
            })
          : fromNodeProviderChain(), // Use default provider chain (will use IAM role in Amplify)
    })
  } catch (error) {
    console.error("Error initializing SageMaker client:", error)
    throw error
  }
}
