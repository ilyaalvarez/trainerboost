import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLANS, type PlanKey } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { plan } = await request.json() as { plan: PlanKey }
    const planConfig = PLANS[plan]
    if (!planConfig) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles').select('full_name').eq('id', user.id).single()

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, status')
      .eq('user_id', user.id)
      .single()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Already subscribed → send to the billing portal instead of opening a
    // second checkout (prevents duplicate parallel subscriptions / double billing).
    if (sub?.status === 'active' && sub.stripe_customer_id) {
      const portal = await stripe.billingPortal.sessions.create({
        customer:   sub.stripe_customer_id,
        return_url: `${appUrl}/dashboard/settings`,
      })
      return NextResponse.json({ url: portal.url })
    }

    // Get or create Stripe customer, persisting the id immediately so repeated
    // checkouts before the webhook fires don't create duplicate customers.
    let customerId = sub?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: profile?.full_name || '',
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await supabase.from('subscriptions').upsert(
        { user_id: user.id, stripe_customer_id: customerId },
        { onConflict: 'user_id' },
      )
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/settings?success=true`,
      cancel_url:  `${appUrl}/pricing?cancelled=true`,
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
      subscription_data: {
        trial_period_days: 14,
        metadata: { supabase_user_id: user.id, plan },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
