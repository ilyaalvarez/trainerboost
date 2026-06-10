import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendAppointmentReminderEmail } from '@/lib/email'

// Vercel Cron Job — runs daily at 7:00 AM UTC (configured in vercel.json)
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
  let emailsSent = 0

  for (const apt of (appointments ?? [])) {
    if (!apt.client_id) continue

    const aptTime   = new Date(apt.scheduled_at)
    const diffHours = (aptTime.getTime() - now.getTime()) / 3600000

    const is24h = diffHours >= 20 && diffHours <= 26
    const is2h  = diffHours >= 0  && diffHours <= 2

    if (!is24h && !is2h) continue

    const timeStr = aptTime.toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
    })
    const title = is24h ? 'Cita mañana'  : 'Cita próxima'
    const body  = is24h
      ? `Tienes una cita mañana a las ${timeStr}`
      : `Tu cita empieza en ${Math.round((aptTime.getTime() - now.getTime()) / 60000)} minutos`

    // In-app notifications (both parties)
    notifications.push(
      { user_id: apt.client_id,  type: 'appointment', title, body, link: '/client/appointments'   },
      { user_id: apt.trainer_id, type: 'appointment', title, body, link: '/dashboard/appointments' },
    )

    // Email reminders — only for 24h advance (not 2h, to avoid spam)
    if (is24h) {
      const [{ data: clientProfile }, { data: trainerProfile }] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', apt.client_id).single(),
        supabase.from('profiles').select('full_name').eq('id', apt.trainer_id).single(),
      ])

      // Get auth emails via service role (auth.users is accessible via admin API)
      const [{ data: clientUser }, { data: trainerUser }] = await Promise.all([
        supabase.auth.admin.getUserById(apt.client_id),
        supabase.auth.admin.getUserById(apt.trainer_id),
      ])

      const clientEmail  = clientUser?.user?.email
      const trainerEmail = trainerUser?.user?.email
      const clientName   = clientProfile?.full_name  ?? 'Cliente'
      const trainerName  = trainerProfile?.full_name ?? 'Entrenador'

      const emailPromises = []

      if (clientEmail) {
        emailPromises.push(
          sendAppointmentReminderEmail(clientEmail, clientName, trainerName, aptTime, apt.type, 'client')
        )
      }
      if (trainerEmail) {
        emailPromises.push(
          sendAppointmentReminderEmail(trainerEmail, trainerName, clientName, aptTime, apt.type, 'trainer')
        )
      }

      await Promise.allSettled(emailPromises)
      emailsSent += emailPromises.length
    }
  }

  if (notifications.length > 0) {
    const { error: insertError } = await supabase.from('notifications').insert(notifications)
    if (insertError) console.error('notifications insert error:', insertError)
  }

  return NextResponse.json({
    processed:    (appointments ?? []).length,
    notified:     notifications.length,
    emails_sent:  emailsSent,
    ran_at:       now.toISOString(),
  })
}
