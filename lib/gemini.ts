import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Google Gemini AI client
export const initializeGemini = () => {
  const apiKey = process.env.GOOGLE_API_KEY

  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY environment variable is not set')
  }

  return new GoogleGenerativeAI(apiKey)
}

// Get the Gemini model instance
export const getGeminiModel = (modelName: string = 'gemini-1.5-flash') => {
  const genAI = initializeGemini()
  return genAI.getGenerativeModel({ model: modelName })
}

// Test connection to Gemini API
export const testGeminiConnection = async () => {
  try {
    const model = getGeminiModel()
    const result = await model.generateContent('Hello, this is a test message.')
    const response = await result.response
    return {
      success: true,
      message: 'Successfully connected to Gemini API',
      response: response.text(),
    }
  } catch (error) {
    console.error('Gemini API connection test failed:', error)
    return {
      success: false,
      message: 'Failed to connect to Gemini API',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Custom error types for Gemini API
export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'GeminiAPIError'
  }
}

export class PromptParsingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PromptParsingError'
  }
}

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS_PER_MINUTE: 15, // Gemini free tier limit
  MAX_TOKENS_PER_REQUEST: 32000, // Gemini 1.5 Flash limit
  MAX_OUTPUT_TOKENS: 8192,
}

// Usage tracking interface
export interface UsageTracker {
  requestCount: number
  tokenCount: number
  lastReset: Date
}

// Initialize usage tracker
export const createUsageTracker = (): UsageTracker => ({
  requestCount: 0,
  tokenCount: 0,
  lastReset: new Date(),
})

// Check if rate limit is exceeded
export const checkRateLimit = (tracker: UsageTracker): boolean => {
  const now = new Date()
  const timeDiff = now.getTime() - tracker.lastReset.getTime()

  // Reset counter if more than 1 minute has passed
  if (timeDiff > 60000) {
    tracker.requestCount = 0
    tracker.tokenCount = 0
    tracker.lastReset = now
  }

  return tracker.requestCount < RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE
}

// Update usage tracker
export const updateUsageTracker = (
  tracker: UsageTracker,
  tokenCount: number
): void => {
  tracker.requestCount++
  tracker.tokenCount += tokenCount
}

// Medical case analysis functions
import {
  HISTORY_PHYSICAL_PROMPT,
  DIFFERENTIAL_DIAGNOSIS_PROMPT,
  ASSESSMENT_TREATMENT_PROMPT,
  FOLLOW_UP_PROMPT,
  COMPREHENSIVE_ANALYSIS_PROMPT,
  AnalysisResult,
} from './prompts/medical-analysis'
import {
  checkRateLimit as checkAdvancedRateLimit,
  updateUsageData,
} from './usage-tracker'

// Analyze a single criterion
export const analyzeCriterion = async (
  caseNote: string,
  criterion: 'historyPhysical' | 'differential' | 'assessmentPlan' | 'followup',
  tracker?: UsageTracker,
  userId?: string
): Promise<{
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
  evidence: string
}> => {
  try {
    // Check advanced rate limiting if userId provided
    if (userId) {
      const rateLimitStatus = checkAdvancedRateLimit(userId)
      if (!rateLimitStatus.canMakeRequest) {
        throw new GeminiAPIError(
          `Rate limit exceeded. Daily remaining: ${rateLimitStatus.dailyRemaining}, Minute remaining: ${rateLimitStatus.minuteRemaining}`
        )
      }
    }

    // Check legacy rate limiting if tracker provided
    if (tracker && !checkRateLimit(tracker)) {
      throw new GeminiAPIError(
        'Rate limit exceeded. Please wait before making another request.'
      )
    }

    const model = getGeminiModel()

    let prompt: string
    switch (criterion) {
      case 'historyPhysical':
        prompt = HISTORY_PHYSICAL_PROMPT(caseNote)
        break
      case 'differential':
        prompt = DIFFERENTIAL_DIAGNOSIS_PROMPT(caseNote)
        break
      case 'assessmentPlan':
        prompt = ASSESSMENT_TREATMENT_PROMPT(caseNote)
        break
      case 'followup':
        prompt = FOLLOW_UP_PROMPT(caseNote)
        break
      default:
        throw new Error(`Unknown criterion: ${criterion}`)
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Update usage tracker
    if (tracker) {
      updateUsageTracker(tracker, text.length)
    }

    // Update advanced usage tracking
    if (userId) {
      updateUsageData(userId, text.length)
    }

    // Parse JSON response
    try {
      // Clean the response text to handle markdown code blocks
      let cleanText = text.trim()

      // Remove markdown code block markers if present
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }

      const parsed = JSON.parse(cleanText)
      return {
        score: parsed.score,
        feedback: parsed.feedback,
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        evidence: parsed.evidence || '',
      }
    } catch (parseError) {
      throw new PromptParsingError(
        `Failed to parse AI response for ${criterion}: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
      )
    }
  } catch (error) {
    if (
      error instanceof GeminiAPIError ||
      error instanceof PromptParsingError
    ) {
      throw error
    }
    throw new GeminiAPIError(
      `Failed to analyze ${criterion}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// Analyze all criteria for a medical case note
export const analyzeMedicalCase = async (
  caseNote: string,
  tracker?: UsageTracker,
  userId?: string
): Promise<AnalysisResult> => {
  try {
    // Check advanced rate limiting if userId provided
    if (userId) {
      const rateLimitStatus = checkAdvancedRateLimit(userId)
      if (!rateLimitStatus.canMakeRequest) {
        throw new GeminiAPIError(
          `Rate limit exceeded. Daily remaining: ${rateLimitStatus.dailyRemaining}, Minute remaining: ${rateLimitStatus.minuteRemaining}`
        )
      }
    }

    // Check legacy rate limiting if tracker provided
    if (tracker && !checkRateLimit(tracker)) {
      throw new GeminiAPIError(
        'Rate limit exceeded. Please wait before making another request.'
      )
    }

    const model = getGeminiModel()
    const prompt = COMPREHENSIVE_ANALYSIS_PROMPT(caseNote)

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Update usage tracker
    if (tracker) {
      updateUsageTracker(tracker, text.length)
    }

    // Update advanced usage tracking
    if (userId) {
      updateUsageData(userId, text.length)
    }

    // Parse JSON response
    try {
      // Clean the response text to handle markdown code blocks
      let cleanText = text.trim()

      // Remove markdown code block markers if present
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }

      const parsed = JSON.parse(cleanText)

      // Validate response structure (PRD format)
      if (
        !parsed.historyPhysical ||
        !parsed.differential ||
        !parsed.assessmentPlan ||
        !parsed.followup
      ) {
        throw new PromptParsingError(
          'Invalid response structure: missing required criteria fields'
        )
      }

      return {
        historyPhysical: parsed.historyPhysical,
        differential: parsed.differential,
        assessmentPlan: parsed.assessmentPlan,
        followup: parsed.followup,
        totalScore: parsed.totalScore || 0,
        overallFeedback: parsed.overallFeedback || '',
      } as AnalysisResult
    } catch (parseError) {
      throw new PromptParsingError(
        `Failed to parse comprehensive analysis response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
      )
    }
  } catch (error) {
    if (
      error instanceof GeminiAPIError ||
      error instanceof PromptParsingError
    ) {
      throw error
    }
    throw new GeminiAPIError(
      `Failed to analyze medical case: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
