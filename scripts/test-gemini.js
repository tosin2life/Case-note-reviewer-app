/**
 * Test script for Google Gemini API connection
 * Run with: node scripts/test-gemini.js
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

async function testGeminiConnection() {
  try {
    const apiKey = process.env.GOOGLE_API_KEY

    if (!apiKey) {
      throw new Error(
        'GOOGLE_API_KEY environment variable is not set. Please add it to your .env file.'
      )
    }

    console.log('🔑 API Key found, initializing Gemini client...')

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    console.log('🧪 Testing Gemini API connection...')

    const result = await model.generateContent(
      'Hello, this is a test message. Please respond with "Connection successful!"'
    )
    const response = await result.response
    const text = response.text()

    console.log('✅ Gemini API connection successful!')
    console.log('📝 Response:', text)

    return { success: true, response: text }
  } catch (error) {
    console.error('❌ Gemini API connection failed:')
    console.error('Error:', error.message)

    if (error.message.includes('API_KEY')) {
      console.log('\n💡 To fix this:')
      console.log(
        '1. Get your API key from: https://makersuite.google.com/app/apikey'
      )
      console.log(
        '2. Add GOOGLE_API_KEY to your .env file in your project root'
      )
      console.log('3. Add: GOOGLE_API_KEY=your_actual_api_key_here')
    }

    return { success: false, error: error.message }
  }
}

// Run the test
testGeminiConnection().then(result => {
  if (result.success) {
    console.log('\n🎉 Gemini API is ready for medical case analysis!')
    process.exit(0)
  } else {
    console.log('\n🔧 Please fix the configuration and try again.')
    process.exit(1)
  }
})
