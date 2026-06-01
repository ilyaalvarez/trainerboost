import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      name?: string
      email?: string
      type?: string
      message?: string
    }
    const { name, email, type, message } = body

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Campos requeridos' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Mensaje demasiado largo' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase.from('contact_requests').insert({
      name:    name.trim().slice(0, 120),
      email:   email.trim().toLowerCase().slice(0, 254),
      type:    (type ?? 'general').slice(0, 50),
      message: message.trim().slice(0, 2000),
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
