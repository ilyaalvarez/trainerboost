import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Vercel Cron Job — runs daily at 7:00 AM UTC (configured in vercel.json)
// Protected by CRON_SECRET injected automatically by Vercel
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const now   = new Date()
  const in26h = new Date(now.getTime() + 26 * 3600000)

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('id, trainer_id, client_id, scheduled_at, type, status')
    .in('status', ['pending', 'confirmed'])
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', in26h.toISOString())

  if (error) {
    console.error('appointment-reminders cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  type NotificationInsert = {
    user_id: string
    type: string
    title: string
    body: string
    link: string
  }

  const notifications: NotificationInsert[] = []

  for (const apt of (appointments ?? [])) {
    if (!apt.client_id) continue

    const aptTime  = new Date(apt.scheduled_at)
    const diffHours = (aptTime.getTime() - now.getTime()) / 3600000

    let title = ''
    let body  = ''

    if (diffHours >= 20 && diffHours <= 26) {
      const timeStr = aptTime.toLocaleTimeString('es-ES', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
      })
      title = 'Cita mañana'
      body  = `Tienes una cita mañana a las ${timeStr}`
    } else if (diffHours >= 0 && diffHours <= 2) {
      const mins = Math.round((aptTime.getTime() - now.getTime()) / 60000)
      title = 'Cita próxima'
      body  = `Tu cita empieza en ${mins} minutos`
    } else {
      continue
    }

    notifications.push(
      { user_id: apt.client_id,  type: 'appointment', title, body, link: '/client/appointments'   },
      { user_id: apt.trainer_id, type: 'appointment', title, body, link: '/dashboard/appointments' },
    )
  }

  if (notifications.length > 0) {
    const { error: insertError } = await supabase.from('notifications').insert(notifications)
    if (insertError) console.error('notifications insert error:', insertError)
  }

  return NextResponse.json({
    processed: (appointments ?? []).length,
    notified:  notifications.length,
    ran_at:    now.toISOString(),
  })
}
