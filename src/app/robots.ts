import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://trainerboost.es'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/p/', '/pricing', '/blog/', '/entrenador-personal/'],
        disallow: ['/dashboard/', '/client/', '/api/', '/login', '/register'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
