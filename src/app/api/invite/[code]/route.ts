import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: { code: string } },
) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('invitations')
    .select('id, trainer_id, email, expires_at, used_at, profiles!trainer_id(full_name)')
    .eq('code', params.code)
    .single()

  if (error || !data) {
    return NextResponse.json({ valid: false, error: 'Código inválido' }, { status: 404 })
  }

  if (data.used_at) {
    return NextResponse.json({ valid: false, error: 'Este código ya ha sido usado' }, { status: 409 })
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: 'Este código ha expirado' }, { status: 410 })
  }

  return NextResponse.json({
    valid: true,
    trainerId: data.trainer_id,
    trainerName: (data.profiles as { full_name: string } | null)?.full_name ?? 'Tu entrenador',
    email: data.email,
  })
}
