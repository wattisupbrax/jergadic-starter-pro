'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Leaderboard from '@/components/community/leaderboard'
import CommunityStats from '@/components/community/community-stats'
import { 
  Users, 
  Trophy, 
  BarChart3, 
  Activity,
  ArrowLeft,
  Heart,
  Globe,
  Sparkles
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CommunityPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('stats')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-12 w-12 text-purple-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Comunidad JergaDic</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conoce a los miembros más activos de nuestra comunidad y descubre las estadísticas
              que hacen de JergaDic el diccionario de jerga más completo del español.
            </p>
          </div>

          {/* Community Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-purple-100 to-purple-200 border-purple-300">
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-bold text-purple-800 mb-2">Colaborativo</h3>
                <p className="text-purple-700 text-sm">
                  Miles de usuarios contribuyendo diariamente con nuevos términos y definiciones
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300">
              <CardContent className="p-6 text-center">
                <Globe className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-blue-800 mb-2">Global</h3>
                <p className="text-blue-700 text-sm">
                  Representando 21 países hispanohablantes con sus expresiones únicas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-100 to-green-200 border-green-300">
              <CardContent className="p-6 text-center">
                <Sparkles className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-green-800 mb-2">En Crecimiento</h3>
                <p className="text-green-700 text-sm">
                  Creciendo constantemente con nuevos miembros y contribuciones cada día
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Estadísticas</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Clasificación</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Actividad</span>
            </TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <CommunityStats 
              showGrowth={true}
              showRegions={true}
              showMilestones={true}
            />
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Leaderboard 
                initialType="reputation"
                showHeader={true}
                maxItems={15}
              />
              
              <div className="space-y-6">
                {/* Top Contributors This Week */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      <span>Destacados de la Semana</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-green-800">Más Activo</h4>
                            <p className="text-sm text-green-600">+23 contribuciones esta semana</p>
                          </div>
                          <div className="text-2xl font-bold text-green-800">
                            @userExample1
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-blue-800">Mejor Definición</h4>
                            <p className="text-sm text-blue-600">+45 votos positivos</p>
                          </div>
                          <div className="text-2xl font-bold text-blue-800">
                            @userExample2
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-purple-800">Más Colaborador</h4>
                            <p className="text-sm text-purple-600">+67 votos dados</p>
                          </div>
                          <div className="text-2xl font-bold text-purple-800">
                            @userExample3
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Badges and Recognition */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <span>Sistema de Insignias</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Trophy className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium">Contribuidor Top</p>
                            <p className="text-sm text-gray-600">100+ términos enviados</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">12 usuarios</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Ayudante Comunidad</p>
                            <p className="text-sm text-gray-600">500+ votos positivos</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">89 usuarios</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Globe className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Experto Regional</p>
                            <p className="text-sm text-gray-600">50+ términos de su región</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">156 usuarios</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Activity Feed */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <span>Actividad Reciente</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Mock activity items */}
                      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">@usuario123</span> agregó una nueva definición para 
                            <span className="font-medium text-blue-600"> "chido"</span>
                          </p>
                          <p className="text-xs text-gray-500">hace 2 minutos</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">@maria_mx</span> envió el término 
                            <span className="font-medium text-blue-600"> "neta"</span> desde México
                          </p>
                          <p className="text-xs text-gray-500">hace 15 minutos</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">@carlos_arg</span> votó positivamente por una definición de
                            <span className="font-medium text-blue-600"> "piola"</span>
                          </p>
                          <p className="text-xs text-gray-500">hace 32 minutos</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">@ana_es</span> agregó un dicho para 
                            <span className="font-medium text-blue-600"> "guay"</span>
                          </p>
                          <p className="text-xs text-gray-500">hace 1 hora</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center pt-4">
                      <Button variant="outline">
                        Ver más actividad
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side Stats */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-orange-800">Actividad de Hoy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Términos nuevos</span>
                        <span className="font-bold text-orange-600">+23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Definiciones</span>
                        <span className="font-bold text-orange-600">+67</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Votos dados</span>
                        <span className="font-bold text-orange-600">+342</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Nuevos usuarios</span>
                        <span className="font-bold text-orange-600">+8</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Únete a la Comunidad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      ¿Quieres formar parte de nuestros contribuidores más activos?
                    </p>
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => router.push('/submit')}
                      >
                        Agregar Jerga
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push('/search')}
                      >
                        Explorar Términos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}