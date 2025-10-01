import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { userOperations } from '@/lib/db-operations'

export function useUserSync() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (!isLoaded || !user) return

    const syncUser = async () => {
      try {
        // Check if user exists in our database
        const existingUser = await fetch('/api/users/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerkId: user.id,
            name: user.fullName || `${user.firstName} ${user.lastName}`,
            email: user.primaryEmailAddress?.emailAddress,
            avatar: user.imageUrl,
            username: user.username,
          }),
        })

        if (!existingUser.ok) {
          console.error('Failed to sync user:', await existingUser.text())
        }
      } catch (error) {
        console.error('Error syncing user:', error)
      }
    }

    syncUser()
  }, [user, isLoaded])

  return { user, isLoaded }
}