"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { DataPoint } from "@/lib/types"

interface DataTableProps {
  historicalData: DataPoint[]
  forecastData: DataPoint[]
}

export function DataTable({ historicalData, forecastData }: DataTableProps) {
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

  if (combinedData.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Historical</TableHead>
              <TableHead className="text-right">Forecast</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinedData.map((point, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {point.date.toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                </TableCell>
                <TableCell className="text-right">
                  {point.actual !== null ? point.actual.toLocaleString() : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {point.forecast !== null ? point.forecast.toLocaleString() : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
