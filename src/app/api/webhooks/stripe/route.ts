import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { stripe, PLANS, planFromPriceId, type PlanKey } from '@/lib/stripe'
import { isValidUUID } from '@/lib/validation'
import type Stripe from 'stripe'

/**
 * Resolve the plan a subscription is actually on, trusting the Stripe price
 * over mutable metadata. Falls back to metadata only if the price is unknown.
 */
function resolvePlan(sub: Stripe.Subscription): PlanKey | null {
  const priceId = sub.items?.data?.[0]?.price?.id
  return planFromPriceId(priceId) ?? ((sub.metadata?.plan as PlanKey) || null)
}

/** Read current_period_end as an ISO string, tolerant of SDK type drift. */
function periodEndISO(sub: Stripe.Subscription): string {
  const ts = (sub as unknown as { current_period_end: number }).current_period_end
  return new Date(ts * 1000).toISOString()
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !webhookSecret) {
    console.error('[stripe/webhook] stripe or STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 503 })
  }

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
      webhookSecret
    )
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // ── Idempotency: skip events we've already processed ──────────────────────
  // Requires a `stripe_events` table (id text primary key, processed_at timestamptz).
  // If the table is missing we log and continue (fail-open) so payments still work.
  try {
    const { error: insertErr } = await supabase
      .from('stripe_events')
      .insert({ id: event.id })
    if (insertErr) {
      // Unique violation → already processed → ack without reprocessing.
      if (insertErr.code === '23505') {
        return NextResponse.json({ received: true, duplicate: true })
      }
      // Any other error means the dedup table is unavailable — fail-safe
      // to prevent double-processing of financial events.
      console.error('stripe_events dedupe error:', insertErr.message)
      return NextResponse.json({ error: 'Dedup unavailable' }, { status: 503 })
    }
  } catch (err) {
    console.error('stripe_events dedupe threw:', err)
    return NextResponse.json({ error: 'Dedup unavailable' }, { status: 503 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId  = session.metadata?.supabase_user_id
        if (!isValidUUID(userId) || !session.subscription) break

        // Read the real subscription to derive the plan from the price paid.
        const sub      = await stripe.subscriptions.retrieve(session.subscription as string)
        const plan     = resolvePlan(sub)
        if (!plan) { console.error('checkout.session.completed: plan no resuelto'); break }

        await supabase.from('subscriptions').upsert({
          user_id:                userId,
          stripe_customer_id:     session.customer as string,
          stripe_subscription_id: session.subscription as string,
          status:                 'active',
          plan,
          max_clients:            PLANS[plan].maxClients,
          current_period_end:     periodEndISO(sub),
        }, { onConflict: 'user_id' })
        break
      }

      case 'customer.subscription.updated': {
        const sub  = event.data.object as Stripe.Subscription
        const plan = resolvePlan(sub)
        const isActive = sub.status === 'active' || sub.status === 'trialing'

        // Build the update without ever zeroing out a paying customer's plan.
        const update: Record<string, unknown> = {
          status:             isActive ? 'active' : sub.status,
          current_period_end: periodEndISO(sub),
        }
        if (plan) {
          update.plan        = plan
          update.max_clients = PLANS[plan].maxClients
        }

        await supabase.from('subscriptions')
          .update(update)
          .eq('stripe_subscription_id', sub.id)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await supabase.from('subscriptions')
          .update({ status: 'cancelled', plan: null, max_clients: 0 })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      case 'invoice.payment_succeeded': {
        // Recovery: restore a previously past_due subscription to active.
        const invoice = event.data.object as Stripe.Invoice
        const subId   = (invoice as unknown as { subscription?: string }).subscription
        if (!subId) break
        await supabase.from('subscriptions')
          .update({ status: 'active' })
          .eq('stripe_subscription_id', subId)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId   = (invoice as unknown as { subscription?: string }).subscription
        const query = supabase.from('subscriptions').update({ status: 'past_due' })
        // Scope to the affected subscription when available, else the customer.
        if (subId) await query.eq('stripe_subscription_id', subId)
        else       await query.eq('stripe_customer_id', invoice.customer as string)
        break
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
