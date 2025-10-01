'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import { dark } from '@clerk/themes'

export default function ClerkClientProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  
  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === 'dark' ? dark : undefined,
        variables: {
          colorPrimary: '#1E40AF', // JergaDic deep blue
          colorSuccess: '#10B981', // JergaDic green
          colorWarning: '#FBBF24', // JergaDic bright yellow
          colorDanger: '#EF4444',
          fontFamily: 'var(--font-geist-sans)',
          borderRadius: '0.75rem',
        },
        elements: {
          card: {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: 'none',
          },
          headerTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1E40AF',
          },
          headerSubtitle: {
            color: '#6B7280',
          },
          socialButtonsBlockButton: {
            borderRadius: '0.5rem',
            border: '1px solid #E5E7EB',
            '&:hover': {
              backgroundColor: '#F9FAFB',
            },
          },
          formButtonPrimary: {
            backgroundColor: '#1E40AF',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            '&:hover': {
              backgroundColor: '#1D4ED8',
            },
          },
          formFieldInput: {
            borderRadius: '0.5rem',
            border: '1px solid #D1D5DB',
            '&:focus': {
              borderColor: '#1E40AF',
              boxShadow: '0 0 0 3px rgba(30, 64, 175, 0.1)',
            },
          },
          footerAction: {
            '& a': {
              color: '#1E40AF',
              '&:hover': {
                color: '#1D4ED8',
              },
            },
          },
        },
      }}
      localization={{
        signIn: {
          start: {
            title: 'Inicia sesión en JergaDic',
            subtitle: 'Bienvenido de vuelta al diccionario de jerga más chévere',
          },
        },
        signUp: {
          start: {
            title: 'Únete a JergaDic',
            subtitle: 'Crea tu cuenta y empieza a contribuir con jerga regional',
          },
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
