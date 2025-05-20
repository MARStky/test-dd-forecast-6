import { type NextRequest, NextResponse } from "next/server"
import { generateResponse } from "@/lib/bedrock-client"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    // Call Bedrock to generate a response
    const response = await generateResponse(messages)

    return NextResponse.json({
      response,
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      {
        error: "Failed to process your request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
