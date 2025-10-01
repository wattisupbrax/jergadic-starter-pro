'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Flag, 
  Calendar,
  MapPin,
  Tag,
  Quote,
  Send,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

interface Definition {
  _id: string
  content: string
  example?: string
  authorId: string
  votes: {
    up: number
    down: number
    score: number
  }
  region: string
  createdAt: string
  audioUrl?: string
}

interface Comment {
  _id: string
  userId: string
  content: string
  createdAt: string
  votes: {
    up: number
    down: number
    score: number
  }
  replies?: Comment[]
}

interface Dicho {
  _id: string
  content: string
  translation?: string
  authorId: string
  votes: {
    up: number
    down: number
    score: number
  }
  createdAt: string
}

interface Term {
  _id: string
  word: string
  region: string
  tags: string[]
  synonyms: string[]
  createdAt: string
  authorId: string
}

interface TermDisplayProps {
  term: Term
  definitions: Definition[]
  onSynonymClick?: (synonym: string, region: string) => void
}

export default function TermDisplay({ term, definitions, onSynonymClick }: TermDisplayProps) {
  const { user } = useUser()
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({})
  const [comments, setComments] = useState<Comment[]>([])
  const [dichos, setDichos] = useState<Dicho[]>([])
  const [newComment, setNewComment] = useState('')
  const [newDicho, setNewDicho] = useState('')
  const [newDichoTranslation, setNewDichoTranslation] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isSubmittingDicho, setIsSubmittingDicho] = useState(false)

  // Load user votes
  useEffect(() => {
    if (!user) return

    const loadUserVotes = async () => {
      try {
        const votes: Record<string, 'up' | 'down' | null> = {}
        
        for (const definition of definitions) {
          const response = await fetch(`/api/votes?definitionId=${definition._id}`)
          if (response.ok) {
            const data = await response.json()
            votes[definition._id] = data.userVote
          }
        }
        
        setUserVotes(votes)
      } catch (error) {
        console.error('Failed to load user votes:', error)
      }
    }

    loadUserVotes()
  }, [user, definitions])

  const handleVote = async (definitionId: string, voteType: 'up' | 'down') => {
    if (!user) {
      toast.error('Debes iniciar sesión para votar')
      return
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          definitionId,
          type: voteType,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al votar')
      }

      // Update local vote state
      const currentVote = userVotes[definitionId]
      const newVote = currentVote === voteType ? null : voteType
      setUserVotes(prev => ({
        ...prev,
        [definitionId]: newVote
      }))

      toast.success('Voto registrado')
    } catch (error) {
      toast.error('Error al votar')
      console.error('Vote error:', error)
    }
  }

  const handleFlag = async (targetType: string, targetId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para reportar contenido')
      return
    }

    // This would open a flag dialog in a real implementation
    toast.info('Funcionalidad de reporte próximamente')
  }

  const submitComment = async () => {
    if (!user || !newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      // This would call the comments API
      toast.success('Comentario agregado')
      setNewComment('')
    } catch (error) {
      toast.error('Error al agregar comentario')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const submitDicho = async () => {
    if (!user || !newDicho.trim()) return

    setIsSubmittingDicho(true)
    try {
      // This would call the dichos API
      toast.success('Dicho agregado')
      setNewDicho('')
      setNewDichoTranslation('')
    } catch (error) {
      toast.error('Error al agregar dicho')
    } finally {
      setIsSubmittingDicho(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Term Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-t-4 border-blue-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-blue-800 capitalize mb-2">
                {term.word}
              </CardTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{term.region}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(term.createdAt).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFlag('term', term._id)}
            >
              <Flag className="h-4 w-4 mr-1" />
              Reportar
            </Button>
          </div>

          {/* Tags */}
          {term.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {term.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Synonyms */}
          {term.synonyms.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Sinónimos:</p>
              <div className="flex flex-wrap gap-2">
                {term.synonyms.map((synonym, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-yellow-200 transition-colors bg-yellow-100 text-yellow-800"
                    onClick={() => onSynonymClick?.(synonym, term.region)}
                  >
                    {synonym}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="definitions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="definitions" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Definiciones ({definitions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Comentarios ({comments.length})</span>
          </TabsTrigger>
          <TabsTrigger value="dichos" className="flex items-center space-x-2">
            <Quote className="h-4 w-4" />
            <span>Dichos ({dichos.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Definitions Tab */}
        <TabsContent value="definitions" className="space-y-4">
          {definitions.map((definition, index) => (
            <Card key={definition._id} className={index === 0 ? "border-green-200 bg-green-50/50" : ""}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed text-lg">
                        {definition.content}
                      </p>
                      {definition.example && (
                        <blockquote className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                          <p className="text-gray-700 italic">
                            "{definition.example}"
                          </p>
                        </blockquote>
                      )}
                    </div>
                    {index === 0 && (
                      <Badge className="ml-4 bg-green-600 text-white">
                        Más votada
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      {/* Vote buttons */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={userVotes[definition._id] === 'up' ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleVote(definition._id, 'up')}
                          className={userVotes[definition._id] === 'up' ? "bg-green-600 text-white" : ""}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {definition.votes.up}
                        </Button>
                        <Button
                          variant={userVotes[definition._id] === 'down' ? "destructive" : "ghost"}
                          size="sm"
                          onClick={() => handleVote(definition._id, 'down')}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          {definition.votes.down}
                        </Button>
                      </div>

                      <div className="text-sm text-gray-500">
                        {definition.region} • {new Date(definition.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFlag('definition', definition._id)}
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      Reportar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {definitions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay definiciones para este término.</p>
                <p className="text-sm mt-2">¡Sé el primero en agregar una!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-4">
          {/* Add Comment Form */}
          {user && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Escribe un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={submitComment}
                      disabled={!newComment.trim() || isSubmittingComment}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      {isSubmittingComment ? 'Enviando...' : 'Comentar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          {comments.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay comentarios aún.</p>
                {!user && (
                  <p className="text-sm mt-2">
                    <a href="/sign-in" className="text-blue-600 hover:underline">
                      Inicia sesión
                    </a> para comentar
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dichos Tab */}
        <TabsContent value="dichos" className="space-y-4">
          {/* Add Dicho Form */}
          {user && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Escribe un dicho o refrán relacionado..."
                    value={newDicho}
                    onChange={(e) => setNewDicho(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Textarea
                    placeholder="Traducción al inglés (opcional)..."
                    value={newDichoTranslation}
                    onChange={(e) => setNewDichoTranslation(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={submitDicho}
                      disabled={!newDicho.trim() || isSubmittingDicho}
                      size="sm"
                    >
                      <Quote className="h-4 w-4 mr-1" />
                      {isSubmittingDicho ? 'Enviando...' : 'Agregar Dicho'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dichos List */}
          {dichos.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Quote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay dichos para este término.</p>
                {!user && (
                  <p className="text-sm mt-2">
                    <a href="/sign-in" className="text-blue-600 hover:underline">
                      Inicia sesión
                    </a> para agregar dichos
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}