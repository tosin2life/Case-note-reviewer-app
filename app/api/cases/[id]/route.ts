import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  context: { params: Record<string, string> }
) {
  const { id } = context.params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }
  try {
    const item = await prisma.case.findFirst({
      where: { id, userId: session.user.id },
      select: {
        id: true,
        title: true,
        caseNotes: true,
        totalScore: true,
        historyPhysicalScore: true,
        historyPhysicalFeedback: true,
        differentialScore: true,
        differentialFeedback: true,
        assessmentPlanScore: true,
        assessmentPlanFeedback: true,
        followupScore: true,
        followupFeedback: true,
        createdAt: true,
      },
    })
    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Get case error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch case' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Record<string, string> }
) {
  const { id } = context.params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }
  try {
    // Ensure ownership first
    const existing = await prisma.case.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Not found' },
        { status: 404 }
      )
    }
    await prisma.case.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete case error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete case' },
      { status: 500 }
    )
  }
}
