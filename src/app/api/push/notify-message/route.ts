import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const notifyMessageSchema = z.object({
  receiverId: z.string().uuid(),
  content:    z.string().min(1).max(2000),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let raw: unknown
  try { raw = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = notifyMessageSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }
  const { receiverId, content } = parsed.data

  // Verify an active trainer–client relationship exists between sender and receiver.
  // Prevents any authenticated user from spamming push notifications to arbitrary UUIDs.
  const { data: relationship } = await supabase
    .from('trainer_clients')
    .select('id')
    .or(
      `and(trainer_id.eq.${user.id},client_id.eq.${receiverId}),` +
      `and(client_id.eq.${user.id},trainer_id.eq.${receiverId})`
    )
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (!relationship) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  // Get sender name and role
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const secret = process.env.INTERNAL_API_SECRET

  // Receiver lands on their own messages view (opposite of sender's role)
  const url = senderProfile?.role === 'trainer' ? '/client/messages' : '/dashboard/messages'

  if (!secret) {
    console.warn('[push/notify-message] INTERNAL_API_SECRET no configurado — push omitido')
  } else {
    fetch(`${appUrl}/api/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-secret': secret },
      body: JSON.stringify({
        userId: receiverId,
        title: senderProfile?.full_name ?? 'Nuevo mensaje',
        body: content.slice(0, 100),
        url,
      }),
      signal: AbortSignal.timeout(5000),
    }).catch(err => console.error('[push/notify-message] Error al enviar push:', err))
  }

  return NextResponse.json({ ok: true })
}
