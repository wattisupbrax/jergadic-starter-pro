import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserBadgeInfo } from '@/lib/badge-system'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const badgeInfo = await getUserBadgeInfo(userId)

    return NextResponse.json({
      earnedBadges: badgeInfo.earnedBadges,
      nextBadges: badgeInfo.nextBadges,
      progress: badgeInfo.progress,
      totalEarned: badgeInfo.earnedBadges.length
    })

  } catch (error) {
    console.error('Error fetching user badges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    )
  }
}