'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Calendar, 
  ThumbsUp, 
  MessageSquare, 
  ExternalLink,
  Tag,
  Quote,
  User,
  Search
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  type: 'term' | 'definition'
  _id: string
  word?: string
  content?: string
  example?: string
  region: string
  tags?: string[]
  votes?: {
    up: number
    down: number
    score: number
  }
  createdAt: string
  termId?: {
    word: string
    region: string
  }
}

interface SearchResultsProps {
  query: string
  results: {
    terms: SearchResult[]
    definitions: SearchResult[]
  }
  total: number
  region?: string
  isLoading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
}

export default function SearchResults({
  query,
  results,
  total,
  region,
  isLoading = false,
  onLoadMore,
  hasMore = false
}: SearchResultsProps) {
  const router = useRouter()

  const handleTermClick = (word: string, termRegion?: string) => {
    const url = `/term/${encodeURIComponent(word.toLowerCase())}`
    const params = new URLSearchParams()
    if (termRegion) params.append('region', termRegion)
    
    router.push(`${url}${params.toString() ? `?${params}` : ''}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const highlightQuery = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.split(regex).map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const allResults = [
    ...results.terms.map(term => ({ ...term, type: 'term' as const })),
    ...results.definitions.map(def => ({ ...def, type: 'definition' as const }))
  ].sort((a, b) => {
    // Prioritize terms over definitions, then by score/date
    if (a.type !== b.type) {
      return a.type === 'term' ? -1 : 1
    }
    if (a.votes?.score !== b.votes?.score) {
      return (b.votes?.score || 0) - (a.votes?.score || 0)
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="space-y-6">
      {/* Search Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center space-x-3">
          <Search className="h-5 w-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Resultados para "{query}"
            </h2>
            <p className="text-sm text-gray-600">
              {total} resultado{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
              {region && region !== 'all' && (
                <span className="ml-2 inline-flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  en {region}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Results List */}
      {allResults.length > 0 ? (
        <div className="space-y-4">
          {allResults.map((result, index) => (
            <Card 
              key={`${result.type}-${result._id}-${index}`}
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                result.type === 'term' ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : 'border-l-4 border-l-green-500'
              }`}
              onClick={() => {
                if (result.type === 'term') {
                  handleTermClick(result.word!, result.region)
                } else {
                  handleTermClick(result.termId?.word || '', result.termId?.region || result.region)
                }
              }}
            >
              <CardContent className="p-6">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {result.type === 'term' ? (
                        <div>
                          <h3 className="text-xl font-bold text-blue-800 capitalize flex items-center">
                            {highlightQuery(result.word!, query)}
                            <Badge variant="outline" className="ml-3 text-xs">
                              Término
                            </Badge>
                          </h3>
                          <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {result.region}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(result.createdAt)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <span className="text-blue-800 capitalize mr-2">
                              {result.termId?.word || 'Término'}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              Definición
                            </Badge>
                          </h3>
                          <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {result.region}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(result.createdAt)}
                            </span>
                            {result.votes && (
                              <span className="flex items-center">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                {result.votes.score} votos
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Content */}
                  {result.content && (
                    <div className="bg-white rounded-lg p-4 border">
                      <p className="text-gray-800 leading-relaxed">
                        {highlightQuery(result.content, query)}
                      </p>
                      {result.example && (
                        <blockquote className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                          <p className="text-gray-700 italic">
                            <Quote className="inline h-3 w-3 mr-1" />
                            "{highlightQuery(result.example, query)}"
                          </p>
                        </blockquote>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {result.tags.slice(0, 5).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {result.tags.length > 5 && (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          +{result.tags.length - 5} más
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  {result.votes && (
                    <div className="flex items-center space-x-4 pt-2 border-t border-gray-200 text-sm text-gray-600">
                      <span className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1 text-green-600" />
                        {result.votes.up} votos positivos
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1 text-blue-600" />
                        Ver comentarios
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-600 mb-6">
              No hay términos que coincidan con "{query}"
              {region && region !== 'all' && ` en ${region}`}
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Sugerencias:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Verifica la ortografía de las palabras</li>
                <li>• Intenta con términos más generales</li>
                <li>• Busca en todas las regiones</li>
                <li>• Considera sinónimos o variaciones</li>
              </ul>
              <div className="pt-4">
                <Button 
                  onClick={() => router.push('/submit')}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  Agregar "{query}" al diccionario
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Load More Button */}
      {hasMore && allResults.length > 0 && (
        <div className="text-center pt-6">
          <Button 
            onClick={onLoadMore}
            variant="outline"
            disabled={isLoading}
            className="min-w-32"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                <span>Cargando...</span>
              </div>
            ) : (
              'Cargar más resultados'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}