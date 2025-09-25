'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import SearchBar from '@/components/search/search-bar'
import SearchResults from '@/components/search/search-results'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Search, 
  TrendingUp, 
  Clock, 
  Star,
  Filter,
  X,
  MapPin,
  Tag
} from 'lucide-react'

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

interface SearchData {
  query: string
  region: string
  results: {
    terms: SearchResult[]
    definitions: SearchResult[]
  }
  total: number
}

const popularSearches = [
  'chido', 'guay', 'chévere', 'bacano', 'padre', 
  'genial', 'cool', 'pana', 'compadre', 'carnal'
]

const recentSearches = [
  { word: 'chimba', region: 'Colombia' },
  { word: 'jato', region: 'Peru' },
  { word: 'piola', region: 'Argentina' },
  { word: 'vacano', region: 'Colombia' },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchData, setSearchData] = useState<SearchData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const initialQuery = searchParams.get('q') || ''
  const initialRegion = searchParams.get('region') || ''
  const initialTags = searchParams.get('tags')?.split(',').filter(Boolean) || []

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, {
        region: initialRegion,
        tags: initialTags
      }, 1)
    }
  }, [initialQuery, initialRegion, initialTags.join(',')])

  const performSearch = async (
    query: string, 
    filters: { region: string; tags: string[] },
    page: number = 1
  ) => {
    if (!query.trim()) return

    setIsLoading(true)
    
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        limit: '20',
        offset: ((page - 1) * 20).toString()
      })
      
      if (filters.region && filters.region !== 'all') {
        params.append('region', filters.region)
      }
      
      if (filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','))
      }

      const response = await fetch(`/api/search?${params}`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      
      if (page === 1) {
        setSearchData({
          query,
          region: filters.region || 'all',
          results: data.results,
          total: data.total
        })
      } else {
        // Append results for pagination
        setSearchData(prev => prev ? {
          ...prev,
          results: {
            terms: [...prev.results.terms, ...data.results.terms],
            definitions: [...prev.results.definitions, ...data.results.definitions]
          }
        } : null)
      }
      
      setCurrentPage(page)
      setHasMore(data.results.terms.length + data.results.definitions.length >= 20)
      
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string, filters: { region: string; tags: string[] }) => {
    // Update URL
    const params = new URLSearchParams({ q: query })
    if (filters.region && filters.region !== 'all') params.append('region', filters.region)
    if (filters.tags.length > 0) params.append('tags', filters.tags.join(','))
    
    const newUrl = `/search?${params}`
    if (window.location.pathname + window.location.search !== newUrl) {
      router.push(newUrl)
    }
    
    performSearch(query, filters, 1)
  }

  const handleLoadMore = () => {
    if (searchData && !isLoading) {
      performSearch(searchData.query, { 
        region: searchData.region, 
        tags: initialTags 
      }, currentPage + 1)
    }
  }

  const handlePopularSearch = (word: string) => {
    handleSearch(word, { region: 'all', tags: [] })
  }

  const clearSearch = () => {
    setSearchData(null)
    router.push('/search')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            
            {searchData && (
              <Button variant="ghost" onClick={clearSearch}>
                <X className="h-4 w-4 mr-2" />
                Nueva búsqueda
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <SearchBar 
            initialQuery={initialQuery}
            initialRegion={initialRegion}
            onSearch={handleSearch}
            showFilters={true}
            size="lg"
          />
        </div>

        {/* Active Filters */}
        {(initialRegion && initialRegion !== 'all' || initialTags.length > 0) && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filtros activos:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {initialRegion && initialRegion !== 'all' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{initialRegion}</span>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams)
                      params.delete('region')
                      router.push(`/search?${params}`)
                    }}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {initialTags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                  <Tag className="h-3 w-3" />
                  <span>{tag}</span>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams)
                      const newTags = initialTags.filter(t => t !== tag)
                      if (newTags.length > 0) {
                        params.set('tags', newTags.join(','))
                      } else {
                        params.delete('tags')
                      }
                      router.push(`/search?${params}`)
                    }}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchData ? (
          <SearchResults
            query={searchData.query}
            results={searchData.results}
            total={searchData.total}
            region={searchData.region}
            isLoading={isLoading}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
          />
        ) : (
          /* Discovery Content */
          <div className="space-y-8">
            {/* Popular Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span>Búsquedas populares</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((word, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-orange-100 hover:text-orange-800 transition-colors"
                      onClick={() => handlePopularSearch(word)}
                    >
                      <Search className="h-3 w-3 mr-1" />
                      {word}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Additions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span>Agregados recientemente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentSearches.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg hover:bg-green-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/term/${encodeURIComponent(item.word)}`)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{item.word}</span>
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {item.region}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Word of the Day */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span>Palabra del día</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-yellow-800 mb-2">chévere</h3>
                    <Badge variant="outline" className="mb-3">Venezuela</Badge>
                    <p className="text-gray-700 leading-relaxed">
                      Palabra para describir algo bueno, agradable o que causa satisfacción.
                    </p>
                    <p className="text-gray-600 italic mt-2">
                      "La fiesta estuvo muy chévere anoche."
                    </p>
                  </div>
                  <div className="text-center pt-4">
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/term/chévere')}
                    >
                      Ver definición completa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  <span>Consejos de búsqueda</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <strong>• Busca por región:</strong> Usa los filtros para encontrar jerga específica de un país
                  </div>
                  <div>
                    <strong>• Sinónimos automáticos:</strong> Haz clic en los sinónimos para explorar términos relacionados
                  </div>
                  <div>
                    <strong>• Etiquetas temáticas:</strong> Filtra por categorías como "comida", "trabajo", "amor"
                  </div>
                  <div>
                    <strong>• No encuentras algo:</strong> ¡Agrégalo tú mismo! Contribuye con nuevos términos
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}