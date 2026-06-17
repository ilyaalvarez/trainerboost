import type { Metadata } from 'next'
import { siteConfig } from '../../../config/site'

interface PageMetaInput {
  title?: string
  description?: string
  path?: string
  image?: string
  noIndex?: boolean
}

export function buildMetadata({
  title,
  description,
  path = '',
  image = '/og-image.png',
  noIndex = false,
}: PageMetaInput = {}): Metadata {
  const fullTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} — ${siteConfig.tagline}`
  const desc = description ?? siteConfig.description
  const url = `${siteConfig.url}${path}`

  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url,
      siteName: siteConfig.name,
      title: fullTitle,
      description: desc,
      images: [{ url: image, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, 'max-image-preview': 'large' },
  }
}
