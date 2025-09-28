/**
 * Script to list available Gemini models using the REST API
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

async function listAvailableModels() {
  const apiKey = process.env.GOOGLE_API_KEY

  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY environment variable is not set')
  }

  console.log('🔑 API Key found, listing available models...')

  const baseUrl = 'https://generativelanguage.googleapis.com'
  
  // Try to list models using v1beta
  try {
    console.log('\n📋 Listing models from v1beta...')
    const v1betaResponse = await fetch(`${baseUrl}/v1beta/models?key=${apiKey}`)
    
    if (v1betaResponse.ok) {
      const result = await v1betaResponse.json()
      console.log('✅ v1beta models found:')
      if (result.models) {
        result.models.forEach(model => {
          console.log(`   - ${model.name} (${model.displayName || 'No display name'})`)
          if (model.supportedGenerationMethods) {
            console.log(`     Supported methods: ${model.supportedGenerationMethods.join(', ')}`)
          }
        })
      } else {
        console.log('   No models found in response')
      }
    } else {
      const error = await v1betaResponse.text()
      console.log(`❌ v1beta failed: ${v1betaResponse.status} - ${error}`)
    }
  } catch (error) {
    console.log(`❌ v1beta error: ${error.message}`)
  }

  // Try to list models using v1
  try {
    console.log('\n📋 Listing models from v1...')
    const v1Response = await fetch(`${baseUrl}/v1/models?key=${apiKey}`)
    
    if (v1Response.ok) {
      const result = await v1Response.json()
      console.log('✅ v1 models found:')
      if (result.models) {
        result.models.forEach(model => {
          console.log(`   - ${model.name} (${model.displayName || 'No display name'})`)
          if (model.supportedGenerationMethods) {
            console.log(`     Supported methods: ${model.supportedGenerationMethods.join(', ')}`)
          }
        })
      } else {
        console.log('   No models found in response')
      }
    } else {
      const error = await v1Response.text()
      console.log(`❌ v1 failed: ${v1Response.status} - ${error}`)
    }
  } catch (error) {
    console.log(`❌ v1 error: ${error.message}`)
  }
}

// Run the test
listAvailableModels().catch(console.error)
