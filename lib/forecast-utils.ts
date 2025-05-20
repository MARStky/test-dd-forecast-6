import type { DataPoint } from "@/lib/types"

/**
 * Generates historical demand data for a specified number of months
 */
export function generateHistoricalData(months: number): DataPoint[] {
  const data: DataPoint[] = []
  const now = new Date()
  const startDate = new Date(now.getFullYear() - Math.floor(months / 12), now.getMonth() - (months % 12), 1)

  let baseValue = 1000 + Math.random() * 500

  for (let i = 0; i < months; i++) {
    const date = new Date(startDate)
    date.setMonth(startDate.getMonth() + i)

    // Add seasonality (higher in Nov-Dec, lower in Jan-Feb)
    const month = date.getMonth()
    let seasonality = 1.0

    if (month === 10 || month === 11) {
      // Nov-Dec
      seasonality = 1.3 + Math.random() * 0.2
    } else if (month === 0 || month === 1) {
      // Jan-Feb
      seasonality = 0.8 + Math.random() * 0.1
    } else if (month >= 5 && month <= 7) {
      // Jun-Aug
      seasonality = 1.1 + Math.random() * 0.1
    }

    // Add trend (slight increase over time)
    const trend = 1 + i * 0.01

    // Add noise
    const noise = 0.9 + Math.random() * 0.2

    // Calculate value
    const value = Math.round(baseValue * seasonality * trend * noise)

    data.push({
      date: date.toISOString(),
      actual: value,
      forecast: null,
    })

    // Update base value with some persistence
    baseValue = baseValue * 0.8 + value * 0.2
  }

  return data
}

/**
 * Generates forecast data based on historical data and parameters
 */
export function generateForecastData(
  historicalData: DataPoint[],
  months: number,
  factors?: {
    seasonality?: number
    trend?: number
    noise?: number
  },
): DataPoint[] {
  const data: DataPoint[] = []

  if (!historicalData || historicalData.length === 0) {
    console.warn("No historical data provided to generateForecastData")
    return data
  }

  // Default factors if not provided
  const seasonalityFactor = factors?.seasonality ?? 0.2 // Default 20%
  const trendFactor = factors?.trend ?? 0.05 // Default 5%
  const noiseFactor = factors?.noise ?? 0.1 // Default 10%

  console.log("Using factors:", { seasonalityFactor, trendFactor, noiseFactor })

  try {
    // Get the last date from historical data
    const lastDate = new Date(historicalData[historicalData.length - 1].date)

    if (isNaN(lastDate.getTime())) {
      console.error("Invalid last date in historical data")
      return data
    }

    // Use a simple model that captures seasonality and trend
    // In a real app, this would be the output from SageMaker Autopilot
    const yearlyPattern: number[] = []

    // Extract yearly pattern from historical data if we have enough data
    if (historicalData.length >= 12) {
      for (let i = 0; i < 12; i++) {
        const monthData = historicalData.filter((d) => {
          try {
            return new Date(d.date).getMonth() === i
          } catch (e) {
            return false
          }
        })

        if (monthData.length > 0) {
          const avgValue = monthData.reduce((sum, d) => sum + (d.actual || 0), 0) / monthData.length
          yearlyPattern[i] = avgValue
        } else {
          yearlyPattern[i] = 1000 // Default value
        }
      }

      // Normalize the pattern
      const avgValue = yearlyPattern.reduce((sum, val) => sum + val, 0) / yearlyPattern.length
      for (let i = 0; i < 12; i++) {
        yearlyPattern[i] = yearlyPattern[i] / avgValue
      }
    } else {
      // Default seasonality if we don't have enough data
      for (let i = 0; i < 12; i++) {
        if (i === 10 || i === 11) {
          // Nov-Dec
          yearlyPattern[i] = 1.3
        } else if (i === 0 || i === 1) {
          // Jan-Feb
          yearlyPattern[i] = 0.8
        } else if (i >= 5 && i <= 7) {
          // Jun-Aug
          yearlyPattern[i] = 1.1
        } else {
          yearlyPattern[i] = 1.0
        }
      }
    }

    // Apply the user-defined seasonality factor to enhance or reduce the seasonal pattern
    // Make this effect more dramatic
    for (let i = 0; i < 12; i++) {
      // Adjust seasonality: bring values closer to or further from 1.0
      const currentDeviation = yearlyPattern[i] - 1.0
      // Amplify the effect by 3x to make it more visible
      yearlyPattern[i] = 1.0 + currentDeviation * (1.0 + seasonalityFactor * 3)
    }

    // Calculate average value from last 3 months for base value
    const recentData = historicalData.slice(-3)
    const baseValue = recentData.reduce((sum, d) => sum + (d.actual || 0), 0) / recentData.length || 1000

    // Calculate average growth rate, adjusted by trend factor
    // Make trend effect more dramatic
    let growthRate = 1.01 // Default 1% growth

    // Apply trend factor directly for more visible effect
    growthRate = 1.0 + trendFactor * 0.01

    // Limit extreme growth rates but allow more variation
    growthRate = Math.max(0.9, Math.min(1.1, growthRate))

    console.log("Applied growth rate:", growthRate)

    // Generate forecast
    for (let i = 0; i < months; i++) {
      const forecastDate = new Date(lastDate)
      forecastDate.setMonth(lastDate.getMonth() + i + 1)

      const month = forecastDate.getMonth()
      const seasonality = yearlyPattern[month]
      const trend = Math.pow(growthRate, i)

      // Add noise based on the noise factor - make more dramatic
      const noise = 1.0 - noiseFactor + Math.random() * (noiseFactor * 2)

      const forecastValue = Math.round(baseValue * seasonality * trend * noise)

      data.push({
        date: forecastDate.toISOString(),
        actual: null,
        forecast: forecastValue,
      })
    }

    console.log("Generated forecast data points:", data.length)
  } catch (err) {
    console.error("Error generating forecast:", err)
  }

  return data
}

