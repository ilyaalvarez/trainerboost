'use client'

import { useEffect, useRef } from 'react'

const STATS = [
  { value: '< 10 min', label: 'setup inicial' },
  { value: '0€', label: 'para tus clientes' },
  { value: '100%', label: 'en español' },
  { value: 'EU', label: 'servidores RGPD' },
] as const

export default function StatsBar() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = barRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('stats-bar--visible')
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={barRef} className="stats-bar" aria-label="Métricas clave de TrainerBoost">
      {STATS.map(({ value, label }, i) => (
        <div key={label} className="stats-bar__item">
          <span className="stats-bar__value font-mono">{value}</span>
          <span className="stats-bar__label">{label}</span>
          {i < STATS.length - 1 && <div className="stats-bar__divider" aria-hidden="true" />}
        </div>
      ))}
    </div>
  )
}
