'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import SearchBar from '@/components/search/search-bar'
import { 
  Search, 
  TrendingUp, 
  Star, 
  Dice6, 
  Plus,
  BookOpen,
  Users,
  Globe,
  MessageSquare,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  ThumbsUp,
  Quote
} from 'lucide-react'
import { toast } from 'sonner'

interface WordOfDay {
  term: {
    word: string
    region: string
    tags: string[]
  }
  definition: {
    content: string
    example?: string
    votes: {
      up: number
      down: number
      score: number
    }
  } | null
  stats: {
    definitionCount: number
    totalVotesUp: number
    score: number
  }
}

interface TrendingItem {
  word: string
  region: string
  tags: string[]
  trendingScore: number
  definitionCount: number
}

export default function Home() {
  const router = useRouter()
  const [wordOfDay, setWordOfDay] = useState<WordOfDay | null>(null)
  const [trendingTerms, setTrendingTerms] = useState<TrendingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch word of the day and trending terms in parallel
        const [wordResponse, trendingResponse] = await Promise.all([
          fetch('/api/word-of-day'),
          fetch('/api/trending?limit=6&type=terms')
        ])

        if (wordResponse.ok) {
          const wordData = await wordResponse.json()
          setWordOfDay(wordData.wordOfDay)
        }

        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json()
          setTrendingTerms(trendingData.trending.terms || [])
        }
      } catch (error) {
        console.error('Error fetching home data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  const handleSearch = (query: string, filters: any) => {
    const params = new URLSearchParams({ q: query })
    if (filters.region && filters.region !== 'all') params.append('region', filters.region)
    if (filters.tags.length > 0) params.append('tags', filters.tags.join(','))
    router.push(`/search?${params}`)
  }

  const stats = {
    terms: '5,000+',
    definitions: '12,000+',
    users: '850+',
    regions: '21'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-12 w-12 text-yellow-300 mr-4 animate-pulse" />
              <h1 className="text-5xl lg:text-7xl font-bold">JergaDic</h1>
            </div>
            
            <p className="text-xl lg:text-2xl text-blue-100 mb-4">
              El diccionario colaborativo de jerga en español
            </p>
            
            <p className="text-lg text-blue-200 mb-12 max-w-2xl mx-auto">
              Descubre, aprende y comparte el significado de palabras coloquiales 
              de todos los países hispanohablantes
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-8">
              <SearchBar 
                placeholder="Buscar jerga, modismos, expresiones..."
                onSearch={handleSearch}
                showFilters={false}
                size="lg"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => router.push('/random')}
              >
                <Dice6 className="h-5 w-5 mr-2" />
                Término aleatorio
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => router.push('/submit')}
              >
                <Plus className="h-5 w-5 mr-2" />
                Agregar jerga
              </Button>
            </div>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="bg-black/20 py-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-300">{stats.terms}</div>
                <div className="text-sm text-blue-200">Términos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-300">{stats.definitions}</div>
                <div className="text-sm text-blue-200">Definiciones</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-300">{stats.users}</div>
                <div className="text-sm text-blue-200">Colaboradores</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-300">{stats.regions}</div>
                <div className="text-sm text-blue-200">Regiones</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Word of the Day */}
        {wordOfDay && (
          <section className="mb-12">
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 border-2 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-3 text-2xl">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <span>Palabra del Día</span>
                  <Star className="h-8 w-8 text-yellow-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-6">
                  <div>
                    <h3 className="text-4xl font-bold text-yellow-800 capitalize mb-3">
                      {wordOfDay.term.word}
                    </h3>
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <Badge variant="outline" className="text-yellow-700 border-yellow-400">
                        <MapPin className="h-3 w-3 mr-1" />
                        {wordOfDay.term.region}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-600">
                        <ThumbsUp className="h-4 w-4 mr-1 text-green-600" />
                        {wordOfDay.stats.score} votos
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MessageSquare className="h-4 w-4 mr-1 text-blue-600" />
                        {wordOfDay.stats.definitionCount} definicion{wordOfDay.stats.definitionCount !== 1 ? 'es' : ''}
                      </div>
                    </div>
                  </div>

                  {wordOfDay.definition && (
                    <div className="bg-white rounded-xl p-6 shadow-lg max-w-3xl mx-auto">
                      <p className="text-lg text-gray-800 leading-relaxed mb-4">
                        {wordOfDay.definition.content}
                      </p>
                      {wordOfDay.definition.example && (
                        <blockquote className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                          <p className="text-gray-700 italic">
                            <Quote className="inline h-4 w-4 mr-1" />
                            "{wordOfDay.definition.example}"
                          </p>
                        </blockquote>
                      )}
                    </div>
                  )}

                  {wordOfDay.term.tags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2">
                      {wordOfDay.term.tags.slice(0, 4).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button 
                    onClick={() => router.push(`/term/${encodeURIComponent(wordOfDay.term.word)}`)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg transform transition hover:scale-105"
                  >
                    Ver definición completa
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Trending Terms */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                  <span>Términos en Tendencia</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trendingTerms.map((term, index) => (
                      <div 
                        key={term.word}
                        className="p-4 border rounded-lg hover:bg-orange-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/term/${encodeURIComponent(term.word)}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full text-orange-600 font-bold text-sm">
                                {index + 1}
                              </div>
                              <h4 className="font-semibold text-gray-900 capitalize">
                                {term.word}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                {term.region}
                              </Badge>
                            </div>
                            <div className="ml-11 flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span>{term.definitionCount} definición{term.definitionCount !== 1 ? 'es' : ''}</span>
                              <span>•</span>
                              <span className="flex items-center">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Trending
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                    
                    <div className="text-center pt-4">
                      <Button variant="outline" onClick={() => router.push('/trending')}>
                        Ver más tendencias
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Discovery Sidebar */}
          <div className="space-y-6">
            {/* Quick Discovery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  <span>Descubrir</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => router.push('/random')}
                >
                  <Dice6 className="h-4 w-4 mr-2" />
                  Término aleatorio
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => router.push('/search')}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Búsqueda avanzada
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => router.push('/trending')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Tendencias
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => router.push('/recent')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Recién agregado
                </Button>
              </CardContent>
            </Card>

            {/* Contribute */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <Plus className="h-5 w-5" />
                  <span>Contribuir</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">
                  ¡Ayuda a hacer crecer el diccionario más chévere del español!
                </p>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => router.push('/submit')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar jerga
                  </Button>
                  
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => router.push('/profile')}
                    >
                      Ver mi perfil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span>Comunidad</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>+12 nuevos términos hoy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>+45 votos en la última hora</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>850+ colaboradores activos</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => router.push('/community')}
                >
                  Ver estadísticas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <section className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué JergaDic?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              La plataforma colaborativa que celebra la diversidad y riqueza del español coloquial
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-3">Diversidad Regional</h3>
              <p className="text-gray-600">
                Explora jerga de 21 países hispanohablantes y descubre las diferencias culturales
              </p>
            </Card>

            <Card className="text-center p-6">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-3">Colaborativo</h3>
              <p className="text-gray-600">
                Creado por la comunidad, para la comunidad. Todos pueden contribuir y aprender
              </p>
            </Card>

            <Card className="text-center p-6">
              <BookOpen className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibent text-gray-900 mb-3">Educativo</h3>
              <p className="text-gray-600">
                Aprende el contexto cultural detrás de cada término con ejemplos y explicaciones
              </p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
