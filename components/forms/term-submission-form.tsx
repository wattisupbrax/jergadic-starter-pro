'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, Plus, Eye, Send, Sparkles } from 'lucide-react'
import { useLocale } from '@/components/providers/locale-provider'
import { toast } from 'sonner'

const regions = [
  'General', 'Mexico', 'Spain', 'Argentina', 'Colombia', 'Venezuela',
  'Peru', 'Chile', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay',
  'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Nicaragua',
  'El Salvador', 'Dominican Republic', 'Puerto Rico', 'Cuba'
]

const availableTags = [
  'informal', 'juvenil', 'positivo', 'negativo', 'común',
  'vulgar', 'insulto', 'expresión', 'comida', 'dinero',
  'trabajo', 'familia', 'amigos', 'amor', 'música'
]

const SubmissionSchema = z.object({
  word: z.string().min(1, 'La palabra es requerida').max(100),
  definition: z.string().min(10, 'La definición debe tener al menos 10 caracteres').max(2000),
  example: z.string().max(500).optional(),
  synonyms: z.array(z.string()).optional(),
  region: z.string().min(1, 'La región es requerida'),
  tags: z.array(z.string()).min(1, 'Selecciona al menos una etiqueta'),
})

type SubmissionFormData = z.infer<typeof SubmissionSchema>

interface TermSubmissionFormProps {
  onSuccess?: () => void
}

export default function TermSubmissionForm({ onSuccess }: TermSubmissionFormProps) {
  const { t } = useLocale()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [synonymInput, setSynonymInput] = useState('')
  const [currentSynonyms, setCurrentSynonyms] = useState<string[]>([])
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(SubmissionSchema),
    defaultValues: {
      region: 'General',
      tags: [],
      synonyms: []
    }
  })

  const watchedValues = watch()

  const addSynonym = () => {
    if (synonymInput.trim() && !currentSynonyms.includes(synonymInput.trim().toLowerCase())) {
      const newSynonyms = [...currentSynonyms, synonymInput.trim().toLowerCase()]
      setCurrentSynonyms(newSynonyms)
      setValue('synonyms', newSynonyms)
      setSynonymInput('')
    }
  }

  const removeSynonym = (synonym: string) => {
    const newSynonyms = currentSynonyms.filter(s => s !== synonym)
    setCurrentSynonyms(newSynonyms)
    setValue('synonyms', newSynonyms)
  }

  const toggleTag = (tag: string) => {
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    setCurrentTags(newTags)
    setValue('tags', newTags)
  }

  const onSubmit = async (data: SubmissionFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: data.word.toLowerCase(),
          definition: data.definition,
          example: data.example,
          synonyms: data.synonyms || [],
          region: data.region,
          tags: data.tags,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al enviar el término')
      }

      toast.success('¡Término enviado exitosamente!', {
        description: 'Tu contribución ha sido agregada al diccionario.',
      })

      reset()
      setCurrentSynonyms([])
      setCurrentTags([])
      onSuccess?.()

    } catch (error) {
      toast.error('Error al enviar el término', {
        description: 'Por favor intenta de nuevo.',
      })
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const PreviewCard = () => (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-blue-800 capitalize">
              {watchedValues.word || 'tu-palabra'}
            </h3>
            <Badge variant="outline">{watchedValues.region || 'General'}</Badge>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-800 leading-relaxed">
              {watchedValues.definition || 'Tu definición aparecerá aquí...'}
            </p>
            {watchedValues.example && (
              <p className="text-gray-600 italic mt-3 border-l-4 border-yellow-400 pl-4">
                "{watchedValues.example}"
              </p>
            )}
          </div>

          {currentSynonyms.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Sinónimos:</p>
              <div className="flex flex-wrap gap-2">
                {currentSynonyms.map((synonym, index) => (
                  <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {synonym}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {currentTags.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Etiquetas:</p>
              <div className="flex flex-wrap gap-2">
                {currentTags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <Sparkles className="inline h-8 w-8 text-yellow-500 mr-2" />
          Enviar Nuevo Término
        </h1>
        <p className="text-gray-600">
          Comparte una palabra o frase de jerga con la comunidad
        </p>
      </div>

      <Tabs value={showPreview ? 'preview' : 'form'} onValueChange={(value) => setShowPreview(value === 'preview')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form" className="flex items-center space-x-2">
            <Send className="h-4 w-4" />
            <span>Formulario</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Vista previa</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Información del Término</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Word Input */}
                <div className="space-y-2">
                  <Label htmlFor="word" className="text-sm font-medium">
                    Palabra o Frase *
                  </Label>
                  <Input
                    id="word"
                    placeholder="ej: chido, qué padre, está padrísimo..."
                    {...register('word')}
                    className="text-lg"
                  />
                  {errors.word && (
                    <p className="text-sm text-red-600">{errors.word.message}</p>
                  )}
                </div>

                {/* Region Selection */}
                <div className="space-y-2">
                  <Label htmlFor="region" className="text-sm font-medium">
                    Región *
                  </Label>
                  <Select onValueChange={(value) => setValue('region', value)} defaultValue="General">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la región" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.region && (
                    <p className="text-sm text-red-600">{errors.region.message}</p>
                  )}
                </div>

                {/* Definition */}
                <div className="space-y-2">
                  <Label htmlFor="definition" className="text-sm font-medium">
                    Definición *
                  </Label>
                  <Textarea
                    id="definition"
                    placeholder="Explica qué significa esta palabra o frase..."
                    className="min-h-[100px] resize-y"
                    {...register('definition')}
                  />
                  {errors.definition && (
                    <p className="text-sm text-red-600">{errors.definition.message}</p>
                  )}
                </div>

                {/* Example */}
                <div className="space-y-2">
                  <Label htmlFor="example" className="text-sm font-medium">
                    Ejemplo de uso
                  </Label>
                  <Textarea
                    id="example"
                    placeholder="Ej: ¡Esa película está súper chida!"
                    className="min-h-[80px] resize-y"
                    {...register('example')}
                  />
                </div>

                {/* Synonyms */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Sinónimos</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Agregar sinónimo..."
                      value={synonymInput}
                      onChange={(e) => setSynonymInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSynonym())}
                    />
                    <Button type="button" onClick={addSynonym} size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {currentSynonyms.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {currentSynonyms.map((synonym, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                          <span>{synonym}</span>
                          <button
                            type="button"
                            onClick={() => removeSynonym(synonym)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Etiquetas * <span className="text-xs text-gray-500">(selecciona al menos una)</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={currentTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${
                          currentTags.includes(tag) 
                            ? 'bg-blue-600 text-white' 
                            : 'hover:bg-blue-100 hover:text-blue-800'
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {errors.tags && (
                    <p className="text-sm text-red-600">{errors.tags.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transform transition hover:scale-[1.02]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="h-4 w-4" />
                        <span>Enviar Término</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <div className="space-y-4">
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                Así es como se verá tu término en JergaDic
              </AlertDescription>
            </Alert>
            <PreviewCard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}