import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PublicProfileClient from './PublicProfileClient'
import type { TrainerPublicProfile, Profile } from '@/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: pub } = await supabase
    .from('trainer_public_profiles')
    .select('seo_title, seo_description, slug')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!pub) return { title: 'Entrenador no encontrado · TrainerBoost' }

  return {
    title: pub.seo_title ?? `${slug} · TrainerBoost`,
    description: pub.seo_description ?? 'Entrenador personal en TrainerBoost',
    openGraph: {
      title: pub.seo_title ?? `${slug} · TrainerBoost`,
      description: pub.seo_description ?? 'Entrenador personal en TrainerBoost',
    },
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: pub } = await supabase
    .from('trainer_public_profiles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!pub) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, bio, specialties')
    .eq('id', pub.trainer_id)
    .single()

  // Increment view count (fire and forget)
  supabase
    .from('trainer_public_profiles')
    .update({ views_count: (pub.views_count ?? 0) + 1 })
    .eq('id', pub.id)
    .then(() => {})

  return (
    <PublicProfileClient
      pub={pub as TrainerPublicProfile}
      profile={profile as Pick<Profile, 'full_name' | 'avatar_url' | 'bio' | 'specialties'>}
    />
  )
}
