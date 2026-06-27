'use client'
import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ClientCard } from './ClientCard'
import { CLIENTS } from './clientData'
import type { ClientData } from './clientData'

interface Profile {
  tab: string
  title: string
  desc: string
  bullets: string[]
  client: ClientData
}

const PROFILES: Profile[] = [
  {
    tab: '🏋️ Fuerza',
    title: 'Para entrenadores\nde fuerza y musculación',
    desc: 'Seguimiento de cargas, RPE y progresión de fuerza. Tus clientes ven cómo sus récords personales suben cada semana.',
    bullets: [
      'Registro de 1RM automático',
      'Progresión de series y pesos',
      'Gráficas de fuerza por grupo muscular',
    ],
    client: CLIENTS[2], // Carlos R. — 78%
  },
  {
    tab: '🏃 Cardio',
    title: 'Para entrenadores\nde running y resistencia',
    desc: 'Planes de entrenamiento por zonas de frecuencia cardíaca. Seguimiento de ritmos, distancias y evolución aeróbica.',
    bullets: [
      'Zonas FC integradas',
      'Planes por semanas de carrera',
      'Historial de entrenamientos outdoor',
    ],
    client: CLIENTS[3], // María G. — completado
  },
  {
    tab: '🥗 Nutrición',
    title: 'Para entrenadores\ncon enfoque nutricional',
    desc: 'Combina entrenamiento y hábitos alimenticios. Seguimiento de composición corporal y adherencia al plan.',
    bullets: [
      'Registro de peso corporal',
      'Evolución de % grasa',
      'Adherencia al plan nutricional',
    ],
    client: CLIENTS[0], // Alejandro M. — 12%
  },
  {
    tab: '⚡ Online',
    title: 'Para entrenadores\nque trabajan 100% en remoto',
    desc: 'Gestiona clientes de toda España sin reuniones presenciales. Todo el seguimiento y los cobros de forma digital.',
    bullets: [
      'Chat con todos los clientes centralizado',
      'Pagos recurrentes sin facturas manuales',
      'Seguimiento sin necesidad de vernos',
    ],
    client: CLIENTS[1], // Sara L. — 45%
  },
]

export function ProfileSelector() {
  const [active, setActive] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const cardRef    = useRef<HTMLDivElement>(null)

  const handleTab = (idx: number) => {
    if (idx === active) return
    const els = [contentRef.current, cardRef.current].filter(Boolean)
    gsap.to(els, {
      opacity: 0,
      y: -6,
      duration: 0.25,
      ease: 'power2.out',
      onComplete: () => {
        setActive(idx)
        gsap.fromTo(
          els,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out' }
        )
      },
    })
  }

  const profile = PROFILES[active]

  return (
    <section className="profile-section" id="sistema">
      <p className="profile-section-label">Para cada tipo de entrenador</p>

      {/* Tabs */}
      <div className="profile-tabs" role="tablist">
        {PROFILES.map((p, i) => (
          <button
            key={p.tab}
            role="tab"
            aria-selected={active === i}
            className={`profile-tab${active === i ? ' profile-tab--active' : ''}`}
            onClick={() => handleTab(i)}
          >
            {p.tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="profile-content">
        <div ref={contentRef} className="profile-text-col">
          <h2 className="profile-title">
            {profile.title.split('\n').map((line, i) => (
              <span key={i} style={{ display: 'block' }}>{line}</span>
            ))}
          </h2>
          <p className="profile-desc">{profile.desc}</p>
          <ul className="profile-bullets">
            {profile.bullets.map((b) => (
              <li key={b} className="profile-bullet">{b}</li>
            ))}
          </ul>
        </div>

        <div ref={cardRef} className="profile-card-col">
          <ClientCard
            key={active}
            client={profile.client}
            animateMode="immediate"
          />
        </div>
      </div>
    </section>
  )
}
