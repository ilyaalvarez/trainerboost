import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code          = searchParams.get('code')
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

  // Collect cookies written by Supabase so we can attach them to the redirect
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
  const destination = role === 'client' ? `${origin}/client` : `${origin}/dashboard`

  const response = NextResponse.redirect(destination)

  // Attach session cookies to the redirect so the browser sends them with the next request
  newCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  return response
}
