import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://trainerboost.es'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/es/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
      alternates: { languages: { es: `${BASE}/es/`, en: `${BASE}/en/` } },
    },
    {
      url: `${BASE}/en/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
      alternates: { languages: { es: `${BASE}/es/`, en: `${BASE}/en/` } },
    },
    { url: `${BASE}/pricing`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/login`,    lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/register`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.5 },
  ]

  try {
    const supabase = createServiceClient()
    const { data: profiles } = await supabase
      .from('trainer_public_profiles')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })
      .limit(500)

    const trainerRoutes: MetadataRoute.Sitemap = (profiles ?? []).map(p => ({
      url: `${BASE}/p/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    return [...staticRoutes, ...trainerRoutes]
  } catch {
    return staticRoutes
  }
}
