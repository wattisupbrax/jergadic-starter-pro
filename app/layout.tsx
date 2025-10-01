import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import TanstackClientProvider from '@/components/providers/tanstack-client-provider'
import ClerkClientProvider from '@/components/providers/clerk-client-provider'
import { ThemeProvider } from 'next-themes'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'JergaDic - Diccionario de Jerga en Español',
  description: 'Diccionario colaborativo de jerga y modismos del español. Descubre y comparte el significado de palabras coloquiales de diferentes países hispanohablantes.',
  keywords: 'jerga, español, diccionario, slang, modismos, regionalismos, México, España, Argentina, Colombia, Venezuela',
  authors: [{ name: 'JergaDic Community' }],
  openGraph: {
    title: 'JergaDic - Diccionario de Jerga en Español',
    description: 'Diccionario colaborativo de jerga y modismos del español',
    type: 'website',
    locale: 'es_ES',
    alternateLocale: ['en_US'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  themeColor: '#1E40AF',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkClientProvider>
            <TanstackClientProvider>
              {children}
            </TanstackClientProvider>
          </ClerkClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
