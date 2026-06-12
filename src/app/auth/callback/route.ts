import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function safeNextPath(raw: string | null): string | null {
  if (!raw) return null
  // Must be a relative path starting with / but not // (open-redirect guard)
  if (!raw.startsWith('/') || raw.startsWith('//')) return null
  // Must not contain a protocol-like pattern after a slash
  if (/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) return null
  return raw
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code          = searchParams.get('code')
  const next          = safeNextPath(searchParams.get('next'))
  const errorParam    = searchParams.get('error')
  const errorDesc     = searchParams.get('error_description')

  if (errorParam) {
    const msg = encodeURIComponent(errorDesc ?? errorParam)
    return NextResponse.redirect(`${origin}/login?error=oauth_failed&message=${msg}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const cookieStore = await cookies()

  const newCookies: Array<{ name: string; value: string; options: Parameters<typeof cookieStore.set>[2] }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          newCookies.push(...cookiesToSet)
          cookiesToSet.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options) } catch { /* server component */ }
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    const msg = encodeURIComponent(error?.message ?? 'session_not_created')
    return NextResponse.redirect(`${origin}/login?error=exchange_failed&message=${msg}`)
  }

  const role = (data.session.user?.user_metadata?.role as string | undefined) ?? null
  const defaultDestination = role === 'client' ? `${origin}/onboarding` : `${origin}/dashboard`
  const destination = next ? `${origin}${next}` : defaultDestination

  const response = NextResponse.redirect(destination)

  newCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  return response
}
