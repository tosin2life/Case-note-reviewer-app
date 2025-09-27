import { NextRequest, NextResponse } from 'next/server'
import { testGeminiConnection, getBestAvailableModel } from '@/lib/gemini'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Gemini model fix...')

    // Test 1: Get best available model
    const bestModel = await getBestAvailableModel()
    console.log(`Best available model: ${bestModel}`)

    // Test 2: Test connection
    const result = await testGeminiConnection()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Gemini API is working correctly',
        model: result.model,
        testResponse: result.response,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Gemini API connection failed',
          error: result.error,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Model fix test failed:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
