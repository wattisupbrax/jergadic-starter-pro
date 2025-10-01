'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  MapPin,
  Tag,
  Dice6,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react'
import { useLocale } from '@/components/providers/locale-provider'
import { toast } from 'sonner'

const regions = [
  'General', 'Mexico', 'Spain', 'Argentina', 'Colombia', 'Venezuela',
  'Peru', 'Chile', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay',
  'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Nicaragua',
  'El Salvador', 'Dominican Republic', 'Puerto Rico', 'Cuba'
]

const tags = [
  'informal', 'juvenil', 'positivo', 'negativo', 'común',
  'vulgar', 'insulto', 'expresión', 'comida', 'dinero',
  'trabajo', 'familia', 'amigos', 'amor', 'música'
]

interface SearchSuggestion {
  word: string
  region: string
}

interface SearchBarProps {
  initialQuery?: string
  initialRegion?: string
  onSearch?: (query: string, filters: SearchFilters) => void
  showFilters?: boolean
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
}

interface SearchFilters {
  region: string
  tags: string[]
}

export default function SearchBar({ 
  initialQuery = '', 
  initialRegion = '',
  onSearch,
  showFilters = true,
  placeholder = 'Buscar jerga...',
  size = 'md'
}: SearchBarProps) {
  const { t } = useLocale()
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState(initialRegion || 'all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFiltersOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()

  // Debounced autocomplete function
  const debouncedAutocomplete = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: 'autocomplete',
        limit: '8'
      })
      
      if (selectedRegion && selectedRegion !== 'all') {
        params.append('region', selectedRegion)
      }

      const response = await fetch(`/api/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Autocomplete error:', error)
    }
  }, [selectedRegion])

  // Handle input change with debouncing
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        debouncedAutocomplete(query.trim())
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [query, debouncedAutocomplete])

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (searchQuery?: string, suggestion?: SearchSuggestion) => {
    const finalQuery = searchQuery || suggestion?.word || query.trim()
    
    if (!finalQuery) {
      toast.error('Por favor ingresa un término de búsqueda')
      return
    }

    const filters: SearchFilters = {
      region: suggestion?.region || selectedRegion === 'all' ? '' : selectedRegion,
      tags: selectedTags
    }

    setShowSuggestions(false)

    if (onSearch) {
      onSearch(finalQuery, filters)
    } else {
      // Navigate to search page
      const params = new URLSearchParams({ q: finalQuery })
      if (filters.region) params.append('region', filters.region)
      if (filters.tags.length > 0) params.append('tags', filters.tags.join(','))
      
      router.push(`/search?${params}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSelectedRegion('all')
    setSelectedTags([])
  }

  const handleRandomSearch = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ random: 'true' })
      if (selectedRegion && selectedRegion !== 'all') {
        params.append('region', selectedRegion)
      }

      const response = await fetch(`/api/terms?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (data.term) {
          router.push(`/term/${encodeURIComponent(data.term.word)}`)
        }
      } else {
        throw new Error('Failed to get random term')
      }
    } catch (error) {
      toast.error('Error al obtener término aleatorio')
      console.error('Random search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10',
    lg: 'h-12 text-lg'
  }

  return (
    <div className="w-full space-y-4">
      {/* Main Search Input */}
      <div className="relative">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              onKeyDown={handleKeyDown}
              className={`${sizeClasses[size]} pl-10 pr-4 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <Button 
            onClick={() => handleSearch()}
            disabled={!query.trim()}
            className={`${sizeClasses[size]} bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700`}
          >
            <Search className="h-4 w-4" />
            {size === 'lg' && <span className="ml-2">Buscar</span>}
          </Button>

          <Button
            variant="outline"
            onClick={handleRandomSearch}
            disabled={isLoading}
            className={sizeClasses[size]}
            title="Término aleatorio"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            ) : (
              <Dice6 className="h-4 w-4" />
            )}
            {size === 'lg' && <span className="ml-2">Aleatorio</span>}
          </Button>

          {showFilters && (
            <Button
              variant="outline"
              onClick={() => setShowFiltersOpen(!showFilters)}
              className={`${sizeClasses[size]} ${(selectedRegion !== 'all' || selectedTags.length > 0) ? 'border-blue-500 bg-blue-50' : ''}`}
            >
              <Filter className="h-4 w-4" />
              {size === 'lg' && <span className="ml-2">Filtros</span>}
              {(selectedRegion !== 'all' || selectedTags.length > 0) && (
                <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                  {(selectedRegion !== 'all' ? 1 : 0) + selectedTags.length}
                </Badge>
              )}
            </Button>
          )}
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border-2 border-blue-200">
            <CardContent className="p-0">
              <div ref={suggestionsRef} className="max-h-64 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.word}-${suggestion.region}-${index}`}
                    className="flex items-center justify-between p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSearch(undefined, suggestion)}
                  >
                    <div className="flex items-center space-x-3">
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{suggestion.word}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {suggestion.region}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && showFilters && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filtros de búsqueda
              </h3>
              {(selectedRegion !== 'all' || selectedTags.length > 0) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Region Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Región
                </label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las regiones" />
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

              {/* Tags Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Etiquetas ({selectedTags.length} seleccionadas)
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-white">
                  {tags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        selectedTags.includes(tag) 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-blue-100 hover:text-blue-800'
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      {selectedTags.includes(tag) && <X className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-200">
              <Button variant="ghost" size="sm" onClick={() => router.push('/trending')}>
                <TrendingUp className="h-4 w-4 mr-1" />
                Términos populares
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/recent')}>
                <Clock className="h-4 w-4 mr-1" />
                Recién agregados
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/word-of-day')}>
                <Zap className="h-4 w-4 mr-1" />
                Palabra del día
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}