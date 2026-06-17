import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getRatelimiter } from '@/lib/ratelimit'

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Pass through OAuth callback without any Supabase interaction — calling
  // getUser() here before exchangeCodeForSession runs in the route handler
  // can corrupt the PKCE code-verifier cookie and break the flow.
  if (path.startsWith('/auth')) {
    return NextResponse.next({ request })
  }

  // ── Rate limiting (runs before auth to fail-fast on blocked IPs) ─────────
  const rl = getRatelimiter(path)
  if (rl) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      'anonymous'
    try {
      const { success, limit, reset } = await rl.limit(ip)
      if (!success) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Content-Type':          'text/plain',
            'Retry-After':           String(Math.ceil((reset - Date.now()) / 1000)),
            'X-RateLimit-Limit':     String(limit ?? 0),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset':     String(reset),
          },
        })
      }
    } catch {
      // Upstash unavailable — skip rate limiting rather than blocking all traffic
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

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // If Supabase is unreachable, treat as unauthenticated and let the
    // page-level auth guard handle it — don't crash the middleware
  }

  const publicPrefixes = ['/_next', '/favicon', '/api/webhooks', '/api/health', '/pricing', '/demo', '/auth', '/p/']
  const publicExact = ['/', '/login', '/register', '/onboarding', '/forgot-password', '/reset-password', '/privacy', '/terms', '/contact', '/manifest.json', '/sw.js', '/icon-192.png', '/icon-512.png']
  const isPublic = publicPrefixes.some(p => path.startsWith(p)) || publicExact.includes(path)

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (path === '/login' || path === '/register' || path === '/')) {
    // Invited user landing on /register?code=XXX while already logged in:
    // let the page redirect them to /onboarding?code=XXX instead of forcing /dashboard
    if (path === '/register' && request.nextUrl.searchParams.get('code')) {
      return supabaseResponse
    }
    try {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      if (!profile) return NextResponse.redirect(new URL('/onboarding', request.url))
      return NextResponse.redirect(
        new URL(profile.role === 'client' ? '/client' : '/dashboard', request.url)
      )
    } catch {
      return supabaseResponse
    }
  }

  if (path.startsWith('/dashboard') && user) {
    try {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      if (!profile) return NextResponse.redirect(new URL('/onboarding', request.url))
      if (profile.role !== 'trainer') return NextResponse.redirect(new URL('/client', request.url))
    } catch {
      return supabaseResponse
    }
  }

  if (path.startsWith('/client') && user) {
    try {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      if (!profile) return NextResponse.redirect(new URL('/onboarding', request.url))
      if (profile.role !== 'client') return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch {
      return supabaseResponse
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
