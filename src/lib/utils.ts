import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate employee ID in format: EMP{year}{sequential}
 * Example: EMP2026001, EMP2026002, etc.
 */
export function generateEmployeeId(lastEmployeeId?: string): string {
  const currentYear = new Date().getFullYear()
  const yearStr = currentYear.toString()
  const prefix = `EMP${yearStr}`

  if (!lastEmployeeId || !lastEmployeeId.startsWith(prefix)) {
    return `${prefix}001`
  }

  // Extract the number after the prefix
  let seqPart = lastEmployeeId.substring(prefix.length)

  // If the sequence part starts with the year again (e.g. "2026002" after "EMP2026"),
  // it means the ID was corrupted by a previous bug. Strip the extra year.
  if (seqPart.startsWith(yearStr) && seqPart.length > yearStr.length) {
    seqPart = seqPart.substring(yearStr.length)
  }

  const lastNumber = parseInt(seqPart)
  if (isNaN(lastNumber)) {
    return `${prefix}001`
  }

  const nextNumber = lastNumber + 1
  // Pad with zeros to maintain at least the same length as before or 3 digits
  const paddedNumber = nextNumber.toString().padStart(Math.max(3, seqPart.length), '0')

  return `${prefix}${paddedNumber}`
}

/**
 * Format date to YYYY-MM-DD for database storage
 */
export function formatDateForDb(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Format display name (First Last)
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
}
