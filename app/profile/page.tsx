'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Star, MessageSquare, ThumbsUp, BookOpen, Users } from 'lucide-react'
import { useUserSync } from '@/hooks/use-user-sync'

interface UserProfile {
  _id: string
  name: string
  username?: string
  avatar?: string
  contributions: {
    termsSubmitted: number
    definitionsSubmitted: number
    votesGiven: number
    commentsPosted: number
    dichosSubmitted: number
  }
  badges: string[]
  reputation: number
  role: string
  preferences: {
    language: string
    region: string
  }
  createdAt: string
}

export default function ProfilePage() {
  const { user, isLoaded } = useUserSync()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded || !user) return

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/users/sync')
        if (response.ok) {
          const data = await response.json()
          setProfile(data.user)
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, isLoaded])

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Perfil no encontrado</h2>
          <Button asChild>
            <a href="/sign-in">Iniciar sesión</a>
          </Button>
        </div>
      </div>
    )
  }

  const totalContributions = 
    profile.contributions.termsSubmitted +
    profile.contributions.definitionsSubmitted +
    profile.contributions.commentsPosted +
    profile.contributions.dichosSubmitted

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-2xl bg-blue-600 text-white">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.name}
              </h1>
              {profile.username && (
                <p className="text-xl text-gray-600 mb-3">@{profile.username}</p>
              )}
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2 text-blue-600">
                  <Trophy className="h-5 w-5" />
                  <span className="font-semibold">{profile.reputation} puntos</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <Star className="h-5 w-5" />
                  <span className="font-semibold">{totalContributions} contribuciones</span>
                </div>
                <div className="text-sm text-gray-500">
                  Región: {profile.preferences.region}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((badge, index) => (
                  <Badge 
                    key={index} 
                    className={badgeColors[badge as keyof typeof badgeColors] || 'bg-gray-100 text-gray-800'}
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Activity */}
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{profile.contributions.termsSubmitted}</p>
                      <p className="text-sm text-gray-600">Términos enviados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <MessageSquare className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{profile.contributions.definitionsSubmitted}</p>
                      <p className="text-sm text-gray-600">Definiciones enviadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <ThumbsUp className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold">{profile.contributions.votesGiven}</p>
                      <p className="text-sm text-gray-600">Votos dados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{profile.contributions.commentsPosted}</p>
                      <p className="text-sm text-gray-600">Comentarios</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contribution Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Desglose de Contribuciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Dichos enviados</span>
                    <Badge variant="outline">{profile.contributions.dichosSubmitted}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Miembro desde</span>
                    <span className="text-sm text-gray-600">
                      {new Date(profile.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Funcionalidad de actividad reciente próximamente...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Idioma preferido</span>
                    <Badge>{profile.preferences.language === 'es' ? 'Español' : 'English'}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Región preferida</span>
                    <Badge variant="outline">{profile.preferences.region}</Badge>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      Editar Preferencias
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}