'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'tb_rgpd_consent'

export default function RGPDConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Consentimiento de cookies"
      aria-modal="false"
      className="rgpd-banner"
    >
      <div className="rgpd-banner__content">
        <p className="rgpd-banner__text">
          Usamos cookies esenciales y análisis anónimos para mejorar la experiencia.
          Datos alojados en servidores EU. Sin seguimiento de terceros.{' '}
          <Link href="/privacy" className="underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity">
            Política de privacidad
          </Link>
        </p>
        <div className="rgpd-banner__actions">
          <button
            onClick={reject}
            className="rgpd-btn rgpd-btn--secondary"
            type="button"
          >
            Solo esenciales
          </button>
          <button
            onClick={accept}
            className="rgpd-btn rgpd-btn--primary"
            type="button"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
