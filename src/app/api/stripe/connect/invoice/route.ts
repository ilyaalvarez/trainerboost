import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

const PLATFORM_FEE_PCT = 0.05 // 5%

const createSchema = z.object({
  clientId:    z.string().uuid(),
  description: z.string().min(1).max(200),
  amountEur:   z.number().positive().max(10000),
  dueDate:     z.string().optional(),
})

export async function POST(request: Request) {
  if (!stripe) return NextResponse.json({ error: 'Pagos no configurados' }, { status: 503 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  let raw: unknown
  try { raw = await request.json() } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 })
  }
  const { clientId, description, amountEur, dueDate } = parsed.data
  const amountCents = Math.round(amountEur * 100)

  // Verify trainer has Connect account
  const { data: trainerProfile } = await supabase
    .from('profiles')
    .select('role, stripe_connect_account_id, stripe_connect_status, full_name')
    .eq('id', user.id)
    .single()

  if (trainerProfile?.role !== 'trainer') {
    return NextResponse.json({ error: 'Solo entrenadores pueden facturar' }, { status: 403 })
  }
  if (!trainerProfile.stripe_connect_account_id || trainerProfile.stripe_connect_status !== 'active') {
    return NextResponse.json({ error: 'Activa los cobros en Ajustes antes de facturar' }, { status: 422 })
  }

  // Verify active trainer-client relationship
  const { data: relation } = await supabase
    .from('trainer_clients')
    .select('id')
    .eq('trainer_id', user.id)
    .eq('client_id', clientId)
    .eq('status', 'active')
    .single()

  if (!relation) {
    return NextResponse.json({ error: 'Cliente no encontrado o no activo' }, { status: 404 })
  }

  const admin = createServiceClient()
  const stripeAccount = trainerProfile.stripe_connect_account_id

  try {
    const platformFee = Math.round(amountCents * PLATFORM_FEE_PCT)

    // Create a one-time product + price on the connected account
    const product = await stripe.products.create(
      { name: description },
      { stripeAccount }
    )
    const price = await stripe.prices.create(
      { product: product.id, unit_amount: amountCents, currency: 'eur' },
      { stripeAccount }
    )

    // Payment Link with application fee (our platform cut)
    const paymentLink = await stripe.paymentLinks.create(
      {
        line_items: [{ price: price.id, quantity: 1 }],
        application_fee_amount: platformFee,
        after_completion: { type: 'hosted_confirmation', hosted_confirmation: { custom_message: `Gracias por pagar a ${trainerProfile.full_name}` } },
        metadata: { trainer_id: user.id, client_id: clientId },
      },
      { stripeAccount }
    )

    // Store in invoices table
    const { data: invoice, error: insertErr } = await admin
      .from('invoices')
      .insert({
        trainer_id:           user.id,
        client_id:            clientId,
        stripe_payment_link:  paymentLink.url,
        stripe_price_id:      price.id,
        stripe_product_id:    product.id,
        amount_cents:         amountCents,
        currency:             'eur',
        description,
        status:               'pending',
        due_date:             dueDate ?? null,
      })
      .select()
      .single()

    if (insertErr) {
      console.error('[stripe/connect/invoice] insert error:', insertErr)
      return NextResponse.json({ error: 'Error al guardar la factura' }, { status: 500 })
    }

    // Notify client
    await admin.from('notifications').insert({
      user_id: clientId,
      type:    'system',
      title:   `Cobro de ${trainerProfile.full_name}`,
      body:    `${trainerProfile.full_name} te ha enviado un cobro de ${amountEur}€: ${description}`,
      link:    '/client/invoices',
    })

    return NextResponse.json({
      ok:          true,
      invoiceId:   invoice?.id,
      paymentLink: paymentLink.url,
    })
  } catch (err) {
    console.error('[stripe/connect/invoice]', err)
    return NextResponse.json({ error: 'Error al crear el cobro' }, { status: 500 })
  }
}

// List invoices for a trainer (with optional clientId filter)
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')

  let query = supabase
    .from('invoices')
    .select('*, client:client_id(full_name, avatar_url)')
    .eq('trainer_id', user.id)
    .order('created_at', { ascending: false })

  if (clientId) query = query.eq('client_id', clientId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Error al obtener facturas' }, { status: 500 })

  return NextResponse.json({ invoices: data })
}
