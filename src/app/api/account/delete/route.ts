import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

/**
 * Permanently delete the authenticated user's account:
 *  1. Cancel any active Stripe subscription (stops billing).
 *  2. Delete the auth user via the service role (cascades app data).
 * The user's own session authenticates the request; the service client is
 * only used for the privileged delete.
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const admin = createServiceClient()

    // 1. Cancel the Stripe subscription if there is one.
    const { data: sub } = await admin
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .single()

    if (sub?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(sub.stripe_subscription_id)
      } catch (err) {
        // Already cancelled / not found → safe to continue with deletion.
        console.warn('No se pudo cancelar la suscripción en Stripe:', err)
      }
    }

    await admin.from('subscriptions')
      .update({ status: 'cancelled', plan: null, max_clients: 0 })
      .eq('user_id', user.id)

    // 2. Delete the auth user (FK cascades remove profile and related rows).
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id)
    if (delErr) {
      console.error('Error eliminando usuario:', delErr)
      return NextResponse.json({ error: 'No se pudo eliminar la cuenta' }, { status: 500 })
    }

    return NextResponse.json({ deleted: true })
  } catch (err) {
    console.error('Account deletion error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
