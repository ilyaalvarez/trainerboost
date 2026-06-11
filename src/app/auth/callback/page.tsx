'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Client-side OAuth callback — runs in the browser where createBrowserClient
// has direct access to the PKCE code-verifier cookie it stored when
// signInWithOAuth was called, avoiding any server-side cookie round-trip issues.
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const code = new URLSearchParams(window.location.search).get('code')

    if (!code) {
      router.replace('/login?error=auth_failed')
      return
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        router.replace('/login?error=auth_failed')
      } else {
        router.replace('/dashboard')
      }
    })
  }, [router])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0A0A0A',
        color: '#94A3B8',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        gap: '10px',
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8FD43A"
        strokeWidth="2"
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Iniciando sesión…
    </div>
  )
}
