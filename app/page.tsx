'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { GraduationCap, ArrowRight } from 'lucide-react'
import { FullPageSpinner } from '@/components/ui/spinner'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (session) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <FullPageSpinner variant='medical' />
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col items-center justify-center min-h-screen text-center'>
          <div className='mb-8'>
            <div className='mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-4'>
              <GraduationCap className='h-8 w-8 text-blue-600' />
            </div>
            <h1 className='text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl'>
              Medical Case Reviewer
            </h1>
            <p className='mt-4 text-xl text-gray-600 max-w-2xl mx-auto'>
              AI-powered medical case analysis and review platform for
              healthcare professionals
            </p>
          </div>

          <div className='space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center'>
            <Link
              href='/auth/signup'
              className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              Get Started
              <ArrowRight className='ml-2 h-5 w-5' />
            </Link>
            <Link
              href='/auth/signin'
              className='inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              Sign In
            </Link>
          </div>

          <div className='mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            <div className='bg-white rounded-lg shadow-md p-6'>
              <div className='text-blue-600 text-2xl font-bold mb-2'>
                AI-Powered Analysis
              </div>
              <p className='text-gray-600'>
                Advanced AI algorithms analyze medical cases and provide
                detailed feedback on clinical reasoning.
              </p>
            </div>
            <div className='bg-white rounded-lg shadow-md p-6'>
              <div className='text-blue-600 text-2xl font-bold mb-2'>
                Comprehensive Scoring
              </div>
              <p className='text-gray-600'>
                Get detailed scores across multiple dimensions including
                history, physical exam, and differential diagnosis.
              </p>
            </div>
            <div className='bg-white rounded-lg shadow-md p-6'>
              <div className='text-blue-600 text-2xl font-bold mb-2'>
                Educational Platform
              </div>
              <p className='text-gray-600'>
                Perfect for medical students, residents, and healthcare
                professionals to improve their clinical skills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
