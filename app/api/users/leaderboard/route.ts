import { NextRequest, NextResponse } from 'next/server'
import { userOperations } from '@/lib/db-operations'
import { z } from 'zod'

const LeaderboardQuerySchema = z.object({
  type: z.enum(['reputation', 'termsSubmitted', 'definitionsSubmitted', 'votesGiven']).optional().default('reputation'),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const { type, limit } = LeaderboardQuerySchema.parse(queryParams)
    
    const leaderboard = await userOperations.getLeaderboard(type, limit)
    
    return NextResponse.json({
      leaderboard,
      type,
      limit,
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}