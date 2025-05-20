"use client"

import { useEffect, useRef } from "react"
import type { DataPoint } from "@/lib/types"

interface SimpleChartViewProps {
  historicalData: DataPoint[]
  forecastData: DataPoint[]
}

export function SimpleChartView({ historicalData, forecastData }: SimpleChartViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Add this console log
    console.log("SimpleChartView rendering with:", {
      historicalPoints: historicalData.length,
      forecastPoints: forecastData.length,
    })

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Prepare data
    const combinedData = [
      ...historicalData.map((point) => ({
        date: new Date(point.date),
        value: point.actual,
        type: "historical",
      })),
      ...forecastData.map((point) => ({
        date: new Date(point.date),
        value: point.forecast,
        type: "forecast",
      })),
    ].filter((point) => !isNaN(point.date.getTime()) && point.value !== null)

    if (combinedData.length === 0) {
      drawNoDataMessage(ctx, canvas.width, canvas.height)
      return
    }

    // Sort by date
    combinedData.sort((a, b) => a.date.getTime() - b.date.getTime())

    // Find min and max values
    const values = combinedData.map((point) => point.value as number)
    const minValue = Math.min(...values) * 0.9
    const maxValue = Math.max(...values) * 1.1

    // Set up chart dimensions
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#ccc"
    ctx.lineWidth = 1
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.stroke()

    // Draw bars
    const barWidth = (chartWidth / combinedData.length) * 0.8
    const barSpacing = (chartWidth / combinedData.length) * 0.2

    combinedData.forEach((point, index) => {
      const x = padding + index * (barWidth + barSpacing)
      const valueRange = maxValue - minValue
      const barHeight = (((point.value as number) - minValue) / valueRange) * chartHeight
      const y = canvas.height - padding - barHeight

      ctx.fillStyle = point.type === "historical" ? "rgba(14, 165, 233, 0.7)" : "rgba(249, 115, 22, 0.7)"
      ctx.fillRect(x, y, barWidth, barHeight)
    })

    // Draw legend
    drawLegend(ctx, canvas.width, padding)
  }, [historicalData, forecastData])

  function drawNoDataMessage(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = "#666"
    ctx.font = "14px Arial"
    ctx.textAlign = "center"
    ctx.fillText("No data available to display", width / 2, height / 2)
  }

  function drawLegend(ctx: CanvasRenderingContext2D, width: number, padding: number) {
    const legendX = width - padding - 150
    const legendY = padding

    // Historical
    ctx.fillStyle = "rgba(14, 165, 233, 0.7)"
    ctx.fillRect(legendX, legendY, 20, 10)
    ctx.fillStyle = "#333"
    ctx.font = "12px Arial"
    ctx.fillText("Historical", legendX + 25, legendY + 9)

    // Forecast
    ctx.fillStyle = "rgba(249, 115, 22, 0.7)"
    ctx.fillRect(legendX, legendY + 20, 20, 10)
    ctx.fillStyle = "#333"
    ctx.fillText("Forecast", legendX + 25, legendY + 29)
  }

  return (
    <div className="w-full aspect-[4/3] sm:aspect-[16/9] border rounded-md bg-white">
      <canvas ref={canvasRef} width={800} height={400} className="w-full h-full" />
    </div>
  )
}
