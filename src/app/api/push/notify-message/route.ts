import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidUUID } from '@/lib/validation'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { receiverId: string; content: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { receiverId, content } = body
  if (!isValidUUID(receiverId)) {
    return NextResponse.json({ error: 'receiverId must be a valid UUID' }, { status: 400 })
  }
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  // Get sender name and role
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const secret = process.env.INTERNAL_API_SECRET ?? ''

  // Receiver lands on their own messages view (opposite of sender's role)
  const url = senderProfile?.role === 'trainer' ? '/client/messages' : '/dashboard/messages'

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
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
