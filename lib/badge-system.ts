import { userOperations, notificationOperations } from './db-operations'

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: string
  color: string
  criteria: {
    field: string
    operator: 'gte' | 'eq' | 'gt' | 'lt' | 'lte'
    value: number | string
  }[]
}

export const AVAILABLE_BADGES: BadgeDefinition[] = [
  {
    id: 'newbie',
    name: 'Novato',
    description: 'Bienvenido a JergaDic',
    icon: '🎯',
    color: 'gray',
    criteria: [
      { field: 'contributions.termsSubmitted', operator: 'gte', value: 1 }
    ]
  },
  {
    id: 'contributor',
    name: 'Contribuidor',
    description: 'Ha enviado 10 términos',
    icon: '📝',
    color: 'blue',
    criteria: [
      { field: 'contributions.termsSubmitted', operator: 'gte', value: 10 }
    ]
  },
  {
    id: 'active_voter',
    name: 'Votante Activo',
    description: 'Ha dado 50 votos',
    icon: '👍',
    color: 'green',
    criteria: [
      { field: 'contributions.votesGiven', operator: 'gte', value: 50 }
    ]
  },
  {
    id: 'definition_master',
    name: 'Maestro de Definiciones',
    description: 'Ha enviado 25 definiciones',
    icon: '📖',
    color: 'purple',
    criteria: [
      { field: 'contributions.definitionsSubmitted', operator: 'gte', value: 25 }
    ]
  },
  {
    id: 'regional_expert',
    name: 'Experto Regional',
    description: 'Ha enviado 20 términos de su región',
    icon: '🌍',
    color: 'yellow',
    criteria: [
      { field: 'contributions.termsSubmitted', operator: 'gte', value: 20 }
    ]
  },
  {
    id: 'dictionary_builder',
    name: 'Constructor del Diccionario',
    description: 'Ha enviado 50 términos',
    icon: '🏗️',
    color: 'orange',
    criteria: [
      { field: 'contributions.termsSubmitted', operator: 'gte', value: 50 }
    ]
  },
  {
    id: 'community_helper',
    name: 'Ayudante de la Comunidad',
    description: 'Ha dado 100 votos positivos',
    icon: '🤝',
    color: 'pink',
    criteria: [
      { field: 'contributions.votesGiven', operator: 'gte', value: 100 }
    ]
  },
  {
    id: 'top_contributor',
    name: 'Contribuidor Top',
    description: 'Ha enviado 100 términos',
    icon: '🏆',
    color: 'gold',
    criteria: [
      { field: 'contributions.termsSubmitted', operator: 'gte', value: 100 }
    ]
  },
  {
    id: 'legend',
    name: 'Leyenda',
    description: 'Más de 500 contribuciones totales',
    icon: '⭐',
    color: 'rainbow',
    criteria: [
      { field: 'reputation', operator: 'gte', value: 1000 }
    ]
  }
]

function evaluateCriteria(user: any, criteria: BadgeDefinition['criteria']): boolean {
  return criteria.every(criterion => {
    const userValue = getNestedValue(user, criterion.field)
    
    switch (criterion.operator) {
      case 'gte':
        return userValue >= criterion.value
      case 'gt':
        return userValue > criterion.value
      case 'eq':
        return userValue === criterion.value
      case 'lt':
        return userValue < criterion.value
      case 'lte':
        return userValue <= criterion.value
      default:
        return false
    }
  })
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj) ?? 0
}

export async function checkAndAssignBadges(userId: string): Promise<string[]> {
  try {
    const user = await userOperations.findByClerkId(userId)
    if (!user) {
      console.error('User not found for badge assignment:', userId)
      return []
    }

    const currentBadges = user.badges || []
    const newBadges: string[] = []

    for (const badge of AVAILABLE_BADGES) {
      // Skip if user already has this badge
      if (currentBadges.includes(badge.id)) {
        continue
      }

      // Check if user meets criteria
      if (evaluateCriteria(user, badge.criteria)) {
        newBadges.push(badge.id)

        // Update user's badges
        await userOperations.updateBadges(userId, [...currentBadges, badge.id])

        // Create notification
        await notificationOperations.createNotification(
          userId,
          'badge_earned',
          `¡Nueva insignia desbloqueada! ${badge.icon}`,
          `Has ganado la insignia "${badge.name}": ${badge.description}`,
          badge.id,
          'badge'
        )

        console.log(`Badge assigned: ${badge.name} to user ${userId}`)
      }
    }

    return newBadges
  } catch (error) {
    console.error('Error in badge assignment:', error)
    return []
  }
}

export async function calculateUserReputation(userId: string): Promise<number> {
  try {
    const user = await userOperations.findByClerkId(userId)
    if (!user) return 0

    const contributions = user.contributions || {}
    
    // Calculate reputation based on different contribution types
    const reputation = 
      (contributions.termsSubmitted || 0) * 10 +          // 10 points per term
      (contributions.definitionsSubmitted || 0) * 8 +     // 8 points per definition
      (contributions.votesGiven || 0) * 1 +               // 1 point per vote given
      (contributions.commentsPosted || 0) * 2 +           // 2 points per comment
      (contributions.dichosSubmitted || 0) * 5            // 5 points per dicho

    // Update user's reputation
    await userOperations.updateReputation(userId, reputation)
    
    return reputation
  } catch (error) {
    console.error('Error calculating reputation:', error)
    return 0
  }
}

export function getBadgeInfo(badgeId: string): BadgeDefinition | undefined {
  return AVAILABLE_BADGES.find(badge => badge.id === badgeId)
}

export function getBadgesByColor(color: string): BadgeDefinition[] {
  return AVAILABLE_BADGES.filter(badge => badge.color === color)
}

export async function getUserBadgeInfo(userId: string): Promise<{
  earnedBadges: BadgeDefinition[]
  nextBadges: BadgeDefinition[]
  progress: Record<string, number>
}> {
  try {
    const user = await userOperations.findByClerkId(userId)
    if (!user) {
      return { earnedBadges: [], nextBadges: [], progress: {} }
    }

    const earnedBadgeIds = user.badges || []
    const earnedBadges = earnedBadgeIds
      .map(id => getBadgeInfo(id))
      .filter(Boolean) as BadgeDefinition[]

    const nextBadges = AVAILABLE_BADGES
      .filter(badge => !earnedBadgeIds.includes(badge.id))
      .slice(0, 3) // Show next 3 achievable badges

    // Calculate progress towards next badges
    const progress: Record<string, number> = {}
    nextBadges.forEach(badge => {
      const criterion = badge.criteria[0] // Simplified for first criterion
      if (criterion) {
        const currentValue = getNestedValue(user, criterion.field)
        const targetValue = criterion.value as number
        progress[badge.id] = Math.min((currentValue / targetValue) * 100, 100)
      }
    })

    return { earnedBadges, nextBadges, progress }
  } catch (error) {
    console.error('Error getting user badge info:', error)
    return { earnedBadges: [], nextBadges: [], progress: {} }
  }
}