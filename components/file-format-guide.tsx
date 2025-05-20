import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileSpreadsheet } from "lucide-react"

export function FileFormatGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          <span>Data Import Guide</span>
        </CardTitle>
        <CardDescription>How to format your CSV file for importing historical sales data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Required Format</h3>
            <p className="text-sm text-muted-foreground">Your CSV file should include at minimum these columns:</p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Example</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">date</TableCell>
                <TableCell>Date in YYYY-MM-DD format</TableCell>
                <TableCell>2023-01-15</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  value <span className="text-muted-foreground">(or sales)</span>
                </TableCell>
                <TableCell>Numeric sales value</TableCell>
                <TableCell>1250</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div>
            <h3 className="text-sm font-medium mb-2">Example CSV</h3>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
              date,value,category
              <br />
              2023-01-01,1250,Electronics
              <br />
              2023-02-01,1340,Electronics
              <br />
              2023-03-01,1100,Electronics
              <br />
              2023-04-01,1420,Electronics
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Tips</h3>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>Ensure dates are in chronological order</li>
              <li>Include at least 12 months of historical data for best results</li>
              <li>The system will automatically handle missing months</li>
              <li>Additional columns will be preserved but not used in forecasting</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
