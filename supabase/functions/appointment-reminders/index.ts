// Supabase Cron Job — Schedule in Supabase Dashboard → Cron
// Expression: 0 8 * * *   (daily at 8 AM UTC)
// Or: */30 * * * *         (every 30 minutes for real-time reminders)
//
// Manual trigger: POST https://<project>.supabase.co/functions/v1/appointment-reminders
// (with service role auth header)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Allow GET for cron and POST for manual trigger
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const now = new Date()
    const in2h = new Date(now.getTime() + 2 * 3600000)
    const in20h = new Date(now.getTime() + 20 * 3600000)
    const in26h = new Date(now.getTime() + 26 * 3600000)

    // Get appointments in the next 26 hours
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('id, trainer_id, client_id, scheduled_at, type, status')
      .in('status', ['pending', 'confirmed'])
      .gte('scheduled_at', now.toISOString())
      .lte('scheduled_at', in26h.toISOString())

    if (error) {
      console.error('Error fetching appointments:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const notifications: {
      user_id: string
      type: string
      title: string
      body: string
      link: string
    }[] = []

    for (const apt of (appointments ?? [])) {
      const aptTime = new Date(apt.scheduled_at)
      const diffMs = aptTime.getTime() - now.getTime()
      const diffHours = diffMs / 3600000

      let title = ''
      let body = ''

      if (diffHours >= 20 && diffHours <= 26) {
        // Tomorrow reminder
        const timeStr = aptTime.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Europe/Madrid',
        })
        title = 'Cita mañana'
        body = `Tienes una cita mañana a las ${timeStr}`
      } else if (diffHours >= 0 && diffHours <= 2) {
        // Imminent reminder
        const mins = Math.round(diffMs / 60000)
        title = 'Cita próxima'
        body = `Tu cita empieza en ${mins} minutos`
      } else {
        continue
      }

      // Notify client
      if (apt.client_id) {
        notifications.push({
          user_id: apt.client_id,
          type: 'appointment',
          title,
          body,
          link: '/client/appointments',
        })
      }

      // Notify trainer
      notifications.push({
        user_id: apt.trainer_id,
        type: 'appointment',
        title,
        body,
        link: '/dashboard/appointments',
      })
    }

    if (notifications.length > 0) {
      const { error: insertError } = await supabase.from('notifications').insert(notifications)
      if (insertError) {
        console.error('Error inserting notifications:', insertError)
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const result = {
      processed: (appointments ?? []).length,
      notified: notifications.length,
    }

    console.log('Appointment reminders result:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
