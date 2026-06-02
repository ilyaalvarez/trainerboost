import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidUUID, isValidUrl } from '@/lib/validation'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let input: { userId: string; title: string; body?: string; url?: string }
  try {
    input = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { userId, title, body, url } = input
  if (!isValidUUID(userId)) {
    return NextResponse.json({ error: 'userId must be a valid UUID' }, { status: 400 })
  }
  if (!title || typeof title !== 'string' || title.length > 200) {
    return NextResponse.json({ error: 'title is required (max 200 chars)' }, { status: 400 })
  }
  if (url !== undefined && !isValidUrl(url)) {
    return NextResponse.json({ error: 'url must be a valid http/https URL' }, { status: 400 })
  }

  const secret = process.env.INTERNAL_API_SECRET
  if (!secret) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  fetch(`${appUrl}/api/push/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-secret': secret },
    body: JSON.stringify({ userId, title, body, url }),
    signal: AbortSignal.timeout(5000),
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
