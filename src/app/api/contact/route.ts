import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name:    z.string().min(1).max(120),
  email:   z.string().email().max(254),
  type:    z.string().max(50).optional().default('general'),
  message: z.string().min(1).max(2000),
})

export async function POST(request: Request) {
  try {
    const parsed = contactSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Campos inválidos' }, { status: 400 })
    }
    const { name, email, type, message } = parsed.data

    const supabase = await createClient()
    const { error } = await supabase.from('contact_requests').insert({
      name:    name.trim(),
      email:   email.trim().toLowerCase(),
      type:    type ?? 'general',
      message: message.trim(),
    })

    if (error) {
      console.error('[contact] insert error:', error.message)
      return NextResponse.json({ error: 'Error al procesar' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] unexpected error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
