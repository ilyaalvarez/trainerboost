import { Resend } from 'resend'
import { escapeHtml } from '@/lib/validation'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM = 'TrainerBoost <hola@trainerboost.es>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.trainerboost.es'

export async function sendInvitationEmail(to: string, trainerName: string, code: string) {
  if (!resend) return
  const firstName = escapeHtml(trainerName.split(' ')[0])
  const link = `${APP_URL}/onboarding?code=${encodeURIComponent(code)}`
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${firstName} te invita a TrainerBoost 💪`,
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0F172A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#0EA5E9,#7C3AED);padding:10px 20px;border-radius:12px;">
        <span style="color:white;font-size:18px;font-weight:800;">⚡ TrainerBoost</span>
      </div>
    </div>
    <div style="background:#1E293B;border:1px solid #334155;border-radius:20px;padding:36px;">
      <h1 style="color:white;font-size:22px;font-weight:700;margin:0 0 12px;">Tu entrenador te está esperando</h1>
      <p style="color:#94A3B8;font-size:15px;line-height:1.6;margin:0 0 24px;">
        <strong style="color:#E2E8F0;">${firstName}</strong> te ha invitado a unirte a su portal de entrenamiento personal en TrainerBoost.
      </p>
      <div style="background:#263548;border-radius:12px;padding:20px;text-align:center;margin-bottom:28px;">
        <p style="color:#94A3B8;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Tu código de acceso</p>
        <div style="color:#0EA5E9;font-size:28px;font-weight:800;font-family:monospace;letter-spacing:4px;">${escapeHtml(code)}</div>
      </div>
      <div style="text-align:center;">
        <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#0EA5E9,#7C3AED);color:white;font-weight:700;font-size:15px;text-decoration:none;padding:14px 36px;border-radius:12px;">
          Activar mi cuenta →
        </a>
      </div>
      <p style="color:#475569;font-size:13px;text-align:center;margin-top:20px;">
        O introduce el código manualmente en <a href="${APP_URL}/onboarding" style="color:#0EA5E9;">${APP_URL}/onboarding</a>
      </p>
    </div>
    <p style="color:#475569;font-size:12px;text-align:center;margin-top:24px;">
      © 2026 TrainerBoost · Spain 🇪🇸 · <a href="mailto:hola@trainerboost.es" style="color:#0EA5E9;">hola@trainerboost.es</a>
    </p>
  </div>
</body>
</html>`,
  }).catch(err => { console.error('[email] sendInvitationEmail failed:', err?.message) })
}

export async function sendAppointmentReminderEmail(
  to: string,
  recipientName: string,
  otherPartyName: string,
  aptTime: Date,
  aptType: string,
  role: 'client' | 'trainer',
) {
  if (!resend) return
  const firstName   = escapeHtml(recipientName.split(' ')[0])
  const otherFirst  = escapeHtml(otherPartyName.split(' ')[0])
  const timeStr = aptTime.toLocaleString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
  })
  const link = role === 'client' ? `${APP_URL}/client/appointments` : `${APP_URL}/dashboard/appointments`
  const typeLabel = aptType === 'online' ? 'Online' : aptType === 'llamada' ? 'Llamada' : 'Presencial'

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Recordatorio: cita mañana a las ${aptTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })}`,
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0F172A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#0EA5E9,#7C3AED);padding:10px 20px;border-radius:12px;">
        <span style="color:white;font-size:18px;font-weight:800;">⚡ TrainerBoost</span>
      </div>
    </div>
    <div style="background:#1E293B;border:1px solid #334155;border-radius:20px;padding:36px;">
      <h1 style="color:white;font-size:22px;font-weight:700;margin:0 0 8px;">Hola, ${firstName} 👋</h1>
      <p style="color:#94A3B8;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Te recordamos que mañana tienes una cita con <strong style="color:#E2E8F0;">${otherFirst}</strong>.
      </p>
      <div style="background:#263548;border-radius:12px;padding:20px;margin-bottom:28px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <span style="font-size:20px;">📅</span>
          <div>
            <div style="color:#E2E8F0;font-size:14px;font-weight:600;">${timeStr.charAt(0).toUpperCase() + timeStr.slice(1)}</div>
            <div style="color:#64748B;font-size:12px;margin-top:2px;">${typeLabel}</div>
          </div>
        </div>
      </div>
      <div style="text-align:center;">
        <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#0EA5E9,#7C3AED);color:white;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:10px;">
          Ver mis citas →
        </a>
      </div>
    </div>
    <p style="color:#475569;font-size:12px;text-align:center;margin-top:24px;">
      © 2026 TrainerBoost · <a href="mailto:hola@trainerboost.es" style="color:#0EA5E9;">hola@trainerboost.es</a>
    </p>
  </div>
</body>
</html>`,
  }).catch(err => { console.error('[email] sendAppointmentReminderEmail failed:', err?.message) })
}

