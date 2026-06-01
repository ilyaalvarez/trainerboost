import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, role } = await request.json() as { name?: string; role?: string }
    if (!name || !user.email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    await sendWelcomeEmail(user.email, name, role === 'client' ? 'client' : 'trainer')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[welcome-email] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
