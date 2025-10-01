'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Star, 
  ThumbsUp,
  MessageSquare,
  BookOpen,
  Crown,
  Medal,
  Award,
  TrendingUp
} from 'lucide-react'

interface LeaderboardUser {
  _id: string
  name: string
  username?: string
  avatar?: string
  reputation: number
  contributions: {
    termsSubmitted: number
    definitionsSubmitted: number
    votesGiven: number
    commentsPosted: number
    dichosSubmitted: number
  }
  badges: string[]
  totalContributions: number
}

interface LeaderboardProps {
  initialType?: string
  showHeader?: boolean
  maxItems?: number
}

const leaderboardTypes = [
  {
    id: 'reputation',
    name: 'Reputación',
    icon: Trophy,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: 'Basado en la puntuación total de contribuciones'
  },
  {
    id: 'termsSubmitted',
    name: 'Términos',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Usuarios que más términos han enviado'
  },
  {
    id: 'definitionsSubmitted',
    name: 'Definiciones',
    icon: MessageSquare,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Usuarios que más definiciones han contribuido'
  },
  {
    id: 'votesGiven',
    name: 'Votos',
    icon: ThumbsUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Usuarios más activos votando'
  }
]

const badgeColors = {
  'Newbie': 'bg-gray-100 text-gray-800',
  'Contributor': 'bg-blue-100 text-blue-800',
  'Active Voter': 'bg-green-100 text-green-800',
  'Regional Expert': 'bg-yellow-100 text-yellow-800',
  'Dictionary Builder': 'bg-purple-100 text-purple-800',
  'Community Helper': 'bg-pink-100 text-pink-800',
  'Top Contributor': 'bg-orange-100 text-orange-800',
  'Moderator': 'bg-red-100 text-red-800',
  'Legend': 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
}

export default function Leaderboard({ 
  initialType = 'reputation', 
  showHeader = true, 
  maxItems = 10 
}: LeaderboardProps) {
  const [activeType, setActiveType] = useState(initialType)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard(activeType)
  }, [activeType])

  const fetchLeaderboard = async (type: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/leaderboard?type=${type}&limit=${maxItems}`)
      if (response.ok) {
        const data = await response.json()
        setLeaderboardData(data.leaderboard || [])
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-600" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-500" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return (
          <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-sm font-bold text-gray-600">
            {rank}
          </div>
        )
    }
  }

  const getStatValue = (user: LeaderboardUser, type: string) => {
    switch (type) {
      case 'reputation':
        return user.reputation
      case 'termsSubmitted':
        return user.contributions.termsSubmitted
      case 'definitionsSubmitted':
        return user.contributions.definitionsSubmitted
      case 'votesGiven':
        return user.contributions.votesGiven
      default:
        return 0
    }
  }

  const currentTypeData = leaderboardTypes.find(t => t.id === activeType)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          {showHeader && (
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              <span>Tabla de Clasificación</span>
            </CardTitle>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse flex items-center space-x-4 p-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        {showHeader && (
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            <span>Tabla de Clasificación</span>
          </CardTitle>
        )}
        
        <Tabs value={activeType} onValueChange={setActiveType} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {leaderboardTypes.map((type) => (
              <TabsTrigger 
                key={type.id} 
                value={type.id} 
                className="flex items-center space-x-1 text-xs"
              >
                <type.icon className="h-3 w-3" />
                <span className="hidden sm:inline">{type.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            {currentTypeData && <currentTypeData.icon className={`h-4 w-4 ${currentTypeData.color}`} />}
            <h3 className="font-semibold">{currentTypeData?.name}</h3>
          </div>
          <p className="text-sm text-gray-600">{currentTypeData?.description}</p>
        </div>

        <div className="space-y-3">
          {leaderboardData.map((user, index) => {
            const rank = index + 1
            const statValue = getStatValue(user, activeType)
            
            return (
              <div 
                key={user._id}
                className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                  rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'hover:bg-gray-50'
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  {getRankIcon(rank)}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {user.name}
                    </h4>
                    {user.badges.includes('Legend') && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Legend
                      </Badge>
                    )}
                    {user.badges.includes('Moderator') && (
                      <Badge variant="destructive" className="text-xs">
                        Mod
                      </Badge>
                    )}
                  </div>
                  
                  {user.username && (
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  )}
                  
                  {/* Top badges */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.badges.slice(0, 2).map((badge, badgeIndex) => (
                      <Badge 
                        key={badgeIndex}
                        className={`text-xs ${badgeColors[badge as keyof typeof badgeColors] || 'bg-gray-100 text-gray-800'}`}
                      >
                        {badge}
                      </Badge>
                    ))}
                    {user.badges.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.badges.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stat Value */}
                <div className="flex-shrink-0 text-right">
                  <div className={`text-lg font-bold ${currentTypeData?.color || 'text-gray-900'}`}>
                    {statValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {activeType === 'reputation' ? 'puntos' : 
                     activeType === 'termsSubmitted' ? 'términos' :
                     activeType === 'definitionsSubmitted' ? 'definiciones' :
                     'votos'}
                  </div>
                  
                  {/* Total contributions for context */}
                  {activeType !== 'reputation' && (
                    <div className="text-xs text-gray-400 mt-1">
                      {user.reputation} pts total
                    </div>
                  )}
                </div>

                {/* Rank Change Indicator */}
                {rank <= 3 && (
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {leaderboardData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay datos de clasificación disponibles</p>
          </div>
        )}

        {leaderboardData.length === maxItems && (
          <div className="text-center pt-4 border-t border-gray-200 mt-4">
            <Button variant="outline" size="sm">
              Ver clasificación completa
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}