/**
 * Test script to check Gemini API using REST API directly
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

async function testRestAPI() {
  const apiKey = process.env.GOOGLE_API_KEY

  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY environment variable is not set')
  }

  console.log('🔑 API Key found, testing REST API...')

  // Test different endpoints and models
  const baseUrl = 'https://generativelanguage.googleapis.com'
  const modelsToTest = [
    'gemini-pro',
    'gemini-pro-vision',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
  ]

  for (const model of modelsToTest) {
    console.log(`\n🧪 Testing model: ${model}`)
    
    try {
      // Test with v1beta
      const v1betaUrl = `${baseUrl}/v1beta/models/${model}:generateContent`
      console.log(`   Testing v1beta: ${v1betaUrl}`)
      
      const v1betaResponse = await fetch(`${v1betaUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello, this is a test message.'
            }]
          }]
        })
      })

      if (v1betaResponse.ok) {
        const result = await v1betaResponse.json()
        console.log(`   ✅ v1beta works! Response: ${JSON.stringify(result).substring(0, 100)}...`)
        break
      } else {
        const error = await v1betaResponse.text()
        console.log(`   ❌ v1beta failed: ${v1betaResponse.status} - ${error}`)
      }
    } catch (error) {
      console.log(`   ❌ v1beta error: ${error.message}`)
    }

    try {
      // Test with v1
      const v1Url = `${baseUrl}/v1/models/${model}:generateContent`
      console.log(`   Testing v1: ${v1Url}`)
      
      const v1Response = await fetch(`${v1Url}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello, this is a test message.'
            }]
          }]
        })
      })

      if (v1Response.ok) {
        const result = await v1Response.json()
        console.log(`   ✅ v1 works! Response: ${JSON.stringify(result).substring(0, 100)}...`)
        break
      } else {
        const error = await v1Response.text()
        console.log(`   ❌ v1 failed: ${v1Response.status} - ${error}`)
      }
    } catch (error) {
      console.log(`   ❌ v1 error: ${error.message}`)
    }
  }
}

// Run the test
testRestAPI().catch(console.error)
