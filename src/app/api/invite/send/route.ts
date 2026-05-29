import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()

  // getUser() revalidates the JWT against the auth server (getSession does not).
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { invitationId } = await request.json() as { invitationId: string }
  if (!invitationId) {
    return NextResponse.json({ error: 'invitationId requerido' }, { status: 400 })
  }

  // Verify the caller actually owns this invitation (prevents IDOR).
  const { data: invitation } = await supabase
    .from('invitations')
    .select('id, trainer_id')
    .eq('id', invitationId)
    .single()

  if (!invitation || invitation.trainer_id !== user.id) {
    return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 })
  }

  const { data: { session } } = await supabase.auth.getSession()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const res = await fetch(`${supabaseUrl}/functions/v1/send-invitation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ invitationId }),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
