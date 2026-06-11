import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getRatelimiter } from '@/lib/ratelimit'

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // ── Rate limiting (runs before auth to fail-fast on blocked IPs) ─────────
  const rl = getRatelimiter(path)
  if (rl) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      'anonymous'
    const { success, limit, reset } = await rl.limit(ip)
    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Content-Type':        'text/plain',
          'Retry-After':         String(Math.ceil((reset - Date.now()) / 1000)),
          'X-RateLimit-Limit':   String(limit ?? 0),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset':   String(reset),
        },
      })
    }
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const publicPrefixes = ['/_next', '/favicon', '/api/webhooks', '/pricing', '/demo']
  const publicExact = ['/', '/login', '/register', '/onboarding', '/forgot-password', '/reset-password', '/privacy', '/terms', '/contact']
  const isPublic = publicPrefixes.some(p => path.startsWith(p)) || publicExact.includes(path)

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (path === '/login' || path === '/register' || path === '/')) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (!profile) return NextResponse.redirect(new URL('/onboarding', request.url))
    return NextResponse.redirect(
      new URL(profile.role === 'client' ? '/client' : '/dashboard', request.url)
    )
  }

  if (path.startsWith('/dashboard') && user) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (!profile) return NextResponse.redirect(new URL('/onboarding', request.url))
    if (profile.role !== 'trainer') return NextResponse.redirect(new URL('/client', request.url))
  }

  if (path.startsWith('/client') && user) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (!profile) return NextResponse.redirect(new URL('/onboarding', request.url))
    if (profile.role !== 'client') return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
