import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Outfit } from 'next/font/google'
import Script from 'next/script'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import CookieBanner from '@/components/CookieBanner'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider'
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

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'TrainerBoost — Software para Entrenadores Personales',
    template: '%s | TrainerBoost',
  },
  description: 'Gestiona clientes, rutinas, pagos y seguimiento desde un solo lugar. La herramienta para entrenadores personales. Sin comisiones. Sin app que descargar.',
  keywords: ['software entrenador personal', 'personal trainer software', 'gestión clientes entrenamiento personal', 'herramienta entrenador personal', 'cobrar automaticamente entrenador personal', 'plataforma entrenadores personales', 'gestionar clientes entrenamiento'],
  authors: [{ name: 'TrainerBoost' }],
  creator: 'TrainerBoost',
  metadataBase: new URL('https://trainerboost.es'),
  openGraph: {
    type: 'website',
    url: 'https://trainerboost.es',
    siteName: 'TrainerBoost',
    title: 'TrainerBoost — Gestiona tu negocio de entrenamiento personal',
    description: 'La plataforma SaaS para entrenadores personales: gestión de clientes, rutinas, nutrición, citas y mensajes en un solo lugar.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TrainerBoost' }],
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
  themeColor: '#C0392B',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'TrainerBoost',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android',
  url: 'https://trainerboost.es',
  description: 'La plataforma SaaS para entrenadores personales: gestión de clientes, rutinas, nutrición, citas y mensajes en un solo lugar.',
  offers: [
    { '@type': 'Offer', name: 'Gratis',    price: '0',  priceCurrency: 'EUR' },
    { '@type': 'Offer', name: 'Starter',   price: '19', priceCurrency: 'EUR' },
    { '@type': 'Offer', name: 'Pro',       price: '39', priceCurrency: 'EUR' },
    { '@type': 'Offer', name: 'Unlimited', price: '79', priceCurrency: 'EUR' },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    reviewCount: '3',
    bestRating: '5',
  },
}

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`dark ${inter.variable} ${jetbrainsMono.variable} ${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-brand-primary focus:text-black focus:font-semibold focus:text-sm"
        >
          Saltar al contenido principal
        </a>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#141414',
              border: '1px solid #222222',
              color: '#F1F5F9',
            },
          }}
        />
        <Analytics />
        <SpeedInsights />
        <CookieBanner />
        <ServiceWorkerRegistration />
        {/* 🔑 Analytics: añade NEXT_PUBLIC_PLAUSIBLE_DOMAIN=app.trainerboost.es en .env.local y Vercel para activar */}
        {plausibleDomain && (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore — data-domain is a valid Plausible attribute
          <Script
            src="https://plausible.io/js/script.js"
            data-domain={plausibleDomain}
            strategy="lazyOnload"
          />
        )}
      </body>
    </html>
  )
}
