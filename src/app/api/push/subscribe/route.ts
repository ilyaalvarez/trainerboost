import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const subscribeSchema = z.object({
  endpoint: z.string().url().max(2048),
  p256dh:   z.string().min(1).max(256),
  auth:     z.string().min(1).max(256),
})

const unsubscribeSchema = z.object({
  endpoint: z.string().url().max(2048),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let raw: unknown
  try { raw = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = subscribeSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Missing or invalid push subscription fields' }, { status: 400 })
  }
  const { endpoint, p256dh, auth } = parsed.data

  const { error } = await supabase.from('push_subscriptions').upsert(
    { user_id: user.id, endpoint, p256dh, auth },
    { onConflict: 'endpoint' }
  )
  if (error) {
    console.error('[push/subscribe] upsert error:', error)
    return NextResponse.json({ error: 'Error al guardar suscripción push' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let raw: unknown
  try { raw = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = unsubscribeSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  }

  await supabase.from('push_subscriptions').delete().eq('endpoint', parsed.data.endpoint).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
