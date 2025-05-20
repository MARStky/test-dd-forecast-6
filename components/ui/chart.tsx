import * as React from "react"

import { cn } from "@/lib/utils"

const Chart = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  return (
    <div className={cn("rounded-md border bg-card text-card-foreground shadow-sm", className)} ref={ref} {...props} />
  )
})
Chart.displayName = "Chart"

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn("p-4", className)} ref={ref} {...props} />
  },
)
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn("", className)} ref={ref} {...props} />
  },
)
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, formatter, labelFormatter, ...props }, ref) => {
    return (
      <div className={cn("p-2 rounded-md border bg-background shadow-md", className)} ref={ref} {...props}>
        {props.label && (
          <div className="text-xs text-muted-foreground">
            {labelFormatter ? labelFormatter(props.label) : props.label}
          </div>
        )}
        {props.payload &&
          Object.entries(props.payload).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-sm font-medium">{key}:</span>
              <span className="text-sm text-muted-foreground">{formatter ? formatter(value as number) : value}</span>
            </div>
          ))}
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn("flex items-center space-x-2", className)} ref={ref} {...props} />
  },
)
ChartLegend.displayName = "ChartLegend"

interface ChartLegendItemProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  color: string
}

const ChartLegendItem = React.forwardRef<HTMLDivElement, ChartLegendItemProps>(
  ({ className, name, color, ...props }, ref) => {
    return (
      <div className={cn("flex items-center space-x-1 text-sm", className)} ref={ref} {...props}>
        <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span>{name}</span>
      </div>
    )
  },
)
ChartLegendItem.displayName = "ChartLegendItem"

export { Chart, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendItem }
