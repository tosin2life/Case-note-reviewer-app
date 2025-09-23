import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Medical application specific utility functions
export function formatScore(score: number, maxScore: number = 12): string {
  return `${score}/${maxScore}`
}

export function getScoreColor(score: number, maxScore: number = 12): string {
  const percentage = (score / maxScore) * 100

  if (percentage >= 80) return 'text-success'
  if (percentage >= 60) return 'text-warning'
  return 'text-destructive'
}

export function getScoreLabel(score: number, maxScore: number = 12): string {
  const percentage = (score / maxScore) * 100

  if (percentage >= 80) return 'Excellent'
  if (percentage >= 60) return 'Good'
  if (percentage >= 40) return 'Fair'
  return 'Needs Improvement'
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Basic PII redaction for free-text inputs (best-effort client-side/server-side utility)
export function redactPII(input: string): string {
  let text = input
  // Emails
  text = text.replace(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    '[REDACTED_EMAIL]'
  )
  // Phone numbers (simple patterns)
  text = text.replace(/\+?\d[\d\s().-]{7,}\d/g, '[REDACTED_PHONE]')
  // MRN-like identifiers (alphanumeric 6-12)
  text = text.replace(/\b[0-9A-Z]{6,12}\b/gi, '[REDACTED_ID]')
  // Dates of birth formats like YYYY-MM-DD or MM/DD/YYYY
  text = text.replace(
    /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})\b/g,
    '[REDACTED_DATE]'
  )
  // Names preceded by labels (very naive)
  text = text.replace(/\b(Name|Patient)\s*:\s*[^\n]+/gi, '$1: [REDACTED_NAME]')
  return text
}

export function validateCaseNotes(text: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (text.length < 200) {
    errors.push('Case notes must be at least 200 characters long')
  }

  if (text.length > 15000) {
    errors.push('Case notes must be less than 15,000 characters')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
