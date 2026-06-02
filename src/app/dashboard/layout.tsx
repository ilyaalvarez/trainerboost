import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import type { Profile, Subscription } from '@/types/database'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: subscription }, { count: unread }, { count: pendingApts }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, avatar_url, role').eq('id', user.id).single(),
    supabase.from('subscriptions').select('status, plan, max_clients').eq('user_id', user.id).single(),
    supabase.from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .is('read_at', null),
    supabase.from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('trainer_id', user.id)
      .eq('status', 'pending')
      .gte('scheduled_at', new Date().toISOString()),
  ])

  if (!profile) redirect('/onboarding')
  if (profile.role !== 'trainer') redirect('/client')

  return (
    <DashboardShell
      profile={profile as Profile}
      subscription={subscription as Subscription | null}
      unreadMessages={unread ?? 0}
      pendingApts={pendingApts ?? 0}
    >
      {children}
    </DashboardShell>
  )
}
