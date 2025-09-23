'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface CaseListItem {
  id: string
  title: string | null
  totalScore: number
  createdAt: string
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [items, setItems] = useState<CaseListItem[]>([])
  const [page, setPage] = useState<number>(
    Number(searchParams.get('page') || 1)
  )
  const [limit] = useState<number>(10)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [minScore, setMinScore] = useState<string>('')
  const [maxScore, setMaxScore] = useState<string>('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(limit))
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    if (minScore) params.set('minScore', minScore)
    if (maxScore) params.set('maxScore', maxScore)

    const url = `/api/cases?${params.toString()}`
    setLoading(true)
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setItems(data.data)
          setTotalPages(data.pagination.totalPages)
        }
      })
      .finally(() => setLoading(false))
  }, [
    session,
    status,
    page,
    limit,
    startDate,
    endDate,
    minScore,
    maxScore,
    router,
  ])

  if (status === 'loading' || loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-gray-900'>Case History</h1>
        </div>

        {/* Filters */}
        <div className='bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm text-gray-600 mb-1'>
              Start Date
            </label>
            <input
              type='date'
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className='w-full border rounded px-2 py-1'
            />
          </div>
          <div>
            <label className='block text-sm text-gray-600 mb-1'>End Date</label>
            <input
              type='date'
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className='w-full border rounded px-2 py-1'
            />
          </div>
          <div>
            <label className='block text-sm text-gray-600 mb-1'>
              Min Score
            </label>
            <input
              type='number'
              value={minScore}
              onChange={e => setMinScore(e.target.value)}
              className='w-full border rounded px-2 py-1'
            />
          </div>
          <div>
            <label className='block text-sm text-gray-600 mb-1'>
              Max Score
            </label>
            <input
              type='number'
              value={maxScore}
              onChange={e => setMaxScore(e.target.value)}
              className='w-full border rounded px-2 py-1'
            />
          </div>
        </div>

        {/* List */}
        <div className='bg-white rounded-lg shadow'>
          {items.length === 0 ? (
            <div className='p-6 text-gray-600'>No cases found.</div>
          ) : (
            <ul className='divide-y'>
              {items.map(item => (
                <li
                  key={item.id}
                  className='p-4 flex items-center justify-between'
                >
                  <div>
                    <div className='font-medium text-gray-900'>
                      {item.title || 'Untitled case'}
                    </div>
                    <div className='text-sm text-gray-500'>
                      Score: {item.totalScore} •{' '}
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Link
                      href={`/history/${item.id}`}
                      className='text-blue-600 hover:underline text-sm'
                    >
                      View
                    </Link>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this case?')) return
                        const res = await fetch(`/api/cases/${item.id}`, {
                          method: 'DELETE',
                        })
                        const data = await res.json()
                        if (res.ok && data.success) {
                          // refresh current page data
                          setItems(prev => prev.filter(x => x.id !== item.id))
                        } else {
                          alert(data.message || 'Failed to delete case')
                        }
                      }}
                      className='text-red-600 text-sm hover:underline'
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        <div className='mt-6 flex items-center justify-center gap-3'>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className='px-3 py-1 border rounded disabled:opacity-50'
          >
            Prev
          </button>
          <span className='text-sm text-gray-600'>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className='px-3 py-1 border rounded disabled:opacity-50'
          >
            Next
          </button>
        </div>
      </main>
    </div>
  )
}
