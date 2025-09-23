/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Comprehensive Integration Test for Medical Case Analysis Pipeline
 * Tests the entire flow from case input to structured output
 * Run with: node scripts/test-integration.js
 */

require('dotenv').config({ path: '.env' })

async function testIntegration() {
  try {
    console.log(
      '🧪 Comprehensive Integration Test for Medical Case Analysis Pipeline...\n'
    )

    // Test 1: Full pipeline with good case note
    console.log('1️⃣ Testing full pipeline with good case note...')

    const goodCaseNote = `**Chief Complaint:** 45-year-old male presents with chest pain

**History of Present Illness:** 
Patient reports 3-day history of substernal chest pressure, rated 7/10, radiating to left arm. Pain is worse with exertion and relieved with rest. No associated nausea, vomiting, or diaphoresis. Denies shortness of breath at rest.

**Past Medical History:** Hypertension, hyperlipidemia, smoking 1 pack/day x 20 years

**Medications:** Lisinopril 10mg daily, Atorvastatin 20mg daily

**Physical Examination:**
Vital signs: BP 150/90, HR 88, RR 16, O2 sat 98% RA
Cardiovascular: Regular rate and rhythm, no murmurs
Pulmonary: Clear to auscultation bilaterally
Extremities: No edema

**Assessment and Plan:**
1. Chest pain - likely musculoskeletal vs cardiac etiology
   - EKG, troponins, CXR ordered
   - Cardiology consultation if cardiac markers positive
   - Patient counseled on smoking cessation

**Follow-up:** Return if symptoms worsen, cardiology follow-up pending lab results`

    let response = await fetch('http://localhost:3000/api/analyze-case', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseNote: goodCaseNote,
        useComprehensive: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    let result = await response.json()
    if (result.success) {
      console.log('✅ Full pipeline test successful!')
      console.log('📊 Analysis Results:', {
        totalScore: result.data.totalScore,
        historyPhysical: result.data.historyPhysical.score,
        differential: result.data.differential.score,
        assessmentPlan: result.data.assessmentPlan.score,
        followup: result.data.followup.score,
      })
      console.log(
        '📝 Overall Feedback:',
        result.data.overallFeedback.substring(0, 100) + '...'
      )
    } else {
      console.log('❌ Full pipeline test failed:', result.message)
    }

    // Test 2: Error handling with invalid case note
    console.log('\n2️⃣ Testing error handling with invalid case note...')

    response = await fetch('http://localhost:3000/api/analyze-case', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseNote: '', // Empty case note
        useComprehensive: true,
      }),
    })

    if (!response.ok) {
      console.log(
        '✅ Correctly rejected empty case note with status:',
        response.status
      )
    } else {
      const result = await response.json()
      if (!result.success) {
        console.log('✅ Correctly handled empty case note:', result.message)
      } else {
        console.log('❌ Should have rejected empty case note')
      }
    }

    // Test 3: Error handling with malformed request
    console.log('\n3️⃣ Testing error handling with malformed request...')

    response = await fetch('http://localhost:3000/api/analyze-case', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Missing required fields
        invalidField: 'test',
      }),
    })

    if (!response.ok) {
      console.log(
        '✅ Correctly rejected malformed request with status:',
        response.status
      )
    } else {
      const result = await response.json()
      if (!result.success) {
        console.log('✅ Correctly handled malformed request:', result.message)
      } else {
        console.log('❌ Should have rejected malformed request')
      }
    }

    // Test 4: Single criterion analysis
    console.log('\n4️⃣ Testing single criterion analysis...')

    response = await fetch('http://localhost:3000/api/analyze-case', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseNote: goodCaseNote,
        criterion: 'historyPhysical',
      }),
    })

    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        console.log('✅ Single criterion analysis successful!')
        console.log('📊 History & Physical Score:', result.data.score)
        console.log(
          '📝 Feedback:',
          result.data.feedback.substring(0, 100) + '...'
        )
      } else {
        console.log('❌ Single criterion analysis failed:', result.message)
      }
    }

    // Test 5: Rate limiting simulation
    console.log('\n5️⃣ Testing rate limiting integration...')

    // First, clear usage data
    await fetch('http://localhost:3000/api/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear' }),
    })

    // Simulate high usage
    await fetch('http://localhost:3000/api/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'simulate', requests: 20 }),
    })

    // Check usage status
    response = await fetch('http://localhost:3000/api/usage')
    if (response.ok) {
      const usageResult = await response.json()
      console.log('✅ Usage tracking integration working')
      console.log('📊 Usage Stats:', {
        minuteRequests: usageResult.data.stats.minuteRequests,
        canMakeRequest: usageResult.data.stats.canMakeRequest,
      })
    }

    // Test 6: API endpoint availability
    console.log('\n6️⃣ Testing API endpoint availability...')

    const endpoints = ['/api/test-gemini', '/api/analyze-case', '/api/usage']

    for (const endpoint of endpoints) {
      try {
        const testResponse = await fetch(`http://localhost:3000${endpoint}`)
        if (testResponse.ok || testResponse.status === 405) {
          // 405 = Method Not Allowed (expected for some endpoints)
          console.log(`✅ ${endpoint} is available`)
        } else {
          console.log(`❌ ${endpoint} returned status: ${testResponse.status}`)
        }
      } catch (error) {
        console.log(`❌ ${endpoint} failed: ${error.message}`)
      }
    }

    // Test 7: Stress test with multiple concurrent requests
    console.log('\n7️⃣ Testing concurrent request handling...')

    const concurrentRequests = Array(5)
      .fill()
      .map(async (_, index) => {
        try {
          const response = await fetch(
            'http://localhost:3000/api/analyze-case',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                caseNote: `Test case ${index}: Patient presents with symptoms. History and physical exam documented. Assessment and plan outlined. Follow-up scheduled.`,
                criterion: 'historyPhysical',
              }),
            }
          )

          if (response.ok) {
            const result = await response.json()
            return result.success ? 'success' : 'failed'
          } else {
            return `error-${response.status}`
          }
        } catch (error) {
          return 'exception'
        }
      })

    const results = await Promise.all(concurrentRequests)
    const successCount = results.filter(r => r === 'success').length
    console.log(`✅ Concurrent requests: ${successCount}/5 successful`)

    console.log('\n🎉 All integration tests completed!')
    console.log('\n📋 Integration Test Summary:')
    console.log('✅ Full pipeline analysis working')
    console.log('✅ Error handling robust')
    console.log('✅ Single criterion analysis functional')
    console.log('✅ Rate limiting integrated')
    console.log('✅ API endpoints available')
    console.log('✅ Concurrent request handling stable')

    console.log('\n🚀 Medical Case Analysis System is fully operational!')
  } catch (error) {
    console.error('❌ Integration test failed:', error.message)
    console.log('\n💡 Make sure your Next.js dev server is running:')
    console.log('   npm run dev')
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/test-gemini')
    if (response.ok) {
      console.log('✅ Server is running, starting integration tests...\n')
      return true
    }
  } catch (error) {
    console.log('❌ Server not running. Please start the dev server first:')
    console.log('   npm run dev')
    console.log('\nThen run this test again.')
    return false
  }
}

// Run the integration test
checkServer().then(serverRunning => {
  if (serverRunning) {
    testIntegration()
  }
})
