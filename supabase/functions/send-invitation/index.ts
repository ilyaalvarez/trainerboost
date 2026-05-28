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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    // Verify caller is authenticated
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const { invitationId } = await req.json() as { invitationId: string }

    // Fetch invitation + trainer profile
    const { data: invitation, error: invErr } = await supabaseAdmin
      .from('invitations')
      .select('*, trainer:trainer_id(full_name, email:id)')
      .eq('id', invitationId)
      .eq('trainer_id', user.id)
      .single()

    if (invErr || !invitation) {
      return new Response(JSON.stringify({ error: 'Invitation not found' }), { status: 404, headers: corsHeaders })
    }

    // Fetch trainer profile for name
    const { data: trainerProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const trainerName = trainerProfile?.full_name ?? 'Tu entrenador'
    const appUrl = Deno.env.get('APP_URL') ?? 'https://app.trainerboost.es'
    const onboardingUrl = `${appUrl}/onboarding`

    // Send email via Supabase's built-in SMTP (uses Resend/SMTP configured in project)
    const { error: emailError } = await supabaseAdmin.auth.admin.sendRawEmail({
      to: invitation.email,
      subject: `${trainerName} te invita a TrainerBoost`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 0; }
    .container { max-width: 520px; margin: 40px auto; padding: 0 20px; }
    .card { background: #1E293B; border: 1px solid #334155; border-radius: 16px; padding: 40px; }
    .logo { font-size: 24px; font-weight: 800; color: #0EA5E9; margin-bottom: 32px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 12px; }
    p { color: #94A3B8; line-height: 1.6; margin: 0 0 24px; }
    .code-box { background: #0F172A; border: 1px solid #334155; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .code { font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0EA5E9; }
    .btn { display: inline-block; background: #0EA5E9; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; }
    .footer { text-align: center; color: #475569; font-size: 12px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">TrainerBoost ⚡</div>
      <h1>¡Tienes una invitación!</h1>
      <p><strong style="color:#F8FAFC">${trainerName}</strong> te ha invitado a unirte a TrainerBoost como su cliente. Accede a tus rutinas, planes nutricionales y progreso en un solo lugar.</p>
      <div class="code-box">
        <p style="margin:0 0 8px;font-size:13px;color:#64748B">Tu código de invitación</p>
        <div class="code">${invitation.code.toUpperCase()}</div>
      </div>
      <p>Crea tu cuenta y usa este código cuando te lo pidan para conectarte con tu entrenador.</p>
      <a href="${onboardingUrl}" class="btn">Crear mi cuenta →</a>
      <p style="margin-top:24px;font-size:13px">El código expira el <strong style="color:#F8FAFC">${new Date(invitation.expires_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.</p>
    </div>
    <div class="footer">TrainerBoost · <a href="${appUrl}" style="color:#0EA5E9">app.trainerboost.es</a></div>
  </div>
</body>
</html>
      `.trim(),
    })

    if (emailError) {
      console.error('Email error:', emailError)
      return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: corsHeaders })
  }
})
