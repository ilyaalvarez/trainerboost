import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const schema = z.object({
  code:  z.string().min(6).max(64),
  phone: z.string().regex(/^[\d\s\-()+]+$/).max(20).optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'client') {
    return NextResponse.json({ error: 'Solo clientes pueden aceptar invitaciones' }, { status: 403 })
  }

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
  const { code, phone } = parsed.data
  const trimmedCode = code.trim().toLowerCase()

  const admin = createServiceClient()

  const { data: inv } = await admin
    .from('invitations')
    .select('id, trainer_id')
    .eq('code', trimmedCode)
    .is('used_at', null)
    .gte('expires_at', new Date().toISOString())
    .single()

  if (!inv) return NextResponse.json({ error: 'Código inválido o expirado' }, { status: 404 })

  const [{ data: sub }, { count: clientCount }] = await Promise.all([
    admin.from('subscriptions').select('max_clients').eq('user_id', inv.trainer_id).single(),
    admin.from('trainer_clients').select('*', { count: 'exact', head: true })
      .eq('trainer_id', inv.trainer_id).eq('status', 'active'),
  ])

  if ((clientCount ?? 0) >= (sub?.max_clients ?? 3)) {
    return NextResponse.json(
      { error: 'El entrenador ha alcanzado el límite de clientes. Pídele que actualice su plan.' },
      { status: 409 }
    )
  }

  const { data: existing } = await admin
    .from('trainer_clients')
    .select('id')
    .eq('trainer_id', inv.trainer_id)
    .eq('client_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Ya estás vinculado con este entrenador' }, { status: 409 })
  }

  const [linkResult] = await Promise.all([
    admin.from('trainer_clients').insert({ trainer_id: inv.trainer_id, client_id: user.id }),
    admin.from('invitations').update({ used_at: new Date().toISOString() }).eq('id', inv.id),
    ...(phone ? [admin.from('profiles').update({ phone }).eq('id', user.id)] : []),
  ])

  const linkError = (linkResult as { error: { message: string; code?: string } | null }).error
  if (linkError) {
    // Unique violation: concurrent request already created the link or limit was exceeded
    if (linkError.code === '23505') {
      return NextResponse.json({ error: 'Ya estás vinculado con este entrenador' }, { status: 409 })
    }
    console.error('[invite/accept] link insert error:', linkError)
    return NextResponse.json({ error: 'Error al vincular con el entrenador' }, { status: 500 })
  }

  const [{ data: trainerProfile }, { data: clientProfile }] = await Promise.all([
    admin.from('profiles').select('full_name').eq('id', inv.trainer_id).single(),
    admin.from('profiles').select('full_name').eq('id', user.id).single(),
  ])

  // Notify the trainer that a client has joined
  await admin.from('notifications').insert({
    user_id:    inv.trainer_id,
    type:       'system',
    title:      `Nuevo cliente: ${clientProfile?.full_name ?? 'Cliente'}`,
    body:       'Ha aceptado tu invitación y se ha unido a tu equipo.',
    link:       `/dashboard/clients/${user.id}`,
  })

  return NextResponse.json({
    success: true,
    trainerName: trainerProfile?.full_name ?? 'Tu entrenador',
  })
}
