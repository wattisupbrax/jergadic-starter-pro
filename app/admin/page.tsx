'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FlaggedContent from '@/components/admin/flagged-content'
import { 
  Shield, 
  Flag, 
  Users, 
  BarChart3,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react'

export default function AdminDashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    // Check if user has admin/moderator role
    // In a real implementation, this would check user metadata or make an API call
    const userRole = user?.publicMetadata?.role || 'user'
    const hasAdminAccess = userRole === 'admin' || userRole === 'moderator'
    
    setIsAuthorized(hasAdminAccess)
    setLoading(false)

    if (!hasAdminAccess && isLoaded) {
      router.push('/')
    }
  }, [user, isLoaded, router])

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
            <p className="text-gray-600 mb-6">
              No tienes permisos para acceder al panel de administración.
            </p>
            <Button onClick={() => router.push('/')}>
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const userRole = user?.publicMetadata?.role || 'user'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-gray-600">
                  Gestiona el contenido y la comunidad de JergaDic
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Conectado como:</p>
              <p className="font-medium text-gray-900">{user?.fullName}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                userRole === 'admin' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {userRole === 'admin' ? 'Administrador' : 'Moderador'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-yellow-800">12</div>
              <div className="text-sm text-yellow-700">Reportes pendientes</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-800">1,247</div>
              <div className="text-sm text-blue-700">Usuarios activos</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-800">89</div>
              <div className="text-sm text-green-700">Resueltos hoy</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <Activity className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-800">342</div>
              <div className="text-sm text-purple-700">Acciones hoy</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <Flag className="h-4 w-4" />
              <span>Reportes</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Estadísticas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <FlaggedContent />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Gestión de Usuarios</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Gestión de Usuarios</p>
                  <p>Funcionalidad de gestión de usuarios próximamente...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <span>Estadísticas de Moderación</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Estadísticas de Moderación</p>
                  <p>Panel de estadísticas próximamente...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Guidelines Card */}
        <Card className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-indigo-800">Directrices de Moderación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-indigo-700">
              <div>
                <strong>• Contenido inapropiado:</strong> Remover contenido ofensivo, vulgar o que viola las normas de la comunidad
              </div>
              <div>
                <strong>• Spam:</strong> Eliminar contenido repetitivo o irrelevante
              </div>
              <div>
                <strong>• Acoso:</strong> Tomar acción inmediata contra cualquier forma de acoso o intimidación
              </div>
              <div>
                <strong>• Información falsa:</strong> Verificar y corregir definiciones incorrectas o engañosas
              </div>
              <div>
                <strong>• Dudas:</strong> Si no estás seguro sobre una decisión, consulta con otros moderadores o administradores
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}