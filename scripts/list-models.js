/**
 * Script to list available Gemini models
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

async function listAvailableModels() {
  try {
    const apiKey = process.env.GOOGLE_API_KEY

    if (!apiKey) {
      throw new Error(
        'GOOGLE_API_KEY environment variable is not set. Please add it to your .env file.'
      )
    }

    console.log('🔑 API Key found, initializing Gemini client...')

    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Try to list models
    console.log('📋 Attempting to list available models...')
    
    // Note: The listModels method might not be available in all versions
    // Let's try different approaches
    try {
      const models = await genAI.listModels()
      console.log('Available models:', models)
    } catch (error) {
      console.log('listModels not available:', error.message)
    }
    
    // Try different model names that might work
    const modelsToTry = [
      'gemini-pro',
      'gemini-pro-vision', 
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'models/gemini-pro',
      'models/gemini-pro-vision'
    ]
    
    console.log('\n🧪 Testing model availability...')
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        console.log(`✅ Model ${modelName} is available`)
        
        // Try a simple test
        const result = await model.generateContent('Hello')
        const response = await result.response
        console.log(`   Test response: ${response.text().substring(0, 50)}...`)
        break
      } catch (error) {
        console.log(`❌ Model ${modelName} failed: ${error.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run the test
listAvailableModels()