/**
 * Tests forecast accuracy by generating synthetic "actual" data and comparing to forecast
 */
export function testForecastAccuracy(
  historicalData: DataPoint[],
  forecastData: DataPoint[],
  periods: number,
  factors: {
    seasonality: number
    trend: number
    noise: number
  },
): { mape: number; rmse: number; accuracy: number } {
  if (periods <= 0 || periods > forecastData.length) {
    periods = Math.min(forecastData.length, 6)
  }

  // Get the test data (subset of forecast data)
  const testData = forecastData.slice(0, periods)

  // Generate synthetic "actual" values based on the forecast and test factors
  const testResults = testData.map((point) => {
    const forecastValue = point.forecast || 0

    // Apply the test factors
    const seasonalityFactor = 1 + (Math.random() * 2 - 1) * (factors.seasonality / 100)
    const trendFactor = 1 + factors.trend / 100
    const noiseFactor = 1 + (Math.random() * 2 - 1) * (factors.noise / 100)

    // Calculate synthetic "actual" value
    const actualValue = Math.round(forecastValue * seasonalityFactor * trendFactor * noiseFactor)

    return {
      forecast: forecastValue,
      actual: actualValue,
      absoluteError: Math.abs(actualValue - forecastValue),
      percentageError: Math.abs((actualValue - forecastValue) / actualValue) * 100,
    }
  })

  // Calculate MAPE (Mean Absolute Percentage Error)
  const mape = testResults.reduce((sum, result) => sum + result.percentageError, 0) / testResults.length

  // Calculate RMSE (Root Mean Square Error)
  const mse = testResults.reduce((sum, result) => sum + Math.pow(result.absoluteError, 2), 0) / testResults.length
  const rmse = Math.sqrt(mse)

  // Calculate accuracy (100% - MAPE)
  const accuracy = Math.max(0, 100 - mape)

  return {
    mape,
    rmse,
    accuracy,
  }
}

/**
 * Normalizes time series data to ensure regular monthly intervals
 * This is useful when imported data might have irregular timestamps or missing months
 */
export function normalizeTimeSeriesData(data: DataPoint[]): DataPoint[] {
  console.log("Normalizing data:", data)

  if (!data || data.length === 0) {
    console.warn("Empty data array passed to normalizeTimeSeriesData")
    return []
  }

  // Initialize the normalized data array
  const normalizedData: DataPoint[] = []

  try {
    // Filter out any entries with invalid dates first
    const validData = data.filter((point) => {
      try {
        const date = new Date(point.date)
        return !isNaN(date.getTime())
      } catch (e) {
        return false
      }
    })

    if (validData.length === 0) {
      console.warn("No valid dates found in data")
      return []
    }

    // Sort data by date
    const sortedData = [...validData].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateA - dateB
    })

    // Get the first and last date
    const firstDate = new Date(sortedData[0].date)
    const lastDate = new Date(sortedData[sortedData.length - 1].date)

    // Create a map of existing data points by year-month
    const dataMap = new Map<string, DataPoint>()

    sortedData.forEach((point) => {
      const date = new Date(point.date)
      const key = `${date.getFullYear()}-${date.getMonth()}`

      // If we have multiple data points for the same month, use the latest one
      if (!dataMap.has(key) || new Date(dataMap.get(key)!.date).getTime() < date.getTime()) {
        dataMap.set(key, point)
      }
    })

    // Generate a complete series with all months
    const currentDate = new Date(firstDate)
    currentDate.setDate(1) // Set to first day of month for consistency

    while (currentDate <= lastDate) {
      const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}`

      if (dataMap.has(key)) {
        // Use existing data point
        normalizedData.push(dataMap.get(key)!)
      } else {
        // Create a placeholder with interpolated value
        // Find nearest points before and after
        const currentTime = currentDate.getTime()
        let before: DataPoint | null = null
        let after: DataPoint | null = null

        for (const point of sortedData) {
          const pointTime = new Date(point.date).getTime()
          if (pointTime < currentTime) {
            if (!before || pointTime > new Date(before.date).getTime()) {
              before = point
            }
          } else if (pointTime > currentTime) {
            if (!after || pointTime < new Date(after.date).getTime()) {
              after = point
            }
          }
        }

        // Linear interpolation if we have points before and after
        let value: number | null = null

        if (before && after && before.actual !== null && after.actual !== null) {
          const beforeTime = new Date(before.date).getTime()
          const afterTime = new Date(after.date).getTime()
          const ratio = (currentTime - beforeTime) / (afterTime - beforeTime)
          value = before.actual + ratio * (after.actual - before.actual)
          value = Math.round(value)
        } else if (before && before.actual !== null) {
          value = before.actual
        } else if (after && after.actual !== null) {
          value = after.actual
        }

        normalizedData.push({
          date: new Date(currentDate).toISOString(),
          actual: value,
          forecast: null,
        })
      }

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    console.log("Normalized data result:", normalizedData)
  } catch (err) {
    console.error("Error in normalizeTimeSeriesData:", err)
    return []
  }

  return normalizedData
}
