import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { receiverId, content } = await request.json() as { receiverId: string; content: string }
  if (!receiverId || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

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
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
