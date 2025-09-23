'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GraduationCap, Building, LogOut, User, FileText } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recentCases, setRecentCases] = useState<
    {
      id: string
      title: string | null
      totalScore: number
      createdAt: string
    }[]
  >([])
  const [totalCases, setTotalCases] = useState<number>(0)
  const [loadingCases, setLoadingCases] = useState<boolean>(true)
  const maxScore = 12

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        setLoadingCases(true)
        const res = await fetch('/api/cases?limit=5&page=1')
        const data = await res.json()
        if (!ignore && data?.success) {
          setRecentCases(data.data)
          setTotalCases(data.pagination?.total ?? 0)
        }
      } catch (e) {
        // soft-fail
      } finally {
        if (!ignore) setLoadingCases(false)
      }
    }
    if (status === 'authenticated') load()
    return () => {
      ignore = true
    }
  }, [status])

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div className='flex items-center'>
              <GraduationCap className='h-8 w-8 text-blue-600' />
              <h1 className='ml-2 text-2xl font-bold text-gray-900'>
                Medical Case Reviewer
              </h1>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='text-sm text-gray-700'>
                Welcome, {session.user?.name}
              </div>
              <button
                onClick={handleSignOut}
                className='flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md'
              >
                <LogOut className='h-4 w-4 mr-2' />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          <div className='border-4 border-dashed border-gray-200 rounded-lg p-8'>
            <div className='text-center'>
              <User className='mx-auto h-12 w-12 text-gray-400' />
              <h2 className='mt-4 text-2xl font-bold text-gray-900'>
                Welcome to your Dashboard
              </h2>
              <p className='mt-2 text-gray-600'>
                You are successfully authenticated!
              </p>

              {/* User Info Card */}
              <div className='mt-8 max-w-md mx-auto bg-white rounded-lg shadow-md p-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>
                  Your Profile
                </h3>
                <div className='space-y-3'>
                  <div className='flex items-center'>
                    <User className='h-5 w-5 text-gray-400 mr-3' />
                    <span className='text-sm text-gray-600'>Name:</span>
                    <span className='ml-2 text-sm font-medium text-gray-900'>
                      {session.user?.name || 'Not provided'}
                    </span>
                  </div>
                  <div className='flex items-center'>
                    <GraduationCap className='h-5 w-5 text-gray-400 mr-3' />
                    <span className='text-sm text-gray-600'>Role:</span>
                    <span className='ml-2 text-sm font-medium text-gray-900'>
                      {session.user?.role || 'Not specified'}
                    </span>
                  </div>
                  <div className='flex items-center'>
                    <Building className='h-5 w-5 text-gray-400 mr-3' />
                    <span className='text-sm text-gray-600'>Institution:</span>
                    <span className='ml-2 text-sm font-medium text-gray-900'>
                      {session.user?.institution || 'Not specified'}
                    </span>
                  </div>
                  <div className='flex items-center'>
                    <span className='text-sm text-gray-600'>Email:</span>
                    <span className='ml-2 text-sm font-medium text-gray-900'>
                      {session.user?.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center'>
                <Link
                  href='/case-input'
                  className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                >
                  <FileText className='h-5 w-5 mr-2' />
                  Start Case Analysis
                </Link>
                <Link
                  href='/history'
                  className='inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                >
                  View Case History ({totalCases})
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Cases & Overview */}
        <div className='px-4 py-6 sm:px-0'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 bg-white rounded-lg shadow p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Recent Cases
                </h3>
                <Link
                  href='/history'
                  className='text-sm text-blue-600 hover:underline'
                >
                  See all
                </Link>
              </div>
              {loadingCases ? (
                <div className='text-sm text-gray-500'>
                  Loading recent cases…
                </div>
              ) : recentCases.length === 0 ? (
                <div className='text-sm text-gray-500'>No saved cases yet.</div>
              ) : (
                <ul className='divide-y'>
                  {recentCases.map(c => (
                    <li
                      key={c.id}
                      className='py-3 flex items-center justify-between'
                    >
                      <div>
                        <div className='font-medium text-gray-900'>
                          {c.title || 'Untitled case'}
                        </div>
                        <div className='text-sm text-gray-500'>
                          Score: {c.totalScore} •{' '}
                          {new Date(c.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <Link
                        href={`/history/${c.id}`}
                        className='text-sm text-blue-600 hover:underline'
                      >
                        Open
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Overview
              </h3>
              <div className='space-y-3 text-sm text-gray-700'>
                <div className='flex items-center justify-between'>
                  <span>Total saved cases</span>
                  <span className='font-medium'>{totalCases}</span>
                </div>
                {recentCases.length > 0 && (
                  <div className='flex items-center justify-between'>
                    <span>Last score</span>
                    <span className='font-medium'>
                      {recentCases[0].totalScore}/12
                    </span>
                  </div>
                )}
                {recentCases.length > 1 && (
                  <div className='flex items-center justify-between'>
                    <span>Avg (recent)</span>
                    <span className='font-medium'>
                      {(
                        recentCases.reduce((a, b) => a + b.totalScore, 0) /
                        recentCases.length
                      ).toFixed(1)}
                      /12
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Score Trend (recent) */}
        <div className='px-4 py-6 sm:px-0'>
          <div className='bg-white rounded-lg shadow p-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Score Trend (recent)
            </h3>
            {recentCases.length < 2 ? (
              <div className='text-sm text-gray-500'>
                Not enough data to display a trend.
              </div>
            ) : (
              <div className='w-full overflow-x-auto'>
                {(() => {
                  const width = 400
                  const height = 100
                  const padding = 10
                  const ordered = [...recentCases].reverse() // oldest -> newest
                  const points = ordered.map((c, i, arr) => {
                    const x =
                      padding +
                      (i * (width - 2 * padding)) / Math.max(1, arr.length - 1)
                    const y =
                      height -
                      padding -
                      (c.totalScore / maxScore) * (height - 2 * padding)
                    return { x, y }
                  })
                  const path = points
                    .map((p, i) =>
                      i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`
                    )
                    .join(' ')
                  return (
                    <svg
                      viewBox={`0 0 ${width} ${height}`}
                      className='w-full max-w-xl'
                    >
                      <rect
                        x='0'
                        y='0'
                        width={width}
                        height={height}
                        fill='transparent'
                      />
                      <path
                        d={path}
                        stroke='#2563eb'
                        strokeWidth='2'
                        fill='none'
                      />
                      {points.map((p, i) => (
                        <circle
                          key={i}
                          cx={p.x}
                          cy={p.y}
                          r='2'
                          fill='#2563eb'
                        />
                      ))}
                      <text x={4} y={height - 2} fontSize='10' fill='#6b7280'>
                        0
                      </text>
                      <text x={4} y={12} fontSize='10' fill='#6b7280'>
                        {maxScore}
                      </text>
                    </svg>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
