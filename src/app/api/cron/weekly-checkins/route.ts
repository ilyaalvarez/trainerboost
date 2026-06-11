import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendWeeklyCheckinEmail } from '@/lib/email'

// Vercel Cron — every Monday at 7:00 AM UTC
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('[cron/weekly-checkins] CRON_SECRET not set')
    return NextResponse.json({ error: 'Cron no configurado' }, { status: 503 })
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Get Monday of current week (UTC)
  const now = new Date()
  const day = now.getUTCDay()
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() - ((day === 0 ? 7 : day) - 1))
  const weekStart = monday.toISOString().split('T')[0]

  // Fetch all trainer_client pairs with checkins enabled
  const { data: pairs, error } = await supabase
    .from('trainer_clients')
    .select('client_id, trainer_id')
    .eq('checkins_enabled', true)
    .eq('status', 'active')

  if (error) {
    console.error('[weekly-checkins cron] fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Skip pairs that already submitted this week
  const clientIds = (pairs ?? []).map(p => p.client_id)
  const { data: existing } = await supabase
    .from('weekly_checkins')
    .select('client_id')
    .eq('week_start', weekStart)
    .in('client_id', clientIds.length > 0 ? clientIds : ['00000000-0000-0000-0000-000000000000'])

  const alreadyDone = new Set((existing ?? []).map(e => e.client_id))

  let sent = 0
  let notified = 0

  for (const pair of (pairs ?? [])) {
    if (alreadyDone.has(pair.client_id)) continue

    const [{ data: clientUser }, { data: trainerProfile }] = await Promise.all([
      supabase.auth.admin.getUserById(pair.client_id),
      supabase.from('profiles').select('full_name').eq('id', pair.trainer_id).single(),
    ])

    const clientEmail = clientUser?.user?.email
    const { data: clientProfile } = await supabase
      .from('profiles').select('full_name').eq('id', pair.client_id).single()

    const clientName  = clientProfile?.full_name  ?? 'Cliente'
    const trainerName = trainerProfile?.full_name ?? 'Tu entrenador'

    if (clientEmail) {
      await sendWeeklyCheckinEmail(clientEmail, clientName, trainerName)
      sent++
    }

    // In-app notification
    supabase.from('notifications').insert({
      user_id: pair.client_id,
      type:    'checkin',
      title:   'Check-in semanal disponible',
      body:    `${trainerName} quiere saber cómo fue tu semana. ¡Solo 5 preguntas!`,
      link:    '/client/checkin',
    }).then(({ error: ne }) => { if (ne) console.error('[weekly-checkins] notification error:', ne) })

    notified++
  }

  return NextResponse.json({
    week_start:  weekStart,
    pairs_total: (pairs ?? []).length,
    skipped:     alreadyDone.size,
    emails_sent: sent,
    notified,
    ran_at:      now.toISOString(),
  })
}
