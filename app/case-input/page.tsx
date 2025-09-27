'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { FileText, Save, ArrowLeft, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FullPageSpinner, ButtonSpinner } from '@/components/ui/spinner'

// Character limits
const MIN_CHARS = 200
const MAX_CHARS = 15000

export default function CaseInputPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [caseNotes, setCaseNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasBlurred, setHasBlurred] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Helper functions for character counting and validation
  const getCharacterCount = () => caseNotes.length
  const isCharacterCountValid = () => {
    const count = getCharacterCount()
    return count >= MIN_CHARS && count <= MAX_CHARS
  }
  const isCharacterCountTooLow = () => getCharacterCount() < MIN_CHARS
  const isCharacterCountTooHigh = () => getCharacterCount() > MAX_CHARS

  const getCharacterCountColor = () => {
    const count = getCharacterCount()
    if (count === 0) return 'text-gray-500'
    if (isCharacterCountValid()) return 'text-green-600'
    if (isCharacterCountTooLow()) return 'text-yellow-600'
    if (isCharacterCountTooHigh()) return 'text-red-600'
    return 'text-gray-500'
  }

  const getCharacterCountMessage = () => {
    const count = getCharacterCount()
    if (count === 0) return `Enter case notes (minimum ${MIN_CHARS} characters)`
    if (isCharacterCountValid())
      return `${count.toLocaleString()} / ${MAX_CHARS.toLocaleString()} characters`
    if (isCharacterCountTooLow())
      return `${count} / ${MIN_CHARS} characters (minimum required)`
    if (isCharacterCountTooHigh())
      return `${count} / ${MAX_CHARS.toLocaleString()} characters (exceeds limit)`
    return ''
  }

  // Comprehensive validation function
  const validateInput = () => {
    const errors: string[] = []
    const count = getCharacterCount()

    if (count === 0) {
      errors.push('Case notes are required')
    } else if (count < MIN_CHARS) {
      errors.push(`Case notes must be at least ${MIN_CHARS} characters long`)
    } else if (count > MAX_CHARS) {
      errors.push(
        `Case notes cannot exceed ${MAX_CHARS.toLocaleString()} characters`
      )
    }

    // Additional content validation
    const trimmedNotes = caseNotes.trim()
    if (trimmedNotes.length === 0 && count > 0) {
      errors.push('Case notes cannot consist only of whitespace')
    }

    // Check for meaningful content (basic heuristics)
    if (trimmedNotes.length >= MIN_CHARS) {
      const words = trimmedNotes.split(/\s+/).filter(word => word.length > 0)
      if (words.length < 10) {
        errors.push(
          'Case notes should contain meaningful medical content (at least 10 words)'
        )
      }
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  // Check if validation should be shown
  const shouldShowValidation = () => {
    return hasBlurred || caseNotes.length > 0
  }

  // Auto-save functionality
  const saveToLocalStorage = useCallback(async () => {
    if (caseNotes.trim().length === 0) return

    setAutoSaveStatus('saving')
    try {
      // Simulate a brief save operation
      await new Promise(resolve => setTimeout(resolve, 500))

      // Save to localStorage
      localStorage.setItem('medical-case-notes', caseNotes)
      localStorage.setItem(
        'medical-case-notes-timestamp',
        new Date().toISOString()
      )

      setAutoSaveStatus('saved')
      setLastSaved(new Date())

      // Reset to idle after showing "saved" for 2 seconds
      setTimeout(() => {
        setAutoSaveStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('Auto-save failed:', error)
      setAutoSaveStatus('error')

      // Reset to idle after showing error for 3 seconds
      setTimeout(() => {
        setAutoSaveStatus('idle')
      }, 3000)
    }
  }, [caseNotes])

  // Debounced auto-save
  const debouncedAutoSave = useCallback(() => {
    const timeoutId = setTimeout(() => {
      saveToLocalStorage()
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId)
  }, [saveToLocalStorage])

  // Clear any saved data when component mounts (fresh start)
  useEffect(() => {
    // Clear localStorage to ensure fresh start
    localStorage.removeItem('medical-case-notes')
    localStorage.removeItem('medical-case-notes-timestamp')

    // Reset state to ensure clean slate
    setCaseNotes('')
    setHasBlurred(false)
    setValidationErrors([])
    setAutoSaveStatus('idle')
    setLastSaved(null)
  }, [])

  // Auto-save effect
  useEffect(() => {
    if (caseNotes.length > 0) {
      const cleanup = debouncedAutoSave()
      return cleanup
    }
  }, [caseNotes, debouncedAutoSave])

  // Event handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaseNotes(e.target.value)
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const handleInputBlur = () => {
    setHasBlurred(true)
    validateInput()
  }

  const handleInputFocus = () => {
    // Optionally clear validation errors on focus for better UX
    // setValidationErrors([])
  }

  const handleClear = () => {
    setCaseNotes('')
    setHasBlurred(false)
    setValidationErrors([])
    setAutoSaveStatus('idle')
    setLastSaved(null)
    // Clear localStorage as well
    localStorage.removeItem('medical-case-notes')
    localStorage.removeItem('medical-case-notes-timestamp')
    toast.success('Case notes cleared')
  }

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <FullPageSpinner variant='medical' />
  }

  if (!session) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate input before submission
    if (!validateInput()) {
      toast.error('Please fix the validation errors before submitting.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/analyze-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseNote: caseNotes,
          useComprehensive: true,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store the analysis results in localStorage for the results page
        localStorage.setItem(
          'medical-case-analysis-results',
          JSON.stringify(data.data)
        )
        localStorage.setItem(
          'medical-case-analysis-usage',
          JSON.stringify(data.usage)
        )

        // Redirect to results page
        router.push('/analysis-results')
      } else {
        // Handle API errors
        const errorMessage =
          data.message || 'Analysis failed. Please try again.'
        toast.error(`Analysis Error: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error submitting case:', error)
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div className='flex items-center'>
              <FileText className='h-8 w-8 text-blue-600' />
              <h1 className='ml-2 text-2xl font-bold text-gray-900'>
                Case Input
              </h1>
            </div>
            <Link
              href='/dashboard'
              className='flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        <div className='py-6'>
          <div className='bg-white shadow rounded-lg'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h2 className='text-lg font-medium text-gray-900'>
                Medical Case Notes Input
              </h2>
              <p className='mt-1 text-sm text-gray-600'>
                Enter the medical case details for AI-powered analysis and
                review.
              </p>
            </div>

            <form onSubmit={handleSubmit} className='p-6'>
              <div>
                <label
                  htmlFor='caseNotes'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Case Notes
                </label>
                <textarea
                  id='caseNotes'
                  name='caseNotes'
                  rows={20}
                  value={caseNotes}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onFocus={handleInputFocus}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-colors duration-200 ${
                    shouldShowValidation() && validationErrors.length > 0
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder='Enter the medical case details here. Include patient history, symptoms, physical examination findings, lab results, imaging studies, and any other relevant clinical information...'
                  aria-describedby='case-notes-help case-notes-errors'
                  aria-invalid={
                    shouldShowValidation() && validationErrors.length > 0
                  }
                  aria-required='true'
                />
                {/* Help text */}
                <p id='case-notes-help' className='mt-1 text-xs text-gray-500'>
                  Enter comprehensive medical case details including patient
                  history, symptoms, examination findings, lab results, and
                  imaging studies. Minimum 200 characters required for
                  meaningful analysis.
                </p>

                <div className='mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0'>
                    <p
                      className={`text-sm font-medium ${getCharacterCountColor()}`}
                    >
                      {getCharacterCountMessage()}
                    </p>

                    {/* Auto-save status */}
                    {autoSaveStatus !== 'idle' && (
                      <div className='flex items-center space-x-2'>
                        {autoSaveStatus === 'saving' && (
                          <>
                            <ButtonSpinner className='h-3 w-3' />
                            <span className='text-xs text-blue-600'>
                              Saving...
                            </span>
                          </>
                        )}
                        {autoSaveStatus === 'saved' && (
                          <>
                            <div className='h-3 w-3 rounded-full bg-green-500'></div>
                            <span className='text-xs text-green-600'>
                              Saved
                            </span>
                          </>
                        )}
                        {autoSaveStatus === 'error' && (
                          <>
                            <div className='h-3 w-3 rounded-full bg-red-500'></div>
                            <span className='text-xs text-red-600'>
                              Save failed
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {lastSaved && autoSaveStatus === 'idle' && (
                      <span className='text-xs text-gray-500'>
                        Last saved: {lastSaved.toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  {caseNotes.length > 0 && (
                    <div
                      className={`text-xs px-2 py-1 rounded-full self-start sm:self-auto ${
                        isCharacterCountValid()
                          ? 'bg-green-100 text-green-700'
                          : isCharacterCountTooLow()
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isCharacterCountValid() ? 'Valid' : 'Invalid'}
                    </div>
                  )}
                </div>
              </div>

              <div className='mt-6 flex flex-col sm:flex-row sm:justify-end gap-3'>
                {caseNotes.length > 0 && (
                  <button
                    type='button'
                    onClick={handleClear}
                    className='w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200'
                  >
                    <X className='h-4 w-4 mr-2' />
                    Clear
                  </button>
                )}
                <button
                  type='submit'
                  disabled={
                    isLoading ||
                    validationErrors.length > 0 ||
                    !isCharacterCountValid()
                  }
                  className='w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
                >
                  {isLoading ? (
                    <>
                      <ButtonSpinner className='border-white' />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Save className='h-4 w-4 mr-2' />
                      Analyze Case
                    </>
                  )}
                </button>
              </div>

              {/* Comprehensive validation errors */}
              {shouldShowValidation() && validationErrors.length > 0 && (
                <div
                  id='case-notes-errors'
                  className='mt-4 p-4 bg-red-50 border border-red-200 rounded-md'
                  role='alert'
                  aria-live='polite'
                >
                  <div className='flex'>
                    <div className='flex-shrink-0'>
                      <svg
                        className='h-5 w-5 text-red-400'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                    <div className='ml-3'>
                      <h3 className='text-sm font-medium text-red-800'>
                        Please fix the following issues:
                      </h3>
                      <div className='mt-2 text-sm text-red-700'>
                        <ul className='list-disc list-inside space-y-1'>
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Legacy validation messages for backward compatibility */}
              {caseNotes.length > 0 &&
                isCharacterCountTooLow() &&
                validationErrors.length === 0 && (
                  <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
                    <p className='text-sm text-yellow-700'>
                      Please enter at least {MIN_CHARS} characters for a
                      meaningful case analysis. You currently have{' '}
                      {caseNotes.length} characters.
                    </p>
                  </div>
                )}

              {isCharacterCountTooHigh() && validationErrors.length === 0 && (
                <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-md'>
                  <p className='text-sm text-red-700'>
                    Case notes exceed the maximum limit of{' '}
                    {MAX_CHARS.toLocaleString()} characters. You currently have{' '}
                    {caseNotes.length.toLocaleString()} characters.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
