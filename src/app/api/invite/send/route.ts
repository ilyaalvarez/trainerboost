import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { sendInvitationEmail } from '@/lib/email'

const sendInviteSchema = z.object({
  invitationId: z.string().uuid(),
})

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = sendInviteSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'invitationId inválido' }, { status: 400 })
  }
  const { invitationId } = parsed.data

  // Fetch invitation + verify ownership (prevents IDOR)
  const { data: invitation } = await supabase
    .from('invitations')
    .select('id, trainer_id, code, email')
    .eq('id', invitationId)
    .single()

  if (!invitation || invitation.trainer_id !== user.id) {
    return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 })
  }

  if (!invitation.email) {
    return NextResponse.json({ error: 'La invitación no tiene email' }, { status: 400 })
  }

  // Fetch trainer name for the email
  const { data: trainerProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const trainerName = trainerProfile?.full_name ?? 'Tu entrenador'

  await sendInvitationEmail(invitation.email, trainerName, invitation.code)

  return NextResponse.json({ success: true })
}
