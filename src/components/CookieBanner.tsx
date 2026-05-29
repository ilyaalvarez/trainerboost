'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setShow(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setShow(false)
  }

  function reject() {
    localStorage.setItem('cookie-consent', 'rejected')
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t border-border/60"
      style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-slate-300 flex-1">
          Usamos cookies propias y de terceros para mejorar tu experiencia. Al navegar, aceptas nuestra{' '}
          <Link href="/privacy" className="text-brand-primary hover:underline">
            Política de privacidad
          </Link>
          .
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={reject} className="btn-secondary text-sm py-1.5 px-4">
            Rechazar
          </button>
          <button onClick={accept} className="btn-primary text-sm py-1.5 px-4">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
