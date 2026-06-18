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
        if (typeof d.total === 'number') setSpotsLeft(d.total)
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
        setMessage('Ya estás en la lista. Te avisamos cuando abramos.')
      } else {
        setMessage('Recibido. Te avisamos antes del lanzamiento.')
        if (typeof data.total === 'number') setSpotsLeft(data.total)
      }
      onSuccess?.(data.total ?? siteConfig.waitlist.seedCount)
    } catch {
      setState('error')
      setMessage('Sin conexión. Comprueba tu red e inténtalo de nuevo.')
    }
  }

  return (
    <div className={`waitlist-form-wrapper ${className}`}>
      {spotsLeft !== null && spotsLeft > 0 && state !== 'success' && (
        <div className="waitlist-count-bar">
          <span className="waitlist-count-dot" />
          <span className="waitlist-count-text">
            {spotsLeft} entrenadores ya en lista
          </span>
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

        </form>
      ) : (
        <div className="waitlist-success" role="status">
          <div className="waitlist-success-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#D4892A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-fg-primary">{message}</p>
            {spotsLeft !== null && (
              <p className="text-xs text-fg-muted mt-1 font-mono">
                {spotsLeft} personas en la lista de espera
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
