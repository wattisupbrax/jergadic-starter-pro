'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TermDisplay from '@/components/term/term-display'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Search, AlertCircle, Plus } from 'lucide-react'

interface Term {
  _id: string
  word: string
  region: string
  tags: string[]
  synonyms: string[]
  createdAt: string
  authorId: string
}

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

export default function TermPage() {
  const params = useParams()
  const router = useRouter()
  const word = decodeURIComponent(params.word as string)
  
  const [term, setTerm] = useState<Term | null>(null)
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!word) return

    const fetchTermData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/terms?word=${encodeURIComponent(word.toLowerCase())}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('term_not_found')
          } else {
            throw new Error('Failed to fetch term data')
          }
          return
        }

        const data = await response.json()
        setTerm(data.term)
        setDefinitions(data.definitions || [])
      } catch (err) {
        console.error('Error fetching term:', err)
        setError('fetch_error')
      } finally {
        setLoading(false)
      }
    }

    fetchTermData()
  }, [word])

  const handleSynonymClick = (synonym: string, region: string) => {
    router.push(`/term/${encodeURIComponent(synonym.toLowerCase())}?region=${encodeURIComponent(region)}`)
  }

  const handleBack = () => {
    router.back()
  }

  const handleAddDefinition = () => {
    router.push(`/submit?word=${encodeURIComponent(word)}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando término...</p>
        </div>
      </div>
    )
  }

  if (error === 'term_not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                "{word}" no encontrado
              </h1>
              <p className="text-gray-600 mb-6">
                Este término aún no existe en JergaDic. ¡Sé el primero en agregarlo!
              </p>
              
              <div className="space-y-4">
                <Button onClick={handleAddDefinition} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar "{word}" al diccionario
                </Button>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={() => router.push('/search')}>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar otros términos
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/')}>
                    Volver al inicio
                  </Button>
                </div>
              </div>

              <Alert className="mt-8 text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>¿No encuentras lo que buscas?</strong><br />
                  Recuerda que puedes buscar sinónimos o variaciones regionales del término.
                  También puedes contribuir agregando nuevas palabras de jerga.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error === 'fetch_error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error al cargar
            </h2>
            <p className="text-gray-600 mb-6">
              No se pudo cargar la información del término. Por favor intenta de nuevo.
            </p>
            <div className="space-y-3">
              <Button onClick={() => window.location.reload()} className="w-full">
                Reintentar
              </Button>
              <Button variant="outline" onClick={handleBack} className="w-full">
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!term) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="container mx-auto px-4">
        {/* Navigation */}
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Term Display */}
        <TermDisplay 
          term={term}
          definitions={definitions}
          onSynonymClick={handleSynonymClick}
        />

        {/* Add Definition CTA */}
        {definitions.length === 0 && (
          <Card className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Este término necesita definiciones
              </h3>
              <p className="text-gray-600 mb-4">
                Ayuda a la comunidad agregando la primera definición para "{term.word}"
              </p>
              <Button onClick={handleAddDefinition} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar definición
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Alternative: Add Another Definition */}
        {definitions.length > 0 && (
          <Card className="mt-6 bg-gray-50">
            <CardContent className="p-4 text-center">
              <p className="text-gray-600 mb-3">
                ¿Conoces otra definición o uso para "{term.word}"?
              </p>
              <Button variant="outline" onClick={handleAddDefinition}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar otra definición
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}