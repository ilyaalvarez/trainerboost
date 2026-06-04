import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

const welcomeSchema = z.object({
  name: z.string().min(1).max(120),
  role: z.enum(['trainer', 'client']).optional().default('trainer'),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = welcomeSchema.safeParse(await request.json())
    if (!parsed.success || !user.email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const { name, role } = parsed.data

    await sendWelcomeEmail(user.email, name, role === 'client' ? 'client' : 'trainer')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[welcome-email] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
