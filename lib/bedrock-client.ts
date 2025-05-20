import { getBedrockClient } from "./aws-config"
import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime"

/**
 * Sends a prompt to Amazon Bedrock and returns the response
 */
export async function generateResponse(messages: any[]) {
  try {
    // Get Bedrock client
    const bedrockClient = await getBedrockClient()

    // Format messages for Claude model
    const prompt = formatPromptForBedrock(messages)

    // Call Amazon Bedrock
    const response = await bedrockClient.send(
      new InvokeModelCommand({
        modelId: "anthropic.claude-v2", // or your preferred model
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          prompt: prompt,
          max_tokens_to_sample: 500,
          temperature: 0.7,
          top_k: 250,
          top_p: 0.999,
          stop_sequences: ["\n\nHuman:"],
        }),
      }),
    )

    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))

    return responseBody.completion
  } catch (error) {
    console.error("Error calling Bedrock:", error)
    throw error
  }
}

/**
 * Formats messages for Bedrock models
 */
function formatPromptForBedrock(messages: any[]) {
  let prompt =
    "\n\nHuman: You are an AI assistant specializing in Amazon SageMaker Autopilot. Answer questions about SageMaker's automated machine learning capabilities, focusing on how it handles data preparation, model selection, training, and deployment. Keep responses helpful, accurate, and concise.\n\nAssistant: I'll help answer questions about Amazon SageMaker Autopilot's automated machine learning capabilities.\n\n"

  for (const message of messages) {
    if (message.role === "user") {
      prompt += `Human: ${message.content}\n\n`
    } else if (message.role === "assistant") {
      prompt += `Assistant: ${message.content}\n\n`
    }
  }

  prompt += "Assistant:"
  return prompt
}
