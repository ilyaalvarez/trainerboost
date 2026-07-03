import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getRatelimiter } from '@/lib/ratelimit'
import { waitlistConfig } from '../../../../config/waitlist'
import { siteConfig } from '../../../../config/site'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  try {
    const body = await req.json()
    const ALLOWED_SOURCES = ['landing', 'instagram', 'referral', 'seo', 'direct', 'demo']
    const rawSource = body.source
    const source = ALLOWED_SOURCES.includes(rawSource) ? rawSource : 'landing'
    const { email } = body

    // Honeypot check
    if (body[waitlistConfig.honeyPotField]) {
      return NextResponse.json({ success: true }) // silent drop
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(String(email).trim())) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    // Rate limiting by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
    const limiter = getRatelimiter('/api/waitlist')
    if (limiter) {
      const { success: allowed } = await limiter.limit(`waitlist:${ip}`)
      if (!allowed) {
        return NextResponse.json({ error: 'Demasiadas solicitudes. Inténtalo más tarde.' }, { status: 429 })
      }
    }

    const ipHash = crypto.createHash('sha256').update(ip).digest('hex')

    const { error } = await supabase
      .from('waitlist')
      .insert({ email: normalizedEmail, source, ip_hash: ipHash })

    if (error) {
      if (error.code === '23505') {
        // Duplicate — still return success (don't leak which emails are registered)
        return NextResponse.json({ success: true, alreadyJoined: true })
      }
      throw error
    }

    // Get total count (seed + real)
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    const total = (count ?? 0) + siteConfig.waitlist.seedCount

    return NextResponse.json({ success: true, total })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  try {
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    const total = (count ?? 0) + siteConfig.waitlist.seedCount
    const spotsLeft = Math.max(0, siteConfig.waitlist.totalSpots - total)

    return NextResponse.json({ total, spotsLeft })
  } catch {
    return NextResponse.json({ total: siteConfig.waitlist.seedCount, spotsLeft: siteConfig.waitlist.totalSpots - siteConfig.waitlist.seedCount })
  }
}
