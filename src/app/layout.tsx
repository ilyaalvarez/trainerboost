import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import CookieBanner from '@/components/CookieBanner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'TrainerBoost — Gestiona tu negocio de entrenamiento personal',
    template: '%s | TrainerBoost',
  },
  description: 'La plataforma SaaS para entrenadores personales: gestión de clientes, rutinas, nutrición, citas y mensajes en un solo lugar.',
  keywords: ['entrenador personal', 'gestión clientes', 'rutinas fitness', 'nutrición deportiva', 'plataforma entrenadores', 'software entrenador'],
  authors: [{ name: 'TrainerBoost' }],
  creator: 'TrainerBoost',
  metadataBase: new URL('https://app.trainerboost.es'),
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://app.trainerboost.es',
    siteName: 'TrainerBoost',
    title: 'TrainerBoost — Gestiona tu negocio de entrenamiento personal',
    description: 'La plataforma SaaS para entrenadores personales: gestión de clientes, rutinas, nutrición, citas y mensajes en un solo lugar.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TrainerBoost — Software para entrenadores personales' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrainerBoost — Gestiona tu negocio de entrenamiento',
    description: 'La plataforma SaaS para entrenadores personales que quieren escalar su negocio.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TrainerBoost',
  },
}

export const viewport: Viewport = {
  themeColor: '#0EA5E9',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#1E293B',
              border: '1px solid #334155',
              color: '#F1F5F9',
            },
          }}
        />
        <CookieBanner />
      </body>
    </html>
  )
}
