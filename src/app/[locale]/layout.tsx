import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LOCALES, type Locale } from '@/messages/types'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://trainerboost.es'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!LOCALES.includes(locale as Locale)) notFound()

  const isEN = locale === 'en'

  return {
    title: isEN
      ? 'TrainerBoost — Software for Personal Trainers'
      : 'TrainerBoost — Software para Entrenadores Personales',
    description: isEN
      ? 'Manage clients, routines, payments and progress from one place. The tool for personal trainers. No commissions. No app to download.'
      : 'Gestiona clientes, rutinas, pagos y seguimiento desde un solo lugar. La herramienta para entrenadores personales. Sin comisiones. Sin app que descargar.',
    alternates: {
      canonical: `${BASE}/${locale}/`,
      languages: {
        es: `${BASE}/es/`,
        en: `${BASE}/en/`,
        'x-default': `${BASE}/es/`,
      },
    },
    openGraph: {
      locale: isEN ? 'en_US' : 'es_ES',
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!LOCALES.includes(locale as Locale)) notFound()
  return <>{children}</>
}
