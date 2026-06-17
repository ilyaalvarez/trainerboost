'use client'

import { useState, useEffect, useRef } from 'react'
import { siteConfig } from '../../../config/site'
import { waitlistConfig } from '../../../config/waitlist'

type State = 'idle' | 'loading' | 'success' | 'error'

interface WaitlistFormProps {
  className?: string
  onSuccess?: (total: number) => void
}

export default function WaitlistForm({ className = '', onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [message, setMessage] = useState('')
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/waitlist')
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.spotsLeft === 'number') setSpotsLeft(d.spotsLeft)
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (state === 'loading' || state === 'success') return

    setState('loading')
    setMessage('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'landing',
          [waitlistConfig.honeyPotField]: honeypotRef.current?.value ?? '',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setState('error')
        setMessage(data.error ?? 'Error al unirse. Inténtalo de nuevo.')
        return
      }

      setState('success')
      if (data.alreadyJoined) {
        setMessage('¡Ya estás en la lista! Te avisaremos cuando abramos.')
      } else {
        setMessage('¡Estás dentro! Te avisaremos antes del lanzamiento.')
        if (typeof data.total === 'number') {
          setSpotsLeft(Math.max(0, siteConfig.waitlist.totalSpots - data.total))
        }
      }
      onSuccess?.(data.total ?? siteConfig.waitlist.seedCount)
    } catch {
      setState('error')
      setMessage('Sin conexión. Comprueba tu red e inténtalo de nuevo.')
    }
  }

  return (
    <div className={`waitlist-form-wrapper ${className}`}>
      {/* FOMO spots counter */}
      {spotsLeft !== null && spotsLeft > 0 && state !== 'success' && (
        <div className="fomo-bar">
          <span className="fomo-dot" />
          <span className="font-mono text-[11px] text-brand-primary">
            {spotsLeft} plazas restantes de {siteConfig.waitlist.totalSpots}
          </span>
          <div
            className="fomo-progress"
            style={{ '--pct': `${((siteConfig.waitlist.totalSpots - spotsLeft) / siteConfig.waitlist.totalSpots) * 100}%` } as React.CSSProperties}
          />
        </div>
      )}

      {state !== 'success' ? (
        <form onSubmit={handleSubmit} className="waitlist-form" noValidate>
          {/* Honeypot — hidden from real users */}
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
          />

          <div className="waitlist-input-row">
            <input
              ref={inputRef}
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              disabled={state === 'loading'}
              className="waitlist-input"
              aria-label="Tu email para unirte a la lista de espera"
            />
            <button
              type="submit"
              disabled={state === 'loading' || !email}
              className="waitlist-btn"
              aria-label="Unirme a la lista de espera"
            >
              {state === 'loading' ? (
                <span className="waitlist-spinner" aria-hidden="true" />
              ) : (
                <>
                  <span>Quiero acceso</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {state === 'error' && (
            <p className="waitlist-msg waitlist-msg--error" role="alert">{message}</p>
          )}

          <p className="waitlist-legal">
            Sin spam. Sin tarjeta. Cancelas cuando quieras.
            {' '}
            <a href="/privacy" className="underline underline-offset-2 opacity-60 hover:opacity-100 transition-opacity">
              Privacidad
            </a>
          </p>
        </form>
      ) : (
        <div className="waitlist-success" role="status">
          <div className="waitlist-success-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#8FD43A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-fg-primary">{message}</p>
            {spotsLeft !== null && (
              <p className="text-xs text-fg-muted mt-1 font-mono">
                Quedan {spotsLeft} plazas de las {siteConfig.waitlist.totalSpots} de lanzamiento
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
