import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { userOperations } from '@/lib/db-operations'
import { z } from 'zod'

const SyncUserSchema = z.object({
  clerkId: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  username: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const userData = SyncUserSchema.parse(body)

    // Ensure the authenticated user is only syncing their own data
    if (userData.clerkId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if user already exists
    let user = await userOperations.findByClerkId(userData.clerkId)
    
    if (!user) {
      // Create new user
      user = await userOperations.create({
        clerkId: userData.clerkId,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        username: userData.username,
        contributions: {
          termsSubmitted: 0,
          definitionsSubmitted: 0,
          votesGiven: 0,
          commentsPosted: 0,
          dichosSubmitted: 0,
        },
        badges: ['Newbie'],
        reputation: 0,
        role: 'user',
        preferences: {
          language: 'es',
          region: 'General',
          notifications: {
            email: true,
            comments: true,
            votes: true,
          },
        },
        isActive: true,
      })
      
      return NextResponse.json({ 
        message: 'User created successfully', 
        user,
        isNew: true 
      }, { status: 201 })
    }

    // Update existing user with latest Clerk data
    const updatedUser = await userOperations.findByClerkId(userData.clerkId)
    
    return NextResponse.json({ 
      message: 'User synced successfully', 
      user: updatedUser,
      isNew: false 
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid user data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('User sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await userOperations.findByClerkId(userId)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
    
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}