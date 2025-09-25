import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/mongodb'
import Notification from '@/lib/models/Notification'

// GET - Fetch user notifications
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const unreadOnly = searchParams.get('unread') === 'true'

    const query: any = { userId }
    if (unreadOnly) {
      query.isRead = false
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    const unreadCount = await Notification.countDocuments({ userId, isRead: false })

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST - Create a new notification (internal use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, message, relatedId } = body

    await connectToDatabase()

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedId,
      isRead: false
    })

    await notification.save()

    return NextResponse.json({
      message: 'Notification created successfully',
      notification
    })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// PUT - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, markAllAsRead } = body

    await connectToDatabase()

    let updateQuery: any = { userId }
    
    if (markAllAsRead) {
      // Mark all notifications as read for this user
      await Notification.updateMany(updateQuery, { isRead: true })
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      updateQuery._id = { $in: notificationIds }
      await Notification.updateMany(updateQuery, { isRead: true })
    }

    return NextResponse.json({
      message: 'Notifications updated successfully'
    })

  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}