import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Consistent number formatting to prevent hydration mismatches
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

// Consistent date formatting to prevent hydration mismatches
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US')
}