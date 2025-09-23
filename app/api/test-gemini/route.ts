import { NextRequest, NextResponse } from 'next/server'
import { testGeminiConnection, GeminiAPIError } from '@/lib/gemini'

export async function GET(request: NextRequest) {
  try {
    const result = await testGeminiConnection()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        response: result.response,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          error: result.error,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Gemini test endpoint error:', error)

    if (error instanceof GeminiAPIError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          statusCode: error.statusCode,
        },
        { status: error.statusCode || 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during Gemini API test',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
