"use client"

import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import type { DataPoint } from "@/lib/types"

export function SampleDataButton() {
  const handleDownloadSample = () => {
    // Create sample data
    const sampleData = generateSampleData()

    // Convert to CSV
    const headers = ["date", "value"]
    const csvContent = [
      headers.join(","),
      ...sampleData.map((point) => {
        const date = new Date(point.date).toISOString().split("T")[0]
        return `${date},${point.actual}`
      }),
    ].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample_sales_data.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownloadSample} className="flex items-center">
      <FileDown className="h-4 w-4 mr-2" />
      Download Sample Data
    </Button>
  )
}

// Generate realistic sample data
function generateSampleData(): DataPoint[] {
  const data: DataPoint[] = []
  const startDate = new Date(2022, 0, 1) // Jan 1, 2022

  let baseValue = 1000

  for (let i = 0; i < 24; i++) {
    const date = new Date(startDate)
    date.setMonth(startDate.getMonth() + i)

    // Add seasonality
    const month = date.getMonth()
    let seasonality = 1.0

    if (month === 10 || month === 11) {
      // Nov-Dec
      seasonality = 1.3
    } else if (month === 0 || month === 1) {
      // Jan-Feb
      seasonality = 0.8
    } else if (month >= 5 && month <= 7) {
      // Jun-Aug
      seasonality = 1.1
    }

    // Add trend
    const trend = 1 + i * 0.01

    // Add noise
    const noise = 0.9 + Math.random() * 0.2

    // Calculate value
    const value = Math.round(baseValue * seasonality * trend * noise)

    data.push({
      date: date.toISOString(),
      actual: value,
      forecast: null,
    })

    // Update base value with some persistence
    baseValue = baseValue * 0.8 + value * 0.2
  }

  return data
}
