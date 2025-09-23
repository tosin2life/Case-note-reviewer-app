import { NextRequest, NextResponse } from 'next/server'
import { redactPII } from '@/lib/utils'
import {
  analyzeMedicalCase,
  analyzeCriterion,
  createUsageTracker,
  GeminiAPIError,
  PromptParsingError,
} from '@/lib/gemini'

// Simple in-memory IP rate limiting (15 requests/minute per IP)
const ipRequests = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_PER_MINUTE = 15

function getClientIp(req: NextRequest): string {
  const xfwd = req.headers.get('x-forwarded-for')
  if (xfwd) return xfwd.split(',')[0].trim()
  const xreal = req.headers.get('x-real-ip')
  if (xreal) return xreal
  return 'unknown'
}

function isRateLimited(ip: string): {
  limited: boolean
  remaining: number
  resetInMs: number
} {
  const now = Date.now()
  const record = ipRequests.get(ip)
  if (!record || now > record.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + 60_000 })
    return {
      limited: false,
      remaining: RATE_LIMIT_PER_MINUTE - 1,
      resetInMs: 60_000,
    }
  }
  if (record.count >= RATE_LIMIT_PER_MINUTE) {
    return {
      limited: true,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    }
  }
  record.count += 1
  ipRequests.set(ip, record)
  return {
    limited: false,
    remaining: RATE_LIMIT_PER_MINUTE - record.count,
    resetInMs: Math.max(0, record.resetAt - now),
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const limit = isRateLimited(ip)
    if (limit.limited) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many requests. Please try again shortly.',
          type: 'RateLimitError',
          retryAfterMs: limit.resetInMs,
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(limit.resetInMs / 1000).toString(),
          },
        }
      )
    }

    const body = await request.json()
    const { caseNote, criterion, useComprehensive } = body

    if (!caseNote || typeof caseNote !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Case note is required and must be a string',
        },
        { status: 400 }
      )
    }

    // Sanitize / redact PII from input before sending to AI
    const sanitizedCaseNote = redactPII(caseNote)

    // Create usage tracker for this request
    const tracker = createUsageTracker()

    let result

    if (useComprehensive) {
      // Analyze all criteria
      result = await analyzeMedicalCase(sanitizedCaseNote, tracker)
    } else if (criterion) {
      // Analyze specific criterion
      if (
        ![
          'historyPhysical',
          'differential',
          'assessmentPlan',
          'followup',
        ].includes(criterion)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              'Invalid criterion. Must be one of: historyPhysical, differential, assessmentPlan, followup',
          },
          { status: 400 }
        )
      }

      result = await analyzeCriterion(sanitizedCaseNote, criterion, tracker)
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Either criterion or useComprehensive must be specified',
        },
        { status: 400 }
      )
    }

    // Basic audit log (avoid logging full note)
    console.info('Analysis request', {
      ip,
      useComprehensive: !!useComprehensive,
      criterion: criterion || 'all',
      tokenCount: tracker.tokenCount,
      requestCount: tracker.requestCount,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      data: result,
      usage: {
        requestCount: tracker.requestCount,
        tokenCount: tracker.tokenCount,
        lastReset: tracker.lastReset,
      },
    })
  } catch (error) {
    console.error('Medical case analysis error:', error)

    if (error instanceof GeminiAPIError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          type: 'GeminiAPIError',
        },
        { status: 500 }
      )
    }

    if (error instanceof PromptParsingError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          type: 'PromptParsingError',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during medical case analysis',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET endpoint for testing with sample case notes
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testType = searchParams.get('test') || 'good'

  // Import sample case notes
  const { SAMPLE_CASE_NOTES } = await import('@/lib/prompts/medical-analysis')

  const sampleCase =
    SAMPLE_CASE_NOTES[testType as keyof typeof SAMPLE_CASE_NOTES] ||
    SAMPLE_CASE_NOTES.good

  return NextResponse.json({
    success: true,
    message: `Sample ${testType} case note for testing`,
    caseNote: sampleCase,
    instructions: {
      comprehensive: 'POST with {"caseNote": "...", "useComprehensive": true}',
      singleCriterion:
        'POST with {"caseNote": "...", "criterion": "historyPhysical"}',
      availableCriteria: [
        'historyPhysical',
        'differential',
        'assessmentPlan',
        'followup',
      ],
    },
  })
}
