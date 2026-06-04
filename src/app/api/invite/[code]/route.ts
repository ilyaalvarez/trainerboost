import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const codeSchema = z.string().min(6).max(64).regex(/^[a-zA-Z0-9_-]+$/)

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await params
  const parsed = codeSchema.safeParse(rawCode?.trim())
  if (!parsed.success) {
    return NextResponse.json({ valid: false, error: 'Código inválido' }, { status: 400 })
  }
  const code = parsed.data

  const supabase = await createClient()

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

  const p = data.profiles as { full_name: string | null } | { full_name: string | null }[] | null
  const trainerName = (Array.isArray(p) ? p[0]?.full_name : (p as { full_name: string | null } | null)?.full_name) ?? 'Tu entrenador'

  return NextResponse.json({
    valid: true,
    trainerId: data.trainer_id,
    trainerName,
    email: data.email,
  })
}
