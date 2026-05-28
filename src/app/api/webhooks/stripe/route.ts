import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { stripe, PLANS, type PlanKey } from '@/lib/stripe'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body      = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Sin firma' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = event.data.object as any
        const userId  = session.metadata?.supabase_user_id
        const plan    = session.metadata?.plan as PlanKey
        if (!userId || !plan) break

        const planConfig = PLANS[plan]
        await supabase.from('subscriptions').upsert({
          user_id:                userId,
          stripe_customer_id:     session.customer as string,
          stripe_subscription_id: session.subscription as string,
          status:                 'active',
          plan,
          max_clients:            planConfig.maxClients,
        }, { onConflict: 'user_id' })
        break
      }

      case 'customer.subscription.updated': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub    = event.data.object as any
        const userId = sub.metadata?.supabase_user_id
        const plan   = sub.metadata?.plan as PlanKey
        if (!userId) break

        const planConfig = plan ? PLANS[plan] : null
        await supabase.from('subscriptions')
          .update({
            status:               sub.status === 'active' ? 'active' : sub.status as string,
            plan:                 plan || null,
            max_clients:          planConfig?.maxClients || 0,
            current_period_end:   new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      case 'customer.subscription.deleted': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any
        await supabase.from('subscriptions')
          .update({ status: 'cancelled', plan: null, max_clients: 0 })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await supabase.from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', invoice.customer as string)
        break
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
