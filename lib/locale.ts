export type Locale = 'es' | 'en'

export const translations = {
  es: {
    // Navigation
    home: 'Inicio',
    search: 'Buscar',
    submit: 'Enviar',
    profile: 'Perfil',
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    signOut: 'Cerrar Sesión',
    
    // Common UI
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    save: 'Guardar',
    edit: 'Editar',
    delete: 'Eliminar',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
    
    // Search
    searchPlaceholder: 'Buscar jerga...',
    noResults: 'No se encontraron resultados',
    searchResults: 'Resultados de búsqueda',
    randomSlang: 'Jerga Aleatoria',
    wordOfTheDay: 'Palabra del Día',
    
    // Terms
    term: 'Término',
    definition: 'Definición',
    example: 'Ejemplo',
    synonyms: 'Sinónimos',
    region: 'Región',
    tags: 'Etiquetas',
    author: 'Autor',
    votes: 'Votos',
    comments: 'Comentarios',
    dichos: 'Dichos',
    
    // Forms
    word: 'Palabra',
    wordPlaceholder: 'Ingresa la palabra o frase...',
    definitionPlaceholder: 'Define qué significa...',
    examplePlaceholder: 'Ejemplo de uso...',
    synonymsPlaceholder: 'Palabras similares (separadas por comas)',
    selectRegion: 'Selecciona la región',
    selectTags: 'Selecciona etiquetas',
    
    // Regions
    regions: {
      General: 'General',
      Mexico: 'México',
      Spain: 'España',
      Argentina: 'Argentina',
      Colombia: 'Colombia',
      Venezuela: 'Venezuela',
      Peru: 'Perú',
      Chile: 'Chile',
      Ecuador: 'Ecuador',
      Bolivia: 'Bolivia',
      Uruguay: 'Uruguay',
      Paraguay: 'Paraguay',
    },
    
    // Tags
    tagLabels: {
      informal: 'Informal',
      juvenil: 'Juvenil',
      positivo: 'Positivo',
      negativo: 'Negativo',
      común: 'Común',
      vulgar: 'Vulgar',
      insulto: 'Insulto',
      expresión: 'Expresión',
    },
    
    // User Profile
    contributions: 'Contribuciones',
    reputation: 'Reputación',
    badges: 'Insignias',
    termsSubmitted: 'Términos enviados',
    definitionsSubmitted: 'Definiciones enviadas',
    votesGiven: 'Votos dados',
    commentsPosted: 'Comentarios publicados',
    dichosSubmitted: 'Dichos enviados',
    
    // Messages
    welcomeBack: 'Bienvenido de vuelta al diccionario de jerga más chévere',
    joinCommunity: 'Únete a la comunidad de jerga',
    termSubmitted: 'Término enviado exitosamente',
    voteRecorded: 'Voto registrado',
    
    // Placeholders
    slangDictionary: 'Diccionario de jerga colaborativo',
    discoverShare: 'Descubre y comparte el significado de palabras coloquiales',
  },
  en: {
    // Navigation  
    home: 'Home',
    search: 'Search',
    submit: 'Submit',
    profile: 'Profile',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    
    // Common UI
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    
    // Search
    searchPlaceholder: 'Search slang...',
    noResults: 'No results found',
    searchResults: 'Search Results',
    randomSlang: 'Random Slang',
    wordOfTheDay: 'Word of the Day',
    
    // Terms
    term: 'Term',
    definition: 'Definition',
    example: 'Example',
    synonyms: 'Synonyms',
    region: 'Region',
    tags: 'Tags',
    author: 'Author',
    votes: 'Votes',
    comments: 'Comments',
    dichos: 'Sayings',
    
    // Forms
    word: 'Word',
    wordPlaceholder: 'Enter the word or phrase...',
    definitionPlaceholder: 'Define what it means...',
    examplePlaceholder: 'Usage example...',
    synonymsPlaceholder: 'Similar words (comma separated)',
    selectRegion: 'Select region',
    selectTags: 'Select tags',
    
    // Regions
    regions: {
      General: 'General',
      Mexico: 'Mexico',
      Spain: 'Spain',
      Argentina: 'Argentina',
      Colombia: 'Colombia',
      Venezuela: 'Venezuela',
      Peru: 'Peru',
      Chile: 'Chile',
      Ecuador: 'Ecuador',
      Bolivia: 'Bolivia',
      Uruguay: 'Uruguay',
      Paraguay: 'Paraguay',
    },
    
    // Tags
    tagLabels: {
      informal: 'Informal',
      juvenil: 'Youth',
      positivo: 'Positive',
      negativo: 'Negative',
      común: 'Common',
      vulgar: 'Vulgar',
      insulto: 'Insult',
      expresión: 'Expression',
    },
    
    // User Profile
    contributions: 'Contributions',
    reputation: 'Reputation',
    badges: 'Badges',
    termsSubmitted: 'Terms submitted',
    definitionsSubmitted: 'Definitions submitted',
    votesGiven: 'Votes given',
    commentsPosted: 'Comments posted',
    dichosSubmitted: 'Sayings submitted',
    
    // Messages
    welcomeBack: 'Welcome back to the coolest slang dictionary',
    joinCommunity: 'Join the slang community',
    termSubmitted: 'Term submitted successfully',
    voteRecorded: 'Vote recorded',
    
    // Placeholders
    slangDictionary: 'Collaborative slang dictionary',
    discoverShare: 'Discover and share the meaning of colloquial words',
  }
}

export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split('.')
  let value: any = translations[locale]
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return value || key
}