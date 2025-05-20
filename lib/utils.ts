import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    console.warn("Invalid date passed to formatDate:", date)
    return "Invalid Date"
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(date)
  } catch (e) {
    console.error("Error formatting date:", date, e)
    return date.toString()
  }
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "-"
  }

  try {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(value)
  } catch (e) {
    console.error("Error formatting number:", value, e)
    return value.toString()
  }
}
