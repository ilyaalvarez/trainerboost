import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const notifyEventSchema = z.object({
  userId: z.string().uuid(),
  title:  z.string().min(1).max(200),
  body:   z.string().max(500).optional(),
  url:    z.string().url().optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let raw: unknown
  try { raw = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = notifyEventSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }
  const { userId, title, body, url } = parsed.data

  // Verify the caller has an active trainer–client relationship with the target user.
  const { data: relationship } = await supabase
    .from('trainer_clients')
    .select('id')
    .or(
      `and(trainer_id.eq.${user.id},client_id.eq.${userId}),` +
      `and(client_id.eq.${user.id},trainer_id.eq.${userId})`
    )
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (!relationship) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const secret = process.env.INTERNAL_API_SECRET
  if (!secret) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  fetch(`${appUrl}/api/push/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-secret': secret },
    body: JSON.stringify({ userId, title, body, url }),
    signal: AbortSignal.timeout(5000),
  }).catch(err => console.error('[push/notify-event] Error al enviar push:', err))

  return NextResponse.json({ ok: true })
}
