import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_ENDPOINT = 2048
const MAX_KEY      = 256

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { endpoint: string; p256dh: string; auth: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { endpoint, p256dh, auth } = body
  if (!endpoint || typeof endpoint !== 'string' || endpoint.length > MAX_ENDPOINT ||
      !p256dh   || typeof p256dh   !== 'string' || p256dh.length   > MAX_KEY ||
      !auth     || typeof auth     !== 'string' || auth.length     > MAX_KEY) {
    return NextResponse.json({ error: 'Missing or invalid push subscription fields' }, { status: 400 })
  }

  const { error } = await supabase.from('push_subscriptions').upsert(
    { user_id: user.id, endpoint, p256dh, auth },
    { onConflict: 'endpoint' }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { endpoint: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { endpoint } = body
  if (!endpoint || typeof endpoint !== 'string' || endpoint.length > MAX_ENDPOINT) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  }

  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
