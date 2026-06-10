import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import { getUnreadMessageCount, getPendingAppointmentsCount, getPendingCheckinCount } from '@/lib/data/dashboard'
import type { Profile, Subscription } from '@/types/database'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: subscription }, unread, pendingApts, pendingCheckins] = await Promise.all([
    supabase.from('profiles').select('id, full_name, avatar_url, role').eq('id', user.id).single(),
    supabase.from('subscriptions').select('status, plan, max_clients').eq('user_id', user.id).single(),
    getUnreadMessageCount(user.id),
    getPendingAppointmentsCount(user.id),
    getPendingCheckinCount(user.id),
  ])

  if (!profile) redirect('/onboarding')
  if (profile.role !== 'trainer') redirect('/client')

  return (
    <DashboardShell
      profile={profile as Profile}
      subscription={subscription as Subscription | null}
      unreadMessages={unread ?? 0}
      pendingApts={pendingApts ?? 0}
      pendingCheckins={pendingCheckins ?? 0}
    >
      {children}
    </DashboardShell>
  )
}
