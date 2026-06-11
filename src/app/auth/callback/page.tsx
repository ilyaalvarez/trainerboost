'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [step, setStep] = useState('Verificando…')
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code          = params.get('code')
    const errorParam    = params.get('error')
    const errorDesc     = params.get('error_description')

    // Supabase redirects here with ?error=... when auth fails on their side
    if (errorParam) {
      const msg = decodeURIComponent(errorDesc || errorParam)
      setErr(msg)
      setTimeout(() => router.replace('/login?error=oauth_failed'), 4000)
      return
    }

    if (!code) {
      setErr('No se recibió código de autorización (code vacío)')
      setTimeout(() => router.replace('/login?error=no_code'), 4000)
      return
    }

    setStep('Intercambiando código…')

    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code)
      .then(({ data, error: exchError }) => {
        if (exchError) {
          setErr(`Error al verificar sesión: ${exchError.message}`)
          setTimeout(() => router.replace('/login?error=exchange_failed'), 4000)
          return
        }
        if (!data.session) {
          setErr('La sesión no se creó correctamente')
          setTimeout(() => router.replace('/login?error=no_session'), 4000)
          return
        }

        const role = (data.session.user?.user_metadata?.role as string | undefined) ?? null
        setStep('¡Sesión iniciada! Redirigiendo…')

        // Small delay to ensure cookies propagate before server-side navigation
        setTimeout(() => {
          router.replace(role === 'client' ? '/client' : '/dashboard')
        }, 200)
      })
      .catch((thrown: unknown) => {
        const msg = thrown instanceof Error ? thrown.message : String(thrown)
        setErr(`Error inesperado: ${msg}`)
        setTimeout(() => router.replace('/login?error=unexpected'), 4000)
      })
  }, [router])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0A0A0A',
        fontFamily: 'system-ui, sans-serif',
        padding: '24px',
        textAlign: 'center',
        gap: '16px',
      }}
    >
      {err ? (
        <>
          <div style={{ fontSize: '32px' }}>❌</div>
          <p style={{ color: '#EF4444', fontSize: '14px', maxWidth: '400px', lineHeight: 1.6 }}>
            {err}
          </p>
          <p style={{ color: '#475569', fontSize: '12px' }}>
            Redirigiendo al login en unos segundos…
          </p>
        </>
      ) : (
        <>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8FD43A"
            strokeWidth="2"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#94A3B8', fontSize: '15px' }}>{step}</p>
        </>
      )}
    </div>
  )
}
