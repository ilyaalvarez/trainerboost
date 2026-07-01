'use client'

import { useState, useEffect, useRef } from 'react'
import { siteConfig } from '../../../config/site'
import { waitlistConfig } from '../../../config/waitlist'
import type { Locale } from '@/messages/types'

type State = 'idle' | 'loading' | 'success' | 'error'

interface WaitlistFormProps {
  className?: string
  locale?: Locale
  onSuccess?: (total: number) => void
}

const COPY: Record<Locale, {
  placeholder: string; buttonText: string; ariaEmail: string; ariaSubmit: string
  errorDefault: string; errorNetwork: string; successNew: string; successAlready: string
  spotsLeft: (n: number) => string
}> = {
  es: {
    placeholder: 'tu@email.com',
    buttonText: 'Avísame al lanzar',
    ariaEmail: 'Tu email para unirte a la lista de espera',
    ariaSubmit: 'Unirme a la lista de espera',
    errorDefault: 'Error al unirse. Inténtalo de nuevo.',
    errorNetwork: 'Sin conexión. Comprueba tu red e inténtalo de nuevo.',
    successNew: 'Recibido. Te avisamos antes del lanzamiento.',
    successAlready: 'Ya estás en la lista. Te avisamos cuando abramos.',
    spotsLeft: (n) => `${n} personas en la lista de espera`,
  },
  en: {
    placeholder: 'your@email.com',
    buttonText: 'Notify me at launch',
    ariaEmail: 'Your email to join the waitlist',
    ariaSubmit: 'Join the waitlist',
    errorDefault: 'Failed to join. Please try again.',
    errorNetwork: 'No connection. Check your network and try again.',
    successNew: "Received. We'll notify you before launch.",
    successAlready: "You're already on the list. We'll let you know when we open.",
    spotsLeft: (n) => `${n} people on the waitlist`,
  },
}

export default function WaitlistForm({ className = '', locale = 'es', onSuccess }: WaitlistFormProps) {
  const c = COPY[locale]
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
        setMessage(data.error ?? c.errorDefault)
        return
      }

      setState('success')
      if (data.alreadyJoined) {
        setMessage(c.successAlready)
      } else {
        setMessage(c.successNew)
        if (typeof data.total === 'number') setSpotsLeft(data.total)
      }
      onSuccess?.(data.total ?? siteConfig.waitlist.seedCount)
    } catch {
      setState('error')
      setMessage(c.errorNetwork)
    }
  }

  return (
    <div className={`waitlist-form-wrapper ${className}`}>
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
              placeholder={c.placeholder}
              required
              autoComplete="email"
              disabled={state === 'loading'}
              className="waitlist-input"
              aria-label={c.ariaEmail}
            />
            <button
              type="submit"
              disabled={state === 'loading' || !email}
              className="waitlist-btn"
              aria-label={c.ariaSubmit}
            >
              {state === 'loading' ? (
                <span className="waitlist-spinner" aria-hidden="true" />
              ) : (
                <>
                  <span>{c.buttonText}</span>
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
              <path d="M5 13l4 4L19 7" stroke="#C0392B" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="waitlist-success-text">{message}</p>
            {spotsLeft !== null && (
              <p className="waitlist-success-subtext">
                {c.spotsLeft(spotsLeft)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
