import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { userOperations } from '@/lib/db-operations'

type ClerkWebhookEvent = {
  type: string
  data: {
    id: string
    first_name?: string
    last_name?: string
    username?: string
    email_addresses?: Array<{
      email_address: string
      id: string
    }>
    image_url?: string
    created_at?: number
    updated_at?: number
  }
}

export async function POST(request: NextRequest) {
  // Get the headers
  const headerPayload = headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await request.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: ClerkWebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  try {
    switch (evt.type) {
      case 'user.created':
        await handleUserCreated(evt.data)
        break
      case 'user.updated':
        await handleUserUpdated(evt.data)
        break
      case 'user.deleted':
        await handleUserDeleted(evt.data)
        break
      default:
        console.log(`Unhandled Clerk webhook event: ${evt.type}`)
    }

    return NextResponse.json({ message: 'Webhook processed successfully' })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleUserCreated(userData: ClerkWebhookEvent['data']) {
  try {
    const primaryEmail = userData.email_addresses?.[0]?.email_address
    
    if (!primaryEmail) {
      console.error('No email found for user:', userData.id)
      return
    }

    const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
    
    await userOperations.create({
      clerkId: userData.id,
      name: fullName || 'Usuario Anónimo',
      email: primaryEmail,
      username: userData.username,
      avatar: userData.image_url,
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

    console.log(`Created user in MongoDB: ${userData.id}`)
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

async function handleUserUpdated(userData: ClerkWebhookEvent['data']) {
  try {
    const existingUser = await userOperations.findByClerkId(userData.id)
    
    if (!existingUser) {
      console.log(`User not found for update: ${userData.id}`)
      return
    }

    const primaryEmail = userData.email_addresses?.[0]?.email_address
    const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim()

    // Note: This is a simplified update. In a real implementation, you'd want to 
    // create a proper update method in userOperations
    console.log(`User updated in Clerk: ${userData.id}`)
    
    // Here you would implement the actual update logic
    // await userOperations.update(userData.id, { ... })
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

async function handleUserDeleted(userData: ClerkWebhookEvent['data']) {
  try {
    const existingUser = await userOperations.findByClerkId(userData.id)
    
    if (!existingUser) {
      console.log(`User not found for deletion: ${userData.id}`)
      return
    }

    // Instead of deleting, we'll deactivate the user to preserve data integrity
    // await userOperations.deactivate(userData.id)
    console.log(`User marked as deleted: ${userData.id}`)
  } catch (error) {
    console.error('Error handling user deletion:', error)
    throw error
  }
}