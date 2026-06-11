import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'trainer') {
    return NextResponse.json({ error: 'Solo entrenadores pueden activar un plan' }, { status: 403 })
  }

  const service = createServiceClient()

  // Don't downgrade an existing active paid plan
  const { data: existing } = await service
    .from('subscriptions')
    .select('status, plan')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing?.status === 'active' && existing.plan !== null) {
    return NextResponse.json({ ok: true, already_active: true })
  }

  const { error } = await service.from('subscriptions').upsert(
    { user_id: user.id, status: 'active', plan: null, max_clients: 3 },
    { onConflict: 'user_id' }
  )

  if (error) {
    console.error('[free-plan] upsert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
