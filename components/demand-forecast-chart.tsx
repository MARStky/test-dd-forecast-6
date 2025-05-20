"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import type { DataPoint } from "@/lib/types"

// Import chart components directly to avoid any potential issues
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Bar } from "react-chartjs-2"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

interface DemandForecastChartProps {
  historicalData: DataPoint[]
  forecastData: DataPoint[]
}

export function DemandForecastChart({ historicalData, forecastData }: DemandForecastChartProps) {
  const [chartData, setChartData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [fallbackView, setFallbackView] = useState(false)

  // Add this near the top of the component
  useEffect(() => {
    console.log("Chart received new data:", {
      historicalDataLength: historicalData?.length,
      forecastDataLength: forecastData?.length,
    })
  }, [historicalData, forecastData])

  useEffect(() => {
    try {
      // Validate data
      if (!historicalData || historicalData.length === 0) {
        setError("No historical data available")
        return
      }

      console.log("Chart component received data:", {
        historicalDataLength: historicalData.length,
        forecastDataLength: forecastData.length,
        forecastPeriods: forecastData.length,
      })

      // Prepare data for Chart.js
      const labels: string[] = []
      const actualValues: (number | null)[] = []
      const forecastValues: (number | null)[] = []

      // Process historical data
      historicalData.forEach((point) => {
        if (point && point.date) {
          try {
            const date = new Date(point.date)
            if (!isNaN(date.getTime())) {
              labels.push(formatDate(date))
              actualValues.push(point.actual)
              forecastValues.push(null)
            }
          } catch (e) {
            console.error("Error processing historical data point:", point, e)
          }
        }
      })

      // Process forecast data - now with dynamic length based on testPeriods
      forecastData.forEach((point) => {
        if (point && point.date) {
          try {
            const date = new Date(point.date)
            if (!isNaN(date.getTime())) {
              labels.push(formatDate(date))
              actualValues.push(null)
              forecastValues.push(point.forecast)
            }
          } catch (e) {
            console.error("Error processing forecast data point:", point, e)
          }
        }
      })

      if (labels.length === 0) {
        setError("No valid data points to display")
        return
      }

      // Create Chart.js data object
      const data = {
        labels,
        datasets: [
          {
            label: "Historical",
            data: actualValues,
            backgroundColor: "rgba(14, 165, 233, 0.5)",
            borderColor: "rgb(14, 165, 233)",
            borderWidth: 1,
          },
          {
            label: "Forecast",
            data: forecastValues,
            backgroundColor: "rgba(249, 115, 22, 0.5)",
            borderColor: "rgb(249, 115, 22)",
            borderWidth: 1,
          },
        ],
      }

      console.log(`Chart prepared with ${labels.length} total data points (${forecastData.length} forecast points)`)
      setChartData(data)
      setError(null)
    } catch (err) {
      console.error("Error preparing chart data:", err)
      setError(`Error preparing chart: ${err instanceof Error ? err.message : "Unknown error"}`)
      setFallbackView(true)
    }
  }, [historicalData, forecastData])

  // If there's an error, show error message
  if (error) {
    return (
      <Alert variant="destructive" className="w-full">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Visualization Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // If chart data is not ready yet, show loading
  if (!chartData) {
    return (
      <div className="w-full aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center border rounded-md bg-muted/20">
        <p className="text-muted-foreground">Preparing visualization...</p>
      </div>
    )
  }

  // If fallback view is enabled, show a simple table
  if (fallbackView) {
    return <FallbackTableView historicalData={historicalData} forecastData={forecastData} />
  }

  // Render the chart
  return (
    <div className="w-full aspect-[4/3] sm:aspect-[16/9]">
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          animation: {
            duration: 0, // Disable animations to ensure immediate updates
          },
          scales: {
            x: {
              stacked: false,
              title: {
                display: true,
                text: "Month",
              },
            },
            y: {
              stacked: false,
              title: {
                display: true,
                text: "Value",
              },
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              position: "top" as const,
            },
            tooltip: {
              mode: "index" as const,
              intersect: false,
            },
          },
        }}
      />
    </div>
  )
}

// Fallback table view in case the chart fails to render
function FallbackTableView({ historicalData, forecastData }: DemandForecastChartProps) {
  // Combine and sort data
  const combinedData = [
    ...historicalData.map((point) => ({
      date: new Date(point.date),
      actual: point.actual,
      forecast: null,
    })),
    ...forecastData.map((point) => ({
      date: new Date(point.date),
      actual: null,
      forecast: point.forecast,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <h3 className="font-medium">Demand Forecast Data (Fallback View)</h3>
          <p className="text-sm text-muted-foreground">Chart rendering failed. Showing data in table format instead.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-left">Historical</th>
                <th className="border p-2 text-left">Forecast</th>
              </tr>
            </thead>
            <tbody>
              {combinedData.map((point, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                  <td className="border p-2">{formatDate(point.date)}</td>
                  <td className="border p-2">{point.actual !== null ? point.actual : "-"}</td>
                  <td className="border p-2">{point.forecast !== null ? point.forecast : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// Simple date formatter
function formatDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(date)
  } catch (e) {
    return date.toISOString().substring(0, 7)
  }
}
