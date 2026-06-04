import { NextResponse } from 'next/server'
import { z } from 'zod'
import webpush from 'web-push'
import { createServiceClient } from '@/lib/supabase/server'

const sendSchema = z.object({
  userId: z.string().uuid(),
  title:  z.string().min(1).max(200),
  body:   z.string().max(500).optional(),
  url:    z.string().url().optional(),
})

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidEmail = process.env.VAPID_EMAIL ?? 'mailto:hola@trainerboost.es'

export async function POST(request: Request) {
  const secret = process.env.INTERNAL_API_SECRET
  const authHeader = request.headers.get('x-internal-secret')
  if (!secret || authHeader !== secret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!vapidPublicKey || !vapidPrivateKey) {
    return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 })
  }

  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey)

  let raw: unknown
  try { raw = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = sendSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }
  const { userId, title, body, url } = parsed.data

  const supabase = createServiceClient()
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return NextResponse.json({ sent: 0 })

  const pushPayload = JSON.stringify({ title, body, url })
  let sent = 0
  const stale: string[] = []

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, pushPayload)
        sent++
      } catch (err) {
        // 410 Gone = subscription expired, mark for cleanup
        if ((err as { statusCode?: number }).statusCode === 410) stale.push(sub.endpoint)
      }
    })
  )

  if (stale.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', stale)
  }

  return NextResponse.json({ sent, stale: stale.length })
}
