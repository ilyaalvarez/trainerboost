import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Vercel Cron — every day at 20:00 UTC
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron no configurado' }, { status: 503 })
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Fetch all active habits
  const { data: habits, error } = await supabase
    .from('habits')
    .select('id, client_id, name, icon')
    .eq('is_active', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group habits by client
  const habitsByClient = (habits ?? []).reduce((acc, h) => {
    if (!acc[h.client_id]) acc[h.client_id] = []
    acc[h.client_id].push(h)
    return acc
  }, {} as Record<string, typeof habits>)

  const clientIds = Object.keys(habitsByClient)
  if (clientIds.length === 0) {
    return NextResponse.json({ alerted: 0, ran_at: new Date().toISOString() })
  }

  // Fetch logs for today and yesterday for all relevant clients
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('habit_id, client_id, logged_date, completed')
    .in('client_id', clientIds)
    .gte('logged_date', yesterday)
    .eq('completed', true)

  const logSet = new Set(
    (logs ?? []).map(l => `${l.habit_id}:${l.logged_date}`)
  )

  let alerted = 0

  for (const clientId of clientIds) {
    const clientHabits = habitsByClient[clientId] ?? []

    // Identify habits where: completed yesterday (has streak) but NOT today
    const atRisk = clientHabits.filter(h =>
      logSet.has(`${h.id}:${yesterday}`) && !logSet.has(`${h.id}:${today}`)
    )

    if (atRisk.length === 0) continue

    // Check if we already sent an alert today for this client
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', clientId)
      .eq('type', 'streak_danger')
      .gte('created_at', `${today}T00:00:00`)
      .maybeSingle()

    if (existing) continue

    const habitNames = atRisk.map(h => `${h.icon} ${h.name}`).join(', ')
    const count = atRisk.length

    await supabase.from('notifications').insert({
      user_id: clientId,
      type:    'streak_danger',
      title:   count === 1
        ? `¡Tu racha de ${atRisk[0].name} está en peligro!`
        : `¡${count} rachas en peligro hoy!`,
      body: `No olvides completar: ${habitNames}. Tienes hasta medianoche.`,
      link: '/client/habits',
    })

    alerted++
  }

  return NextResponse.json({ alerted, ran_at: new Date().toISOString() })
}
