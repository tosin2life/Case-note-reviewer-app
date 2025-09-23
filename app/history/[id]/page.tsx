'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CaseDetail {
  id: string
  title: string | null
  caseNotes: string
  totalScore: number
  historyPhysicalScore: number
  historyPhysicalFeedback: string
  differentialScore: number
  differentialFeedback: string
  assessmentPlanScore: number
  assessmentPlanFeedback: string
  followupScore: number
  followupFeedback: string
  createdAt: string
}

export default function CaseDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [item, setItem] = useState<CaseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    setLoading(true)
    fetch(`/api/cases/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setItem(data.data)
      })
      .finally(() => setLoading(false))
  }, [session, status, params.id, router])

  if (status === 'loading' || loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className='min-h-screen flex items-center justify-center text-gray-600'>
        Case not found.
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        <div className='mb-4 flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900'>Case Details</h1>
          <div className='flex gap-3'>
            <Link href='/history' className='px-3 py-1 border rounded'>
              Back
            </Link>
            <button
              onClick={async () => {
                if (!confirm('Delete this case?')) return
                try {
                  setDeleting(true)
                  const res = await fetch(`/api/cases/${item.id}`, {
                    method: 'DELETE',
                  })
                  const data = await res.json()
                  if (res.ok && data.success) {
                    router.push('/history')
                  } else {
                    alert(data.message || 'Failed to delete case')
                  }
                } finally {
                  setDeleting(false)
                }
              }}
              disabled={deleting}
              className='px-3 py-1 border rounded text-red-600 border-red-300 disabled:opacity-50'
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6 space-y-6'>
          <div>
            <div className='text-sm text-gray-500'>Created</div>
            <div className='text-gray-900'>
              {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Title</div>
            <div className='text-gray-900'>{item.title || 'Untitled case'}</div>
          </div>
          <div>
            <div className='text-sm text-gray-500'>Total Score</div>
            <div className='text-gray-900 font-medium'>
              {item.totalScore} / 12
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-gray-50 rounded p-4'>
              <div className='font-medium text-gray-900 mb-1'>
                History & Physical ({item.historyPhysicalScore}/3)
              </div>
              <div className='text-sm text-gray-700 whitespace-pre-wrap'>
                {item.historyPhysicalFeedback}
              </div>
            </div>
            <div className='bg-gray-50 rounded p-4'>
              <div className='font-medium text-gray-900 mb-1'>
                Differential ({item.differentialScore}/3)
              </div>
              <div className='text-sm text-gray-700 whitespace-pre-wrap'>
                {item.differentialFeedback}
              </div>
            </div>
            <div className='bg-gray-50 rounded p-4'>
              <div className='font-medium text-gray-900 mb-1'>
                Assessment & Plan ({item.assessmentPlanScore}/3)
              </div>
              <div className='text-sm text-gray-700 whitespace-pre-wrap'>
                {item.assessmentPlanFeedback}
              </div>
            </div>
            <div className='bg-gray-50 rounded p-4'>
              <div className='font-medium text-gray-900 mb-1'>
                Follow-up ({item.followupScore}/3)
              </div>
              <div className='text-sm text-gray-700 whitespace-pre-wrap'>
                {item.followupFeedback}
              </div>
            </div>
          </div>

          <div>
            <div className='text-sm text-gray-500'>Case Notes</div>
            <pre className='text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded p-3'>
              {item.caseNotes}
            </pre>
          </div>
        </div>
      </main>
    </div>
  )
}
