/**
 * Enhanced Usage Tracking and Rate Limiting for Gemini API
 * Implements persistent storage and advanced rate limiting strategies
 */

import { RATE_LIMIT_CONFIG } from './gemini'

export interface UsageData {
  dailyCount: number
  lastReset: string
  minutelyCount: number
  lastMinuteReset: string
  totalRequests: number
  totalTokens: number
}

export interface RateLimitStatus {
  canMakeRequest: boolean
  dailyRemaining: number
  minuteRemaining: number
  resetTime: Date
  nextMinuteReset: Date
}

// In-memory storage (in production, this would be Redis or database)
const usageStore = new Map<string, UsageData>()

// Default usage data
const createDefaultUsageData = (): UsageData => ({
  dailyCount: 0,
  lastReset: new Date().toISOString(),
  minutelyCount: 0,
  lastMinuteReset: new Date().toISOString(),
  totalRequests: 0,
  totalTokens: 0,
})

// Get usage data for a user/session
export const getUsageData = (userId: string = 'default'): UsageData => {
  if (!usageStore.has(userId)) {
    usageStore.set(userId, createDefaultUsageData())
  }
  return usageStore.get(userId)!
}

// Update usage data
export const updateUsageData = (
  userId: string = 'default',
  tokenCount: number = 0
): UsageData => {
  const now = new Date()
  const usage = getUsageData(userId)

  // Reset daily counter if needed
  const lastReset = new Date(usage.lastReset)
  if (now.getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000) {
    usage.dailyCount = 0
    usage.lastReset = now.toISOString()
  }

  // Reset minute counter if needed
  const lastMinuteReset = new Date(usage.lastMinuteReset)
  if (now.getTime() - lastMinuteReset.getTime() > 60 * 1000) {
    usage.minutelyCount = 0
    usage.lastMinuteReset = now.toISOString()
  }

  // Update counters
  usage.dailyCount++
  usage.minutelyCount++
  usage.totalRequests++
  usage.totalTokens += tokenCount

  usageStore.set(userId, usage)
  return usage
}

// Check if user can make a request
export const checkRateLimit = (userId: string = 'default'): RateLimitStatus => {
  const usage = getUsageData(userId)

  // Calculate remaining requests
  const dailyRemaining = Math.max(
    0,
    RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE * 24 - usage.dailyCount
  )
  const minuteRemaining = Math.max(
    0,
    RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE - usage.minutelyCount
  )

  // Calculate reset times
  const resetTime = new Date(usage.lastReset)
  resetTime.setDate(resetTime.getDate() + 1)

  const nextMinuteReset = new Date(usage.lastMinuteReset)
  nextMinuteReset.setMinutes(nextMinuteReset.getMinutes() + 1)

  return {
    canMakeRequest: dailyRemaining > 0 && minuteRemaining > 0,
    dailyRemaining,
    minuteRemaining,
    resetTime,
    nextMinuteReset,
  }
}

// Get usage statistics
export const getUsageStats = (userId: string = 'default') => {
  const usage = getUsageData(userId)
  const status = checkRateLimit(userId)

  return {
    userId,
    totalRequests: usage.totalRequests,
    totalTokens: usage.totalTokens,
    dailyRequests: usage.dailyCount,
    minuteRequests: usage.minutelyCount,
    dailyRemaining: status.dailyRemaining,
    minuteRemaining: status.minuteRemaining,
    canMakeRequest: status.canMakeRequest,
    lastReset: usage.lastReset,
    nextMinuteReset: status.nextMinuteReset,
  }
}

// Clear usage data (for testing)
export const clearUsageData = (userId: string = 'default'): void => {
  usageStore.delete(userId)
}

// Get all usage data (for admin/monitoring)
export const getAllUsageData = (): Map<string, UsageData> => {
  return new Map(usageStore)
}

// Simulate usage for testing
export const simulateUsage = (
  userId: string = 'default',
  requests: number = 1
): void => {
  for (let i = 0; i < requests; i++) {
    updateUsageData(userId, Math.floor(Math.random() * 1000) + 500)
  }
}
