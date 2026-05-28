import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientTopbar from '@/components/layout/ClientTopbar'
import type { Profile } from '@/types/database'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (!profile) redirect('/onboarding')
  if (profile.role !== 'client') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-background">
      <ClientTopbar profile={profile as Profile} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
