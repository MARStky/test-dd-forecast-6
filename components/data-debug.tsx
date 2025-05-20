"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bug } from "lucide-react"
import type { DataPoint } from "@/lib/types"

interface DataDebugProps {
  historicalData: DataPoint[]
  forecastData: DataPoint[]
}

export function DataDebug({ historicalData, forecastData }: DataDebugProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-white"
        onClick={() => setIsOpen(true)}
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug Data
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-[500px] max-h-[80vh] overflow-auto shadow-lg">
      <CardHeader className="sticky top-0 bg-background z-10">
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center">
            <Bug className="h-4 w-4 mr-2" />
            Data Debugger
          </span>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Historical Data ({historicalData.length} points)</h3>
            <div className="bg-muted rounded-md p-2 overflow-x-auto">
              <pre className="text-xs">
                {JSON.stringify(historicalData.slice(0, 10), null, 2)}
                {historicalData.length > 10 && "\n... (more data not shown)"}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Forecast Data ({forecastData.length} points)</h3>
            <div className="bg-muted rounded-md p-2 overflow-x-auto">
              <pre className="text-xs">
                {JSON.stringify(forecastData.slice(0, 10), null, 2)}
                {forecastData.length > 10 && "\n... (more data not shown)"}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Data Validation</h3>
            <ul className="text-xs space-y-1">
              <li>
                Historical data valid dates:{" "}
                {historicalData.every((d) => !isNaN(new Date(d.date).getTime())) ? "✅" : "❌"}
              </li>
              <li>Historical data has values: {historicalData.some((d) => d.actual !== null) ? "✅" : "❌"}</li>
              <li>
                Forecast data valid dates: {forecastData.every((d) => !isNaN(new Date(d.date).getTime())) ? "✅" : "❌"}
              </li>
              <li>Forecast data has values: {forecastData.some((d) => d.forecast !== null) ? "✅" : "❌"}</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
