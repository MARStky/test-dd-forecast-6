import type { DataPoint } from "@/lib/types"

interface ParseResult {
  headers: string[]
  rows: string[][]
  data: DataPoint[]
  error: string | null
}

/**
 * Parses CSV data into structured format
 */
export function parseCSVData(csvText: string, previewOnly = false): ParseResult {
  const result: ParseResult = {
    headers: [],
    rows: [],
    data: [],
    error: null,
  }

  try {
    // Split the CSV text into lines
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "")

    if (lines.length < 2) {
      result.error = "File must contain headers and at least one row of data"
      return result
    }

    // Parse headers
    result.headers = parseCSVLine(lines[0])
    console.log("CSV Headers:", result.headers)

    // Find required columns
    const dateColumnIndex = result.headers.findIndex(
      (h) => h.toLowerCase() === "date" || h.toLowerCase().includes("date"),
    )

    const valueColumnIndex = result.headers.findIndex(
      (h) =>
        h.toLowerCase() === "value" ||
        h.toLowerCase() === "sales" ||
        h.toLowerCase().includes("demand") ||
        h.toLowerCase().includes("quantity"),
    )

    if (dateColumnIndex === -1) {
      result.error = "Missing required 'date' column"
      return result
    }

    if (valueColumnIndex === -1) {
      result.error = "Missing required 'value' or 'sales' column"
      return result
    }

    console.log(`Found date column at index ${dateColumnIndex}, value column at index ${valueColumnIndex}`)

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i])

      if (row.length !== result.headers.length) {
        console.warn(`Row ${i} has ${row.length} columns, expected ${result.headers.length}`)
        continue // Skip malformed rows
      }

      result.rows.push(row)

      // If only preview is needed, don't process the data
      if (previewOnly) continue

      // Parse date and value
      const dateStr = row[dateColumnIndex]
      const valueStr = row[valueColumnIndex]

      // Try to parse the date
      let date: Date
      try {
        // First try direct ISO parsing
        date = new Date(dateStr)

        // If invalid, try other common formats
        if (isNaN(date.getTime())) {
          // Try MM/DD/YYYY or DD/MM/YYYY
          const parts = dateStr.split(/[/-]/)
          if (parts.length === 3) {
            // Try different date formats
            const possibleFormats = [
              // MM/DD/YYYY
              new Date(`${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`),
              // DD/MM/YYYY
              new Date(`${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`),
              // YYYY/MM/DD
              new Date(`${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`),
            ]

            // Find the first valid date
            for (const formatDate of possibleFormats) {
              if (!isNaN(formatDate.getTime())) {
                date = formatDate
                break
              }
            }
          }
        }

        // If still invalid, skip this row
        if (isNaN(date.getTime())) {
          console.warn(`Invalid date format: ${dateStr}`)
          continue
        }
      } catch (e) {
        console.warn(`Error parsing date: ${dateStr}`, e)
        continue // Skip rows with invalid dates
      }

      // Try to parse the value
      let value: number
      try {
        // Remove any currency symbols, commas, and trim whitespace
        const cleanValue = valueStr.replace(/[$,£€]/g, "").trim()
        value = Number.parseFloat(cleanValue)

        if (isNaN(value)) {
          console.warn(`Invalid numeric value: ${valueStr}`)
          continue // Skip rows with invalid values
        }
      } catch (e) {
        console.warn(`Error parsing value: ${valueStr}`, e)
        continue // Skip rows with invalid values
      }

      // Add to data array
      result.data.push({
        date: date.toISOString(),
        actual: value,
        forecast: null,
      })
    }

    // Sort data by date
    result.data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (result.data.length === 0 && !previewOnly) {
      result.error = "No valid data rows found"
    }

    console.log(`Parsed ${result.data.length} valid data points`)
    return result
  } catch (e) {
    console.error("CSV parsing error:", e)
    result.error = "Failed to parse CSV data"
    return result
  }
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      // Handle quotes
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Escaped quote inside quotes
        current += '"'
        i++
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current.trim())
      current = ""
    } else {
      // Add character to current field
      current += char
    }
  }

  // Add the last field
  result.push(current.trim())

  return result
}
