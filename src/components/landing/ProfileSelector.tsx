'use client'
import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ClientCard } from './ClientCard'
import { getClients } from './clientData'
import type { Locale } from '@/messages/types'

interface ProfileBase {
  tab: string
  title: string
  desc: string
  bullets: string[]
  clientIdx: 0 | 1 | 2 | 3
}

const PROFILE_BASE: Record<Locale, ProfileBase[]> = {
  es: [
    {
      tab: '🏋️ Fuerza',
      title: 'Para entrenadores\nde fuerza y musculación',
      desc: 'Seguimiento de cargas, RPE y progresión de fuerza. Tus clientes ven cómo sus récords personales suben cada semana.',
      bullets: [
        'Registro de 1RM automático',
        'Progresión de series y pesos',
        'Gráficas de fuerza por grupo muscular',
      ],
      clientIdx: 2,
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
      clientIdx: 3,
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
      clientIdx: 0,
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
      clientIdx: 1,
    },
  ],
  en: [
    {
      tab: '🏋️ Strength',
      title: 'For strength\nand bodybuilding coaches',
      desc: 'Load tracking, RPE and strength progression. Your clients see their personal records rise week after week.',
      bullets: [
        'Automatic 1RM tracking',
        'Sets and weights progression',
        'Strength charts by muscle group',
      ],
      clientIdx: 2,
    },
    {
      tab: '🏃 Cardio',
      title: 'For running\nand endurance coaches',
      desc: 'Training plans by heart rate zones. Tracking paces, distances and aerobic evolution.',
      bullets: [
        'Built-in HR zones',
        'Weekly run plans',
        'Outdoor workout history',
      ],
      clientIdx: 3,
    },
    {
      tab: '🥗 Nutrition',
      title: 'For coaches\nwith nutritional focus',
      desc: 'Combine training and eating habits. Body composition and plan adherence tracking.',
      bullets: [
        'Body weight tracking',
        'Body fat % evolution',
        'Nutrition plan adherence',
      ],
      clientIdx: 0,
    },
    {
      tab: '⚡ Online',
      title: 'For coaches\nworking 100% remote',
      desc: 'Manage clients from anywhere with no in-person meetings. All tracking and payments fully digital.',
      bullets: [
        'Centralized chat with all clients',
        'Recurring payments without manual invoices',
        'Progress tracking without meeting in person',
      ],
      clientIdx: 1,
    },
  ],
}

const SECTION_LABEL: Record<Locale, string> = {
  es: 'Para cada tipo de entrenador',
  en: 'For every type of trainer',
}

export function ProfileSelector({ locale = 'es' }: { locale?: Locale }) {
  const [active, setActive] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const cardRef    = useRef<HTMLDivElement>(null)
  const tweenRef   = useRef<gsap.core.Tween | null>(null)

  const clients  = getClients(locale)
  const profiles = PROFILE_BASE[locale].map(p => ({ ...p, client: clients[p.clientIdx] }))
  const profile  = profiles[active]

  useEffect(() => () => { tweenRef.current?.kill() }, [])

  // Reset active tab when locale changes
  useEffect(() => { setActive(0) }, [locale])

  const handleTab = (idx: number) => {
    if (idx === active) return
    const els = [contentRef.current, cardRef.current].filter((el): el is HTMLDivElement => el !== null)
    gsap.killTweensOf(els)
    tweenRef.current = gsap.to(els, {
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

  return (
    <section className="profile-section" id="sistema">
      <p className="profile-section-label">{SECTION_LABEL[locale]}</p>

      <div className="profile-tabs" role="tablist">
        {profiles.map((p, i) => (
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
            key={`${locale}-${active}`}
            client={profile.client}
            animateMode="immediate"
          />
        </div>
      </div>
    </section>
  )
}
