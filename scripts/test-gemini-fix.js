const { testGeminiConnection, getGeminiModel } = require('../lib/gemini.ts')

async function testGeminiFix() {
  console.log('Testing Gemini API connection with model fallback...\n')
  
  try {
    // Test with default model
    console.log('1. Testing with default model (gemini-1.5-pro)...')
    const result1 = await testGeminiConnection()
    console.log('Result:', result1)
    console.log('')
    
    // Test with specific model
    console.log('2. Testing with gemini-1.5-flash...')
    const result2 = await testGeminiConnection('gemini-1.5-flash')
    console.log('Result:', result2)
    console.log('')
    
    // Test with gemini-pro as fallback
    console.log('3. Testing with gemini-pro...')
    const result3 = await testGeminiConnection('gemini-pro')
    console.log('Result:', result3)
    console.log('')
    
    // Test model instantiation
    console.log('4. Testing model instantiation...')
    try {
      const model = getGeminiModel('gemini-1.5-pro')
      console.log('✅ Successfully created model instance with gemini-1.5-pro')
    } catch (error) {
      console.log('❌ Failed to create model instance:', error.message)
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
testGeminiFix()
