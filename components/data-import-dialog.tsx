"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileSpreadsheet, HelpCircle } from "lucide-react"
import { parseCSVData } from "@/lib/data-import"
import type { DataPoint } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DataImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDataImported: (data: DataPoint[]) => void
}

export function DataImportDialog({ open, onOpenChange, onDataImported }: DataImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    setPreview(null)

    if (!selectedFile) {
      setFile(null)
      return
    }

    // Check file type
    const fileType = selectedFile.type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    if (!validTypes.includes(fileType) && !selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV or Excel file")
      setFile(null)
      return
    }

    setFile(selectedFile)

    // Generate preview for CSV files
    if (fileType === "text/csv" || selectedFile.name.endsWith(".csv")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const result = event.target?.result as string
          const { headers, rows, error } = parseCSVData(result, true)

          if (error) {
            setError(error)
            return
          }

          setPreview({
            headers,
            rows: rows.slice(0, 5), // Show only first 5 rows in preview
          })
        } catch (err) {
          console.error("Preview generation error:", err)
          setError("Failed to parse CSV file")
        }
      }
      reader.readAsText(selectedFile)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      const reader = new FileReader()

      reader.onload = (event) => {
        try {
          const result = event.target?.result as string
          const { data, error } = parseCSVData(result)

          if (error) {
            setError(error)
            setIsLoading(false)
            return
          }

          if (data.length === 0) {
            setError("No valid data found in the file")
            setIsLoading(false)
            return
          }

          // Add debug logging
          console.log("Parsed data from CSV:", data)

          // Success - pass the data back
          onDataImported(data)
          setIsLoading(false)
          onOpenChange(false)

          // Reset state
          setFile(null)
          setPreview(null)
        } catch (err) {
          console.error("Error processing file:", err)
          setError(`Failed to process the file: ${err instanceof Error ? err.message : "Unknown error"}`)
          setIsLoading(false)
        }
      }

      reader.onerror = () => {
        setError("Error reading the file")
        setIsLoading(false)
      }

      reader.readAsText(file)
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Historical Sales Data</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing your historical sales data to generate forecasts.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file-upload">Upload File</Label>
            <div className="flex items-center gap-2">
              <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="flex-1" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Upload a CSV file with date and value columns. The date should be in YYYY-MM-DD format and value
                      should be numeric.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-muted-foreground">Accepted format: CSV (.csv)</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {file && !error && (
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertTitle>File Selected</AlertTitle>
              <AlertDescription>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </AlertDescription>
            </Alert>
          )}

          {preview && (
            <div className="border rounded-md overflow-hidden">
              <div className="text-sm font-medium p-2 bg-muted">Data Preview</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      {preview.headers.map((header, i) => (
                        <th key={i} className="p-2 text-left font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, i) => (
                      <tr key={i} className="border-b">
                        {row.map((cell, j) => (
                          <td key={j} className="p-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-2 text-xs text-muted-foreground">Showing first 5 rows of data</div>
            </div>
          )}

          <div className="space-y-2">
            <div className="font-medium">Required Format</div>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>CSV file with headers in the first row</li>
              <li>
                Must include <code className="text-xs bg-muted p-1 rounded">date</code> column (YYYY-MM-DD format)
              </li>
              <li>
                Must include <code className="text-xs bg-muted p-1 rounded">value</code> or{" "}
                <code className="text-xs bg-muted p-1 rounded">sales</code> column with numeric values
              </li>
              <li>
                Example: <code className="text-xs bg-muted p-1 rounded">date,value</code> followed by{" "}
                <code className="text-xs bg-muted p-1 rounded">2023-01-01,1250</code>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || isLoading || !!error}>
            {isLoading ? "Importing..." : "Import Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
