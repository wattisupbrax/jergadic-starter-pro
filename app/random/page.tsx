'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Dice6, 
  RefreshCw, 
  ExternalLink, 
  MapPin, 
  Calendar,
  ThumbsUp,
  Share2,
  ArrowLeft,
  Sparkles,
  Tag,
  Quote
} from 'lucide-react'
import { toast } from 'sonner'

interface RandomTerm {
  _id: string
  word: string
  region: string
  tags: string[]
  synonyms: string[]
  createdAt: string
}

interface Definition {
  _id: string
  content: string
  example?: string
  votes: {
    up: number
    down: number
    score: number
  }
  region: string
  createdAt: string
}

const regions = [
  'General', 'Mexico', 'Spain', 'Argentina', 'Colombia', 'Venezuela',
  'Peru', 'Chile', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay',
  'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Nicaragua',
  'El Salvador', 'Dominican Republic', 'Puerto Rico', 'Cuba'
]

export default function RandomPage() {
  const router = useRouter()
  const [term, setTerm] = useState<RandomTerm | null>(null)
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<RandomTerm[]>([])

  useEffect(() => {
    fetchRandomTerm()
  }, [selectedRegion])

  const fetchRandomTerm = async () => {
    setIsLoading(true)
    
    try {
      const params = new URLSearchParams({ random: 'true' })
      if (selectedRegion !== 'all') {
        params.append('region', selectedRegion)
      }

      const response = await fetch(`/api/terms?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch random term')
      }

      const data = await response.json()
      
      if (data.term) {
        // Add current term to history before setting new one
        if (term) {
          setHistory(prev => [term, ...prev.slice(0, 9)]) // Keep last 10 terms
        }
        
        setTerm(data.term)
        setDefinitions(data.definitions || [])
      } else {
        toast.error('No se encontraron términos para esta región')
      }
    } catch (error) {
      console.error('Error fetching random term:', error)
      toast.error('Error al cargar término aleatorio')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (!term) return

    const url = `${window.location.origin}/term/${encodeURIComponent(term.word)}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${term.word} - JergaDic`,
          text: `Descubre qué significa "${term.word}" en JergaDic`,
          url: url
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Enlace copiado al portapapeles')
      } catch (error) {
        toast.error('No se pudo copiar el enlace')
      }
    }
  }

  const handleViewFullTerm = () => {
    if (term) {
      router.push(`/term/${encodeURIComponent(term.word)}`)
    }
  }

  const handleViewFromHistory = (historicTerm: RandomTerm) => {
    router.push(`/term/${encodeURIComponent(historicTerm.word)}`)
  }

  const bestDefinition = definitions.length > 0 
    ? definitions.reduce((best, current) => 
        current.votes.score > best.votes.score ? current : best
      )
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Jerga Aleatoria</h1>
            </div>
          </div>

          <p className="text-center text-gray-600 mb-6">
            Descubre nuevos términos de jerga de forma aleatoria
          </p>

          {/* Region Filter */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Región:
            </label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las regiones</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Random Button */}
          <div className="text-center">
            <Button 
              onClick={fetchRandomTerm}
              disabled={isLoading}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg transform transition hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Cargando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Dice6 className="h-5 w-5" />
                  <span>Término aleatorio</span>
                  <RefreshCw className="h-4 w-4" />
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Random Term Display */}
        {term && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 border-2">
              <CardHeader className="text-center">
                <div className="space-y-4">
                  <div>
                    <CardTitle className="text-4xl font-bold text-purple-800 capitalize mb-3">
                      {term.word}
                    </CardTitle>
                    <div className="flex items-center justify-center space-x-4 text-gray-600">
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{term.region}</span>
                      </Badge>
                      <span className="flex items-center space-x-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(term.createdAt).toLocaleDateString('es-ES')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {term.tags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2">
                      {term.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Synonyms */}
                  {term.synonyms.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Sinónimos:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {term.synonyms.slice(0, 5).map((synonym, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-purple-100 hover:text-purple-800 transition-colors"
                            onClick={() => router.push(`/term/${encodeURIComponent(synonym)}`)}
                          >
                            {synonym}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Best Definition */}
            {bestDefinition && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Definición más votada</h3>
                      <div className="flex items-center space-x-2 text-green-600">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="font-medium">{bestDefinition.votes.score} votos</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 leading-relaxed text-lg">
                        {bestDefinition.content}
                      </p>
                      {bestDefinition.example && (
                        <blockquote className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                          <p className="text-gray-700 italic">
                            <Quote className="inline h-4 w-4 mr-1" />
                            "{bestDefinition.example}"
                          </p>
                        </blockquote>
                      )}
                    </div>

                    <div className="text-sm text-gray-500 flex items-center justify-between">
                      <span>
                        {bestDefinition.region} • {new Date(bestDefinition.createdAt).toLocaleDateString('es-ES')}
                      </span>
                      {definitions.length > 1 && (
                        <span>+{definitions.length - 1} definición{definitions.length > 2 ? 'es' : ''} más</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button 
                onClick={handleViewFullTerm}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver término completo
              </Button>
              
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
              
              <Button 
                variant="outline" 
                onClick={fetchRandomTerm}
                disabled={isLoading}
              >
                <Dice6 className="h-4 w-4 mr-2" />
                Otro aleatorio
              </Button>
            </div>

            {/* No definition available */}
            {!bestDefinition && (
              <Alert>
                <AlertDescription>
                  Este término no tiene definiciones aún. 
                  <Button 
                    variant="link" 
                    className="p-0 ml-1 h-auto"
                    onClick={() => router.push(`/submit?word=${encodeURIComponent(term.word)}`)}
                  >
                    ¡Sé el primero en agregar una!
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span>Términos recientes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {history.map((historicTerm, index) => (
                  <div
                    key={`${historicTerm._id}-${index}`}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-center"
                    onClick={() => handleViewFromHistory(historicTerm)}
                  >
                    <p className="font-medium text-gray-900 capitalize truncate">
                      {historicTerm.word}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{historicTerm.region}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              ¡Explora la riqueza del español!
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Cada región hispanohablante tiene su propia jerga única. 
              Usa esta herramienta para descubrir palabras fascinantes de diferentes países 
              y expandir tu vocabulario coloquial.
            </p>
            <div className="mt-4 space-x-3">
              <Button variant="outline" onClick={() => router.push('/search')}>
                Buscar términos
              </Button>
              <Button variant="outline" onClick={() => router.push('/submit')}>
                Agregar jerga
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}