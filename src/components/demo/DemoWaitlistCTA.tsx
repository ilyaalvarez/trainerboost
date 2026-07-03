'use client'

import { useState, useRef } from 'react'

type State = 'idle' | 'loading' | 'success' | 'error'

interface Props {
  className?: string
  title?: string
  subtitle?: string
}

export default function DemoWaitlistCTA({
  className = '',
  title = '¿Te convence lo que ves?',
  subtitle = 'Apúntate a la lista de espera y te avisamos el día que abramos.',
}: Props) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [message, setMessage] = useState('')
  const honeypotRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (state === 'loading' || state === 'success') return
    setState('loading')
    setMessage('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'demo', website: honeypotRef.current?.value ?? '' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setState('error')
        setMessage(data.error ?? 'Error al unirse. Inténtalo de nuevo.')
        return
      }
      setState('success')
      setMessage(data.alreadyJoined ? 'Ya estás en la lista. Te avisamos cuando abramos.' : 'Recibido. Te avisamos antes del lanzamiento.')
    } catch {
      setState('error')
      setMessage('Sin conexión. Comprueba tu red e inténtalo de nuevo.')
    }
  }

  return (
    <div className={className}>
      <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-3">{title}</p>
      <p className="text-slate-400 text-sm mb-5">{subtitle}</p>

      {state !== 'success' ? (
        <form onSubmit={handleSubmit} noValidate>
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
          />
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              disabled={state === 'loading'}
              aria-label="Tu email para unirte a la lista de espera"
              className="flex-1 h-11 px-4 rounded-lg bg-background border border-border text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-primary/40 disabled:opacity-50 min-w-0"
            />
            <button
              type="submit"
              disabled={state === 'loading' || !email}
              className="btn-gradient h-11 px-6 text-sm whitespace-nowrap disabled:opacity-45 shrink-0"
            >
              {state === 'loading' ? 'Enviando...' : 'Avísame al lanzar'}
            </button>
          </div>
          {state === 'error' && (
            <p className="text-xs text-red-400 mt-2" role="alert">{message}</p>
          )}
        </form>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-primary/10 border border-brand-primary/20" role="status">
          <span className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6.5l2.5 2.5 5.5-5.5" stroke="#8FD43A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="text-sm text-white">{message}</p>
        </div>
      )}
    </div>
  )
}
