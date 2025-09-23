import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Create a case for the authenticated user
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const {
      title,
      caseNotes,
      totalScore,
      historyPhysical,
      differential,
      assessmentPlan,
      followup,
      aiModelUsed,
      processingTime,
      tokenUsage,
    } = body

    if (!caseNotes || typeof caseNotes !== 'string') {
      return NextResponse.json(
        { success: false, message: 'caseNotes is required' },
        { status: 400 }
      )
    }
    if (typeof totalScore !== 'number') {
      return NextResponse.json(
        { success: false, message: 'totalScore must be a number' },
        { status: 400 }
      )
    }

    // Expect each criterion object to have { score: number, feedback: string }
    const validateCriterion = (c: any, name: string) => {
      if (!c || typeof c.score !== 'number' || typeof c.feedback !== 'string') {
        throw new Error(
          `${name} must include numeric score and string feedback`
        )
      }
    }
    validateCriterion(historyPhysical, 'historyPhysical')
    validateCriterion(differential, 'differential')
    validateCriterion(assessmentPlan, 'assessmentPlan')
    validateCriterion(followup, 'followup')

    const created = await prisma.case.create({
      data: {
        userId: session.user.id,
        title: title ?? null,
        caseNotes,
        totalScore,
        historyPhysicalScore: historyPhysical.score,
        historyPhysicalFeedback: historyPhysical.feedback,
        differentialScore: differential.score,
        differentialFeedback: differential.feedback,
        assessmentPlanScore: assessmentPlan.score,
        assessmentPlanFeedback: assessmentPlan.feedback,
        followupScore: followup.score,
        followupFeedback: followup.feedback,
        aiModelUsed: aiModelUsed ?? 'gemini',
        processingTime: typeof processingTime === 'number' ? processingTime : 0,
        tokenUsage: tokenUsage ?? null,
      },
      select: { id: true },
    })

    return NextResponse.json({ success: true, id: created.id }, { status: 201 })
  } catch (error) {
    console.error('Create case error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create case' },
      { status: 500 }
    )
  }
}

// List cases for the authenticated user with pagination and filtering
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const limit = Math.min(
    50,
    Math.max(1, Number(searchParams.get('limit') || 10))
  )
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const minScore = searchParams.get('minScore')
  const maxScore = searchParams.get('maxScore')

  const where: any = { userId: session.user.id }
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) where.createdAt.lte = new Date(endDate)
  }
  if (minScore || maxScore) {
    where.totalScore = {}
    if (minScore) where.totalScore.gte = Number(minScore)
    if (maxScore) where.totalScore.lte = Number(maxScore)
  }

  try {
    const [items, total] = await Promise.all([
      prisma.case.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          totalScore: true,
          createdAt: true,
        },
      }),
      prisma.case.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List cases error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to list cases' },
      { status: 500 }
    )
  }
}
