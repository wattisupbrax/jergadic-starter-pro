'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Flag, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  MessageSquare,
  Calendar,
  User
} from 'lucide-react'
import { toast } from 'sonner'

interface FlaggedItem {
  _id: string
  targetType: 'term' | 'definition' | 'comment' | 'dicho'
  targetId: string
  reason: string
  customReason?: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reporterId: string
  createdAt: string
  moderatorNotes?: string
  targetContent?: {
    word?: string
    content?: string
    example?: string
    region?: string
  }
}

const flagReasons = {
  inappropriate_content: 'Contenido inapropiado',
  spam: 'Spam',
  harassment: 'Acoso',
  hate_speech: 'Discurso de odio',
  misinformation: 'Información falsa',
  copyright_violation: 'Violación de derechos de autor',
  personal_information: 'Información personal',
  other: 'Otro'
}

export default function FlaggedContent() {
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [moderatorNotes, setModeratorNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchFlaggedContent()
  }, [activeTab])

  const fetchFlaggedContent = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/flags?status=${activeTab}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setFlaggedItems(data.flags || [])
      } else if (response.status === 403) {
        toast.error('No tienes permisos para ver el contenido reportado')
      }
    } catch (error) {
      console.error('Error fetching flagged content:', error)
      toast.error('Error al cargar contenido reportado')
    } finally {
      setLoading(false)
    }
  }

  const handleFlagAction = async (flagId: string, action: 'resolved' | 'dismissed') => {
    try {
      const notes = moderatorNotes[flagId] || ''
      
      const response = await fetch(`/api/flags/${flagId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          moderatorNotes: notes
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update flag')
      }
      
      toast.success(`Reporte ${action === 'resolved' ? 'resuelto' : 'descartado'} correctamente`)
      
      // Update local state
      setFlaggedItems(items => 
        items.map(item => 
          item._id === flagId 
            ? { ...item, status: action, moderatorNotes: notes }
            : item
        )
      )
      
      // Clear notes
      setModeratorNotes(prev => ({ ...prev, [flagId]: '' }))
      
    } catch (error) {
      toast.error('Error al procesar el reporte')
      console.error('Flag action error:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'  
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'dismissed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'hate_speech': return 'bg-red-100 text-red-800'
      case 'harassment': return 'bg-red-100 text-red-800'
      case 'inappropriate_content': return 'bg-orange-100 text-orange-800'
      case 'spam': return 'bg-yellow-100 text-yellow-800'
      case 'misinformation': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-800">
              {flaggedItems.filter(item => item.status === 'pending').length}
            </div>
            <div className="text-sm text-yellow-600">Pendientes</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800">
              {flaggedItems.filter(item => item.status === 'reviewed').length}
            </div>
            <div className="text-sm text-blue-600">Revisados</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800">
              {flaggedItems.filter(item => item.status === 'resolved').length}
            </div>
            <div className="text-sm text-green-600">Resueltos</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {flaggedItems.filter(item => item.status === 'dismissed').length}
            </div>
            <div className="text-sm text-gray-600">Descartados</div>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flag className="h-5 w-5 text-red-600" />
            <span>Contenido Reportado</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="reviewed">Revisados</TabsTrigger>
              <TabsTrigger value="resolved">Resueltos</TabsTrigger>
              <TabsTrigger value="dismissed">Descartados</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {flaggedItems.length > 0 ? (
                <div className="space-y-4">
                  {flaggedItems.map((item) => (
                    <Card key={item._id} className="border-l-4 border-l-red-400">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-3">
                                <Badge className={getStatusColor(item.status)}>
                                  {item.status === 'pending' ? 'Pendiente' :
                                   item.status === 'reviewed' ? 'Revisado' :
                                   item.status === 'resolved' ? 'Resuelto' :
                                   'Descartado'}
                                </Badge>
                                <Badge variant="outline">
                                  {item.targetType === 'term' ? 'Término' :
                                   item.targetType === 'definition' ? 'Definición' :
                                   item.targetType === 'comment' ? 'Comentario' :
                                   'Dicho'}
                                </Badge>
                                <Badge className={getReasonColor(item.reason)}>
                                  {flagReasons[item.reason as keyof typeof flagReasons] || item.reason}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span>Reportado por: {item.reporterId}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(item.createdAt).toLocaleDateString('es-ES')}</span>
                                </span>
                              </div>
                            </div>
                            
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver original
                            </Button>
                          </div>

                          {/* Content Preview */}
                          {item.targetContent && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              {item.targetContent.word && (
                                <h4 className="font-semibold text-lg capitalize mb-2">
                                  {item.targetContent.word}
                                </h4>
                              )}
                              {item.targetContent.content && (
                                <p className="text-gray-800 mb-2">
                                  {item.targetContent.content}
                                </p>
                              )}
                              {item.targetContent.example && (
                                <blockquote className="text-gray-600 italic border-l-4 border-gray-300 pl-3">
                                  "{item.targetContent.example}"
                                </blockquote>
                              )}
                              {item.targetContent.region && (
                                <div className="mt-2">
                                  <Badge variant="outline">{item.targetContent.region}</Badge>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Report Details */}
                          {item.customReason && (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Razón específica:</strong> {item.customReason}
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Moderator Actions */}
                          {item.status === 'pending' && (
                            <div className="border-t pt-4 space-y-3">
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Notas del moderador (opcional)
                                </label>
                                <Textarea
                                  placeholder="Agregar notas sobre esta decisión..."
                                  value={moderatorNotes[item._id] || ''}
                                  onChange={(e) => setModeratorNotes(prev => ({
                                    ...prev,
                                    [item._id]: e.target.value
                                  }))}
                                  className="mb-3"
                                />
                              </div>
                              
                              <div className="flex space-x-3">
                                <Button
                                  variant="default"
                                  onClick={() => handleFlagAction(item._id, 'resolved')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Resolver (Contenido removido)
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  onClick={() => handleFlagAction(item._id, 'dismissed')}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Descartar (Sin acción)
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Moderator Notes Display */}
                          {item.moderatorNotes && (
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                              <div className="flex items-center space-x-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Notas del moderador:</span>
                              </div>
                              <p className="text-blue-700 text-sm">{item.moderatorNotes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {activeTab === 'pending' 
                      ? 'No hay reportes pendientes'
                      : `No hay reportes ${activeTab}`
                    }
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}