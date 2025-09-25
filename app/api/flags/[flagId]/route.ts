import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { flagOperations } from '@/lib/db-operations'
import { z } from 'zod'

const FlagActionSchema = z.object({
  action: z.enum(['resolved', 'dismissed']),
  moderatorNotes: z.string().optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { flagId: string } }
) {
  try {
    const { userId, sessionClaims } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user has admin/moderator role
    const userRole = sessionClaims?.metadata?.role || 'user'
    if (userRole !== 'admin' && userRole !== 'moderator') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { action, moderatorNotes } = FlagActionSchema.parse(body)
    const { flagId } = params

    // Find the flag
    const flag = await flagOperations.findById(flagId)
    if (!flag) {
      return NextResponse.json({ error: 'Flag not found' }, { status: 404 })
    }

    if (flag.status !== 'pending') {
      return NextResponse.json({ error: 'Flag has already been processed' }, { status: 409 })
    }

    // Update the flag
    const updatedFlag = await flagOperations.updateStatus(flagId, {
      status: action,
      moderatorId: userId,
      moderatorNotes: moderatorNotes || '',
      reviewedAt: new Date()
    })

    // If resolved, deactivate the target content
    if (action === 'resolved') {
      try {
        // This would need to be implemented in db-operations
        // await deactivateContent(flag.targetType, flag.targetId)
      } catch (error) {
        console.error('Error deactivating flagged content:', error)
        // Don't fail the flag update if content deactivation fails
      }
    }

    return NextResponse.json({
      message: `Flag ${action} successfully`,
      flag: updatedFlag
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid action data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Flag action error:', error)
    return NextResponse.json(
      { error: 'Failed to process flag action' },
      { status: 500 }
    )
  }
}