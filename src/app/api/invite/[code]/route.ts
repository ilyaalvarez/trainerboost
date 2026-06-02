import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CODE_RE = /^[a-zA-Z0-9_-]{6,64}$/

export async function GET(
  _request: Request,
  { params }: { params: { code: string } },
) {
  const code = params.code?.trim()
  if (!code || !CODE_RE.test(code)) {
    return NextResponse.json({ valid: false, error: 'Código inválido' }, { status: 400 })
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('invitations')
    .select('id, trainer_id, email, expires_at, used_at, profiles!trainer_id(full_name)')
    .eq('code', code)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trainerName: (data.profiles as any)?.[0]?.full_name ?? (data.profiles as any)?.full_name ?? 'Tu entrenador',
    email: data.email,
  })
}
