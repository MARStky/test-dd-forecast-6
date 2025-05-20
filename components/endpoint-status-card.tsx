"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Server, AlertTriangle, CheckCircle, Clock, RefreshCw, Trash2 } from "lucide-react"

interface EndpointStatusCardProps {
  endpointName: string
  endpointConfigName: string
  modelName: string
  onGetForecast: (endpointName: string) => void
  onCleanup: (endpointName: string, endpointConfigName: string, modelName: string) => void
}

export function EndpointStatusCard({
  endpointName,
  endpointConfigName,
  modelName,
  onGetForecast,
  onCleanup,
}: EndpointStatusCardProps) {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/forecast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_endpoint_status",
          data: { endpointName },
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setStatus(data.status)

      // If endpoint is in service or failed, stop polling
      if (data.status === "InService" || data.status === "Failed") {
        if (refreshInterval) {
          clearInterval(refreshInterval)
          setRefreshInterval(null)
        }
      }

      setLoading(false)
    } catch (err) {
      setError(`Failed to fetch endpoint status: ${err instanceof Error ? err.message : "Unknown error"}`)
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch status immediately
    fetchStatus()

    // Set up polling every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    setRefreshInterval(interval)

    // Clean up on unmount
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [endpointName])

  const getStatusBadge = () => {
    switch (status) {
      case "InService":
        return <Badge className="bg-green-500">In Service</Badge>
      case "Creating":
        return <Badge className="bg-blue-500">Creating</Badge>
      case "Updating":
        return <Badge className="bg-blue-500">Updating</Badge>
      case "Failed":
        return <Badge className="bg-red-500">Failed</Badge>
      case "Deleting":
        return <Badge className="bg-yellow-500">Deleting</Badge>
      default:
        return <Badge className="bg-purple-500">Initializing</Badge>
    }
  }

  const handleGetForecast = () => {
    onGetForecast(endpointName)
  }

  const handleCleanup = () => {
    onCleanup(endpointName, endpointConfigName, modelName)
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            <CardTitle>Endpoint Status</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>Endpoint: {endpointName}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
            <span>Loading endpoint status...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium">{status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Model</span>
                <span className="text-sm font-medium">{modelName}</span>
              </div>

              {status === "Creating" && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      Endpoint creation in progress. This may take 5-10 minutes. The status will update automatically.
                    </span>
                  </div>
                </div>
              )}

              {status === "Failed" && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Endpoint Creation Failed</AlertTitle>
                  <AlertDescription>
                    The endpoint failed to deploy. Please check the SageMaker console for more details.
                  </AlertDescription>
                </Alert>
              )}

              {status === "InService" && (
                <Alert className="mt-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Endpoint Ready</AlertTitle>
                  <AlertDescription className="text-green-700">
                    The endpoint is in service and ready to generate forecasts.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {status === "InService" && (
          <>
            <Button onClick={handleGetForecast} className="flex-1 mr-2">
              Generate Forecast
            </Button>
            <Button onClick={handleCleanup} variant="outline" className="flex-none">
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
