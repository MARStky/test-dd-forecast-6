"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Brain, AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react"

interface JobStatusCardProps {
  jobName: string
  onDeployModel: (jobName: string) => void
}

export function JobStatusCard({ jobName, onDeployModel }: JobStatusCardProps) {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bestCandidate, setBestCandidate] = useState<any | null>(null)
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
          action: "get_job_status",
          data: { jobName },
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setStatus(data.status)
      setBestCandidate(data.bestCandidate)

      // If job is complete or failed, stop polling
      if (data.status === "Completed" || data.status === "Failed") {
        if (refreshInterval) {
          clearInterval(refreshInterval)
          setRefreshInterval(null)
        }
      }

      setLoading(false)
    } catch (err) {
      setError(`Failed to fetch job status: ${err instanceof Error ? err.message : "Unknown error"}`)
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
  }, [jobName])

  const getStatusBadge = () => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "InProgress":
        return <Badge className="bg-blue-500">In Progress</Badge>
      case "Failed":
        return <Badge className="bg-red-500">Failed</Badge>
      case "Stopping":
        return <Badge className="bg-yellow-500">Stopping</Badge>
      case "Stopped":
        return <Badge className="bg-gray-500">Stopped</Badge>
      default:
        return <Badge className="bg-purple-500">Initializing</Badge>
    }
  }

  const handleDeploy = () => {
    onDeployModel(jobName)
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
            <Brain className="h-5 w-5" />
            <CardTitle>AutoML Job Status</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>Job Name: {jobName}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
            <span>Loading job status...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium">{status}</span>
              </div>

              {status === "Completed" && bestCandidate && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Best Algorithm</span>
                    <span className="text-sm font-medium">{bestCandidate.CandidateName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Objective Metric</span>
                    <span className="text-sm font-medium">
                      {bestCandidate.FinalAutoMLJobObjectiveMetric?.MetricName}:{" "}
                      {bestCandidate.FinalAutoMLJobObjectiveMetric?.Value.toFixed(4)}
                    </span>
                  </div>
                </>
              )}

              {status === "InProgress" && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      Training in progress. This may take 30-60 minutes. The status will update automatically.
                    </span>
                  </div>
                </div>
              )}

              {status === "Failed" && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Job Failed</AlertTitle>
                  <AlertDescription>
                    The AutoML job failed to complete. Please check the SageMaker console for more details.
                  </AlertDescription>
                </Alert>
              )}

              {status === "Completed" && (
                <Alert className="mt-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Job Completed Successfully</AlertTitle>
                  <AlertDescription className="text-green-700">
                    The AutoML job has completed successfully. You can now deploy the best model.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}
      </CardContent>
      {status === "Completed" && (
        <CardFooter>
          <Button onClick={handleDeploy} className="w-full">
            Deploy Best Model
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
