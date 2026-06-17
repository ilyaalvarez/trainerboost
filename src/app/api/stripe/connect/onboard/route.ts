import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
  if (!stripe) return NextResponse.json({ error: 'Pagos no configurados' }, { status: 503 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, stripe_connect_account_id').eq('id', user.id).single()
  if (profile?.role !== 'trainer') {
    return NextResponse.json({ error: 'Solo entrenadores pueden activar cobros' }, { status: 403 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const admin = createServiceClient()

  try {
    // Reuse existing account or create a new Express account
    let accountId = profile.stripe_connect_account_id

    if (!accountId) {
      const { data: authUser } = await admin.auth.admin.getUserById(user.id)
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'ES',
        email: authUser?.user?.email,
        capabilities: {
          card_payments: { requested: true },
          transfers:     { requested: true },
        },
        business_type: 'individual',
        settings: {
          payouts: { schedule: { interval: 'weekly', weekly_anchor: 'monday' } },
        },
      })
      accountId = account.id

      await admin
        .from('profiles')
        .update({ stripe_connect_account_id: accountId, stripe_connect_status: 'pending' })
        .eq('id', user.id)
    }

    const accountLink = await stripe.accountLinks.create({
      account:     accountId,
      refresh_url: `${appUrl}/api/stripe/connect/onboard`,
      return_url:  `${appUrl}/dashboard/settings?connect=success`,
      type:        'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err) {
    console.error('[stripe/connect/onboard]', err)
    return NextResponse.json({ error: 'Error al conectar con Stripe' }, { status: 500 })
  }
}

// Called by Stripe redirect — verify onboarding status and update DB
export async function GET(request: Request) {
  if (!stripe) return NextResponse.json({ error: 'Pagos no configurados' }, { status: 503 })

  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('account_id')
  if (!accountId) return NextResponse.json({ error: 'account_id requerido' }, { status: 400 })

  try {
    const account = await stripe.accounts.retrieve(accountId)
    const status = account.charges_enabled ? 'active' : 'pending'

    const admin = createServiceClient()
    await admin
      .from('profiles')
      .update({ stripe_connect_status: status })
      .eq('stripe_connect_account_id', accountId)

    return NextResponse.json({ status })
  } catch (err) {
    console.error('[stripe/connect/onboard GET]', err)
    return NextResponse.json({ error: 'Error al verificar cuenta' }, { status: 500 })
  }
}
