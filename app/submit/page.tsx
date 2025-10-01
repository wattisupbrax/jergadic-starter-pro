'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import TermSubmissionForm from '@/components/forms/term-submission-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LogIn, Sparkles } from 'lucide-react'

export default function SubmitPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Sparkles className="h-16 w-16 mx-auto text-blue-600 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Únete a JergaDic!
              </h1>
              <p className="text-gray-600">
                Para contribuir con nuevos términos necesitas crear una cuenta o iniciar sesión.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/sign-up')}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Crear Cuenta
              </Button>
              
              <Button 
                onClick={() => router.push('/sign-in')}
                variant="outline"
                className="w-full"
              >
                Ya tengo cuenta
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>¿Por qué registrarse?</strong><br />
                • Contribuir con términos y definiciones<br />
                • Votar por las mejores definiciones<br />
                • Ganar puntos de reputación<br />
                • Obtener insignias por tus contribuciones
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="container mx-auto px-4">
        <TermSubmissionForm 
          onSuccess={() => {
            // Redirect to home or show success message
            router.push('/')
          }}
        />
      </div>
    </div>
  )
}