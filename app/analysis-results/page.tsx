'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FullPageSpinner } from '@/components/ui/spinner'
import {
  FileText,
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Brain,
  Target,
  Stethoscope,
  Calendar,
} from 'lucide-react'

interface AnalysisResult {
  historyPhysical: {
    score: number
    feedback: string
  }
  differential: {
    score: number
    feedback: string
  }
  assessmentPlan: {
    score: number
    feedback: string
  }
  followup: {
    score: number
    feedback: string
  }
  totalScore: number
  overallFeedback: string
}

interface UsageData {
  requestCount: number
  tokenCount: number
  lastReset: string
}

export default function AnalysisResultsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(
    null
  )
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [caseNotes, setCaseNotes] = useState<string>('')

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Load analysis results from localStorage
    try {
      const savedResults = localStorage.getItem('medical-case-analysis-results')
      const savedUsage = localStorage.getItem('medical-case-analysis-usage')
      const savedNotes = localStorage.getItem('medical-case-notes')

      if (savedResults) {
        setAnalysisResults(JSON.parse(savedResults))
      } else {
        // No results found, redirect back to case input
        router.push('/case-input')
        return
      }

      if (savedUsage) {
        setUsageData(JSON.parse(savedUsage))
      }

      if (savedNotes) {
        setCaseNotes(savedNotes)
      }
    } catch (error) {
      console.error('Error loading analysis results:', error)
      router.push('/case-input')
    } finally {
      setIsLoading(false)
    }
  }, [session, status, router])

  if (status === 'loading' || isLoading) {
    return <FullPageSpinner variant='medical' />
  }

  if (!session || !analysisResults) {
    return null
  }

  // Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 3) return 'text-green-600 bg-green-100'
    if (score >= 2) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  // Helper function to get score icon
  const getScoreIcon = (score: number) => {
    if (score >= 3) return <CheckCircle className='h-5 w-5' />
    if (score >= 2) return <AlertCircle className='h-5 w-5' />
    return <AlertCircle className='h-5 w-5' />
  }

  // Helper function to get overall grade
  const getOverallGrade = (totalScore: number) => {
    if (totalScore >= 10)
      return { grade: 'A', color: 'text-green-600 bg-green-100' }
    if (totalScore >= 8)
      return { grade: 'B', color: 'text-blue-600 bg-blue-100' }
    if (totalScore >= 6)
      return { grade: 'C', color: 'text-yellow-600 bg-yellow-100' }
    return { grade: 'D', color: 'text-red-600 bg-red-100' }
  }

  const overallGrade = getOverallGrade(analysisResults.totalScore)

  const criteria = [
    {
      key: 'historyPhysical',
      title: 'History & Physical',
      icon: <Stethoscope className='h-6 w-6' />,
      description:
        'Quality of patient history and physical examination documentation',
    },
    {
      key: 'differential',
      title: 'Differential Diagnosis',
      icon: <Brain className='h-6 w-6' />,
      description: 'Appropriateness and completeness of differential diagnosis',
    },
    {
      key: 'assessmentPlan',
      title: 'Assessment & Plan',
      icon: <Target className='h-6 w-6' />,
      description: 'Clinical assessment and treatment planning',
    },
    {
      key: 'followup',
      title: 'Follow-up',
      icon: <Calendar className='h-6 w-6' />,
      description: 'Follow-up recommendations and monitoring plan',
    },
  ]

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div className='flex items-center'>
              <FileText className='h-8 w-8 text-blue-600' />
              <h1 className='ml-2 text-2xl font-bold text-gray-900'>
                Analysis Results
              </h1>
            </div>
            <div className='flex items-center space-x-4'>
              <Link
                href='/case-input'
                className='flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md'
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
                New Analysis
              </Link>
              <Link
                href='/dashboard'
                className='flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md'
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        <div className='space-y-6'>
          {/* Overall Assessment */}
          <div className='bg-white shadow rounded-lg p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Overall Assessment
              </h2>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold ${overallGrade.color}`}
              >
                {overallGrade.grade}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-gray-900'>
                  {analysisResults.totalScore}
                </div>
                <div className='text-sm text-gray-500'>Total Score</div>
                <div className='text-xs text-gray-400'>Out of 12</div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-blue-600'>
                  {Math.round((analysisResults.totalScore / 12) * 100)}%
                </div>
                <div className='text-sm text-gray-500'>Percentage</div>
                <div className='text-xs text-gray-400'>Overall Performance</div>
              </div>
              <div className='text-center'>
                <TrendingUp className='h-8 w-8 mx-auto text-green-600 mb-1' />
                <div className='text-sm text-gray-500'>AI Analysis</div>
                <div className='text-xs text-gray-400'>
                  Comprehensive Review
                </div>
              </div>
            </div>

            <div className='bg-gray-50 rounded-lg p-4'>
              <h3 className='font-medium text-gray-900 mb-2'>
                Overall Feedback
              </h3>
              <p className='text-gray-700 leading-relaxed'>
                {analysisResults.overallFeedback}
              </p>
            </div>

            {/* Save Case Action */}
            <div className='mt-6 flex flex-col sm:flex-row gap-3'>
              <button
                onClick={async () => {
                  if (!caseNotes || caseNotes.length < 200) {
                    toast.error('Case notes are missing or too short to save.')
                    return
                  }
                  try {
                    setIsSaving(true)
                    const res = await fetch('/api/cases', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: caseNotes.slice(0, 80),
                        caseNotes,
                        totalScore: analysisResults.totalScore,
                        historyPhysical: analysisResults.historyPhysical,
                        differential: analysisResults.differential,
                        assessmentPlan: analysisResults.assessmentPlan,
                        followup: analysisResults.followup,
                        aiModelUsed: 'gemini',
                        processingTime: 0,
                        tokenUsage: usageData || null,
                      }),
                    })
                    const data = await res.json()
                    if (res.ok && data.success) {
                      toast.success('Case saved successfully!')
                      router.push('/case-input')
                    } else {
                      toast.error(data.message || 'Failed to save case.')
                    }
                  } catch (e) {
                    console.error(e)
                    toast.error('Network error while saving case.')
                  } finally {
                    setIsSaving(false)
                  }
                }}
                disabled={isSaving}
                className='w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSaving ? 'Saving…' : 'Save Case to History'}
              </button>
            </div>
          </div>

          {/* Detailed Criteria Scores */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {criteria.map(criterion => {
              const result = analysisResults[
                criterion.key as keyof AnalysisResult
              ] as { score: number; feedback: string }
              return (
                <div
                  key={criterion.key}
                  className='bg-white shadow rounded-lg p-6'
                >
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center space-x-3'>
                      <div className='text-blue-600'>{criterion.icon}</div>
                      <div>
                        <h3 className='text-lg font-medium text-gray-900'>
                          {criterion.title}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          {criterion.description}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.score)}`}
                    >
                      <span className='mr-1'>{getScoreIcon(result.score)}</span>
                      {result.score}/3
                    </div>
                  </div>

                  <div className='bg-gray-50 rounded-lg p-4'>
                    <h4 className='font-medium text-gray-900 mb-2'>
                      Detailed Feedback
                    </h4>
                    <p className='text-gray-700 text-sm leading-relaxed'>
                      {result.feedback}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Usage Information */}
          {usageData && (
            <div className='bg-white shadow rounded-lg p-6'>
              <div className='flex items-center space-x-2 mb-4'>
                <Clock className='h-5 w-5 text-gray-400' />
                <h3 className='text-lg font-medium text-gray-900'>
                  Analysis Information
                </h3>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                <div>
                  <span className='text-gray-500'>Request Count:</span>
                  <span className='ml-2 font-medium'>
                    {usageData.requestCount}
                  </span>
                </div>
                <div>
                  <span className='text-gray-500'>Token Usage:</span>
                  <span className='ml-2 font-medium'>
                    {usageData.tokenCount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className='text-gray-500'>Analysis Time:</span>
                  <span className='ml-2 font-medium'>
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/case-input'
              className='inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200'
            >
              <FileText className='h-5 w-5 mr-2' />
              Analyze Another Case
            </Link>
            <Link
              href='/dashboard'
              className='inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200'
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
