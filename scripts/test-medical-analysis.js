/**
 * Test script for Medical Case Analysis Prompts
 * Run with: node scripts/test-medical-analysis.js
 */

import 'dotenv/config'

async function testMedicalAnalysis() {
  try {
    console.log('🧪 Testing Medical Case Analysis Prompts...\n')

    // Test comprehensive analysis with good case note
    console.log('1️⃣ Testing comprehensive analysis with good case note...')

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

    const response = await fetch('http://localhost:3000/api/analyze-case', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        caseNote: goodCaseNote,
        useComprehensive: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      console.log('✅ Comprehensive analysis successful!')
      console.log('📊 Total Score:', result.data.totalScore)
      console.log('📋 Criteria Scores:')
      console.log(
        `   History & Physical: ${result.data.historyPhysical.score}/3`
      )
      console.log(`   Differential: ${result.data.differential.score}/3`)
      console.log(`   Assessment & Plan: ${result.data.assessmentPlan.score}/3`)
      console.log(`   Follow-up: ${result.data.followup.score}/3`)
      console.log('📝 Overall Feedback:', result.data.overallFeedback)
    } else {
      console.log('❌ Analysis failed:', result.message)
    }

    // Test single criterion analysis
    console.log(
      '\n2️⃣ Testing single criterion analysis (History & Physical)...'
    )

    const singleResponse = await fetch(
      'http://localhost:3000/api/analyze-case',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseNote: goodCaseNote,
          criterion: 'historyPhysical',
        }),
      }
    )

    if (!singleResponse.ok) {
      throw new Error(`HTTP error! status: ${singleResponse.status}`)
    }

    const singleResult = await singleResponse.json()

    if (singleResult.success) {
      console.log('✅ Single criterion analysis successful!')
      console.log('📊 Score:', singleResult.data.score)
      console.log('📝 Feedback:', singleResult.data.feedback)
      console.log('💪 Strengths:', singleResult.data.strengths)
      console.log('🔧 Improvements:', singleResult.data.improvements)
    } else {
      console.log('❌ Single criterion analysis failed:', singleResult.message)
    }

    // Test with poor case note
    console.log('\n3️⃣ Testing with poor case note...')

    const poorCaseNote = `**Chief Complaint:** Patient has pain

**History:** Pain in chest for few days

**Exam:** Patient looks okay

**Plan:** Give pain medicine

**Follow-up:** Come back if needed`

    const poorResponse = await fetch('http://localhost:3000/api/analyze-case', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        caseNote: poorCaseNote,
        useComprehensive: true,
      }),
    })

    if (!poorResponse.ok) {
      throw new Error(`HTTP error! status: ${poorResponse.status}`)
    }

    const poorResult = await poorResponse.json()

    if (poorResult.success) {
      console.log('✅ Poor case analysis successful!')
      console.log('📊 Total Score:', poorResult.data.totalScore)
      console.log('📋 Criteria Scores:')
      console.log(
        `   History & Physical: ${poorResult.data.historyPhysical.score}/3`
      )
      console.log(`   Differential: ${poorResult.data.differential.score}/3`)
      console.log(
        `   Assessment & Plan: ${poorResult.data.assessmentPlan.score}/3`
      )
      console.log(`   Follow-up: ${poorResult.data.followup.score}/3`)
    } else {
      console.log('❌ Poor case analysis failed:', poorResult.message)
    }

    console.log('\n🎉 All medical analysis tests completed!')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n💡 Make sure your Next.js dev server is running:')
    console.log('   npm run dev')
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/test-gemini')
    if (response.ok) {
      console.log('✅ Server is running, starting tests...\n')
      return true
    }
  } catch {
    console.log('❌ Server not running. Please start the dev server first:')
    console.log('   npm run dev')
    console.log('\nThen run this test again.')
    return false
  }
}

// Run the test
checkServer().then(serverRunning => {
  if (serverRunning) {
    testMedicalAnalysis()
  }
})