export async function sendWeeklyCheckinEmail(to: string, clientName: string, trainerName: string) {
  if (!resend) return
  const firstName   = escapeHtml(clientName.split(' ')[0])
  const trainerFirst = escapeHtml(trainerName.split(' ')[0])
  const link = `${APP_URL}/client/checkin`

  await resend.emails.send({
    from: FROM,
    to,
    subject: `${trainerFirst} quiere saber cómo fue tu semana 💪`,
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0F172A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:540px;margin:40px auto;padding:0 20px;">
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#10B981,#0EA5E9);padding:10px 20px;border-radius:12px;">
        <span style="color:white;font-size:18px;font-weight:800;">💪 TrainerBoost</span>
      </div>
    </div>
    <div style="background:#1E293B;border:1px solid #334155;border-radius:20px;padding:36px;">
      <h1 style="color:white;font-size:22px;font-weight:700;margin:0 0 12px;">¡Hola, ${firstName}!</h1>
      <p style="color:#94A3B8;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Tu entrenador <strong style="color:#E2E8F0;">${trainerFirst}</strong> quiere saber cómo fue tu semana.
        Solo son 5 preguntas rápidas — te lleva menos de 2 minutos.
      </p>
      <div style="background:#263548;border-radius:12px;padding:16px;margin-bottom:28px;">
        ${['Energía de la semana (1-10)','Dolor o molestias','Adherencia a la rutina','Adherencia a la dieta','Peso actual (opcional)'].map((q, i) => `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:${i < 4 ? '10px' : '0'};">
          <div style="width:20px;height:20px;background:rgba(16,185,129,0.2);border:1px solid rgba(16,185,129,0.3);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span style="color:#10B981;font-size:10px;font-weight:700;">${i + 1}</span>
          </div>
          <span style="color:#CBD5E1;font-size:13px;">${q}</span>
        </div>`).join('')}
      </div>
      <div style="text-align:center;">
        <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#10B981,#0EA5E9);color:white;font-weight:700;font-size:15px;text-decoration:none;padding:14px 36px;border-radius:12px;">
          Hacer mi check-in →
        </a>
      </div>
    </div>
    <p style="color:#475569;font-size:12px;text-align:center;margin-top:24px;">
      © 2026 TrainerBoost · <a href="mailto:hola@trainerboost.es" style="color:#0EA5E9;">hola@trainerboost.es</a>
    </p>
  </div>
</body>
</html>`,
  }).catch(err => { console.error('[email] sendWeeklyCheckinEmail failed:', err?.message) })
}

export async function sendWelcomeEmail(to: string, name: string, role: 'trainer' | 'client') {
  if (!resend) return

  const subject = role === 'trainer'
    ? `Bienvenido a TrainerBoost, ${name.split(' ')[0]} 👋`
    : `Tu portal está listo, ${name.split(' ')[0]} 💪`

  const html = role === 'trainer'
    ? trainerWelcomeHtml(name)
    : clientWelcomeHtml(name)

  await resend.emails.send({ from: FROM, to, subject, html }).catch(err => {
    console.error('[email] sendWelcomeEmail failed:', err?.message)
  })
}

function trainerWelcomeHtml(name: string) {
  const firstName = escapeHtml(name.split(' ')[0])
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Bienvenido a TrainerBoost</title></head>
<body style="margin:0;padding:0;background:#0F172A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#0EA5E9,#7C3AED);padding:10px 20px;border-radius:12px;">
        <span style="color:white;font-size:18px;font-weight:800;letter-spacing:-0.5px;">⚡ TrainerBoost</span>
      </div>
    </div>

    <!-- Card -->
    <div style="background:#1E293B;border:1px solid #334155;border-radius:20px;padding:36px;">
      <h1 style="color:white;font-size:22px;font-weight:700;margin:0 0 8px;">Hola, ${firstName} 👋</h1>
      <p style="color:#94A3B8;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Tu cuenta de TrainerBoost está lista. Esto es lo que puedes hacer ahora mismo:
      </p>

      <!-- Steps -->
      <div style="space-y:12px;">
        ${['Añade tu primer cliente — invítalo por email o código', 'Crea su primera rutina — ejercicios, series y notas de coaching', 'Configura tu perfil — especialidades y bio profesional'].map((step, i) => `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:12px;background:#263548;border-radius:10px;margin-bottom:10px;">
          <div style="width:24px;height:24px;background:linear-gradient(135deg,#0EA5E9,#7C3AED);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span style="color:white;font-size:11px;font-weight:700;">${i + 1}</span>
          </div>
          <span style="color:#E2E8F0;font-size:14px;line-height:1.4;">${step}</span>
        </div>`).join('')}
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-top:28px;">
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#0EA5E9,#7C3AED);color:white;font-weight:700;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:12px;">
          Acceder a mi panel →
        </a>
      </div>

      <!-- Free plan note -->
      <div style="margin-top:24px;padding:14px;background:rgba(14,165,233,0.08);border:1px solid rgba(14,165,233,0.2);border-radius:10px;">
        <p style="color:#94A3B8;font-size:13px;margin:0;line-height:1.5;">
          <strong style="color:#E2E8F0;">Plan gratuito incluido.</strong> Gestiona hasta 3 clientes sin tarjeta. Escala cuando quieras desde 19€/mes.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <p style="color:#475569;font-size:12px;text-align:center;margin-top:24px;line-height:1.6;">
      ¿Necesitas ayuda? Responde a este email o escríbenos a
      <a href="mailto:hola@trainerboost.es" style="color:#0EA5E9;">hola@trainerboost.es</a><br>
      © 2026 TrainerBoost · Spain 🇪🇸
    </p>
  </div>
</body>
</html>`
}

function clientWelcomeHtml(name: string) {
  const firstName = escapeHtml(name.split(' ')[0])
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Tu portal está listo</title></head>
<body style="margin:0;padding:0;background:#0F172A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#10B981,#0EA5E9);padding:10px 20px;border-radius:12px;">
        <span style="color:white;font-size:18px;font-weight:800;letter-spacing:-0.5px;">💪 TrainerBoost</span>
      </div>
    </div>

    <div style="background:#1E293B;border:1px solid #334155;border-radius:20px;padding:36px;">
      <h1 style="color:white;font-size:22px;font-weight:700;margin:0 0 8px;">¡Tu portal está listo, ${firstName}!</h1>
      <p style="color:#94A3B8;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Tu entrenador te enviará un código de invitación para conectaros. Mientras tanto, ya tienes acceso a:
      </p>

      ${['Tu rutina del día con sets y reps', 'Plan de nutrición y macros', 'Registro de progreso y evolución', 'Chat directo con tu entrenador'].map(f => `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <span style="color:#10B981;font-size:16px;">✓</span>
        <span style="color:#E2E8F0;font-size:14px;">${f}</span>
      </div>`).join('')}

      <div style="text-align:center;margin-top:28px;">
        <a href="${APP_URL}/client" style="display:inline-block;background:linear-gradient(135deg,#10B981,#0EA5E9);color:white;font-weight:700;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:12px;">
          Ir a mi portal →
        </a>
      </div>
    </div>

    <p style="color:#475569;font-size:12px;text-align:center;margin-top:24px;">
      © 2026 TrainerBoost · Spain 🇪🇸
    </p>
  </div>
</body>
</html>`
}
