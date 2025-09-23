'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, GraduationCap, ArrowLeft } from 'lucide-react'

interface FormData {
  email: string
}

interface FormErrors {
  [key: string]: string
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [formData, setFormData] = useState<FormData>({
    email: '',
  })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        setErrors({ general: data.error || 'Failed to send reset email' })
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  if (isSubmitted) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <div className='mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100'>
              <Mail className='h-6 w-6 text-green-600' />
            </div>
            <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
              Check your email
            </h2>
            <p className='mt-2 text-center text-sm text-gray-600'>
              We've sent a password reset link to{' '}
              <span className='font-medium text-gray-900'>{formData.email}</span>
            </p>
            <p className='mt-4 text-center text-sm text-gray-500'>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                try again
              </button>
            </p>
          </div>

          <div className='text-center'>
            <Link
              href='/auth/signin'
              className='inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500'
            >
              <ArrowLeft className='h-4 w-4 mr-1' />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100'>
            <GraduationCap className='h-6 w-6 text-blue-600' />
          </div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Forgot your password?
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          {errors.general && (
            <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md'>
              {errors.general}
            </div>
          )}

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'
            >
              Email Address
            </label>
            <div className='mt-1 relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Mail className='h-5 w-5 text-gray-400' />
              </div>
              <input
                id='email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleInputChange}
                className={`appearance-none relative block w-full pl-10 pr-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder='Enter your email address'
              />
            </div>
            {errors.email && (
              <p className='mt-1 text-sm text-red-600'>{errors.email}</p>
            )}
          </div>

          <div>
            <button
              type='submit'
              disabled={isLoading}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>

          <div className='text-center'>
            <Link
              href='/auth/signin'
              className='inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500'
            >
              <ArrowLeft className='h-4 w-4 mr-1' />
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
