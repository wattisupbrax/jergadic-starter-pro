'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  ThumbsUp,
  TrendingUp,
  Globe,
  Clock,
  Activity,
  Target,
  Zap,
  Award,
  Calendar
} from 'lucide-react'

interface CommunityStatsData {
  totals: {
    users: number
    terms: number
    definitions: number
    votes: number
    comments: number
    dichos: number
  }
  growth: {
    usersThisMonth: number
    termsThisWeek: number
    definitionsToday: number
    votesToday: number
  }
  regions: {
    name: string
    count: number
    percentage: number
  }[]
  topContributors: {
    daily: number
    weekly: number
    monthly: number
  }
  milestones: {
    name: string
    target: number
    current: number
    percentage: number
    icon: string
  }[]
}

interface CommunityStatsProps {
  showGrowth?: boolean
  showRegions?: boolean
  showMilestones?: boolean
}

export default function CommunityStats({ 
  showGrowth = true, 
  showRegions = true, 
  showMilestones = true 
}: CommunityStatsProps) {
  const [stats, setStats] = useState<CommunityStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCommunityStats()
    
    // Update stats every 5 minutes
    const interval = setInterval(fetchCommunityStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchCommunityStats = async () => {
    try {
      // Mock data - in real implementation, this would call /api/community/stats
      const mockStats: CommunityStatsData = {
        totals: {
          users: 1247,
          terms: 5832,
          definitions: 12456,
          votes: 34789,
          comments: 2341,
          dichos: 1876
        },
        growth: {
          usersThisMonth: 89,
          termsThisWeek: 156,
          definitionsToday: 23,
          votesToday: 342
        },
        regions: [
          { name: 'México', count: 1456, percentage: 24.9 },
          { name: 'España', count: 1234, percentage: 21.2 },
          { name: 'Argentina', count: 987, percentage: 16.9 },
          { name: 'Colombia', count: 876, percentage: 15.0 },
          { name: 'Venezuela', count: 654, percentage: 11.2 },
          { name: 'Otros', count: 625, percentage: 10.8 }
        ],
        topContributors: {
          daily: 24,
          weekly: 167,
          monthly: 423
        },
        milestones: [
          { name: 'Términos', target: 10000, current: 5832, percentage: 58.3, icon: 'book' },
          { name: 'Usuarios', target: 2000, current: 1247, percentage: 62.4, icon: 'users' },
          { name: 'Definiciones', target: 20000, current: 12456, percentage: 62.3, icon: 'message' },
          { name: 'Votos', target: 50000, current: 34789, percentage: 69.6, icon: 'thumbs-up' }
        ]
      }
      
      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching community stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'book': return BookOpen
      case 'users': return Users
      case 'message': return MessageSquare
      case 'thumbs-up': return ThumbsUp
      default: return Activity
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800">
              {stats.totals.users.toLocaleString()}
            </div>
            <div className="text-sm text-blue-600">Usuarios</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800">
              {stats.totals.terms.toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Términos</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-800">
              {stats.totals.definitions.toLocaleString()}
            </div>
            <div className="text-sm text-purple-600">Definiciones</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="p-4 text-center">
            <ThumbsUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-800">
              {stats.totals.votes.toLocaleString()}
            </div>
            <div className="text-sm text-orange-600">Votos</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-pink-50 to-pink-100">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-pink-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-pink-800">
              {stats.totals.comments.toLocaleString()}
            </div>
            <div className="text-sm text-pink-600">Comentarios</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-800">
              {stats.totals.dichos.toLocaleString()}
            </div>
            <div className="text-sm text-yellow-600">Dichos</div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Stats */}
      {showGrowth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Actividad Reciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Este mes</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  +{stats.growth.usersThisMonth}
                </div>
                <div className="text-sm text-gray-600">Nuevos usuarios</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Esta semana</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  +{stats.growth.termsThisWeek}
                </div>
                <div className="text-sm text-gray-600">Términos nuevos</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Hoy</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  +{stats.growth.definitionsToday}
                </div>
                <div className="text-sm text-gray-600">Definiciones</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Hoy</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  +{stats.growth.votesToday}
                </div>
                <div className="text-sm text-gray-600">Votos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Regional Distribution */}
        {showRegions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <span>Distribución por Regiones</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.regions.map((region, index) => (
                <div key={region.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{region.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {region.count.toLocaleString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {region.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={region.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Milestones */}
        {showMilestones && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>Objetivos de Crecimiento</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.milestones.map((milestone, index) => {
                const Icon = getIcon(milestone.icon)
                return (
                  <div key={milestone.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{milestone.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {milestone.current.toLocaleString()} / {milestone.target.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={milestone.percentage} className="h-2 flex-1" />
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${milestone.percentage >= 80 ? 'bg-green-100 text-green-800' : 
                                               milestone.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                               'bg-gray-100 text-gray-800'}`}
                      >
                        {milestone.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Active Contributors */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <span>Contribuidores Activos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600">
                {stats.topContributors.daily}
              </div>
              <div className="text-sm text-indigo-700">Activos hoy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">
                {stats.topContributors.weekly}
              </div>
              <div className="text-sm text-indigo-700">Esta semana</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">
                {stats.topContributors.monthly}
              </div>
              <div className="text-sm text-indigo-700">Este mes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}