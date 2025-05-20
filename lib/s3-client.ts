import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { getConfig } from "./config"
import type { DataPoint } from "./types"

/**
 * Uploads dataset to S3 bucket
 */
export async function uploadDatasetToS3(data: DataPoint[], filename?: string): Promise<string> {
  try {
    // Get configuration
    const config = await getConfig()

    // Convert data to CSV
    const csvContent = convertToCSV(data)

    // Create S3 client
    const s3Client = new S3Client({ region: config.region })

    // Generate a unique key if filename not provided
    const key = filename || `datasets/dataset-${Date.now()}.csv`

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: config.dataBucket,
        Key: key,
        Body: csvContent,
        ContentType: "text/csv",
      }),
    )

    return `s3://${config.dataBucket}/${key}`
  } catch (error) {
    console.error("Error uploading dataset to S3:", error)
    throw error
  }
}

/**
 * Generates a presigned URL for uploading a file to S3
 */
export async function getPresignedUploadUrl(filename: string, contentType: string): Promise<string> {
  try {
    // Get configuration
    const config = await getConfig()

    // Create S3 client
    const s3Client = new S3Client({ region: config.region })

    // Generate a unique key
    const key = `uploads/${Date.now()}-${filename}`

    // Create presigned URL
    const command = new PutObjectCommand({
      Bucket: config.dataBucket,
      Key: key,
      ContentType: contentType,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    return url
  } catch (error) {
    console.error("Error generating presigned URL:", error)
    throw error
  }
}

/**
 * Converts data points to CSV format
 */
function convertToCSV(data: DataPoint[]): string {
  const headers = ["date", "value"]
  const rows = data.map((point) => {
    const date = new Date(point.date).toISOString().split("T")[0]
    return `${date},${point.actual || 0}`
  })

  return [headers.join(","), ...rows].join("\n")
}
