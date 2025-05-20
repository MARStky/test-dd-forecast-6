import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle } from "lucide-react"

interface TestResultsCardProps {
  results: {
    mape: number
    rmse: number
    accuracy: number
  }
}

export function TestResultsCard({ results }: TestResultsCardProps) {
  // Ensure results.mape is a number before using toFixed
  const mapeValue = typeof results.mape === "number" ? results.mape.toFixed(2) : "N/A"
  const rmseValue = typeof results.rmse === "number" ? results.rmse.toFixed(2) : "N/A"
  const accuracyValue = typeof results.accuracy === "number" ? results.accuracy.toFixed(2) : "N/A"

  const isGoodAccuracy = results.accuracy >= 85

  return (
    <Card className={isGoodAccuracy ? "border-green-500" : "border-amber-500"}>
      <CardHeader className={isGoodAccuracy ? "bg-green-50" : "bg-amber-50"}>
        <CardTitle className="flex items-center gap-2">
          {isGoodAccuracy ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Good Forecast Accuracy</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span>Moderate Forecast Accuracy</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{accuracyValue}%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{mapeValue}%</div>
            <div className="text-xs text-muted-foreground">MAPE</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{rmseValue}</div>
            <div className="text-xs text-muted-foreground">RMSE</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
