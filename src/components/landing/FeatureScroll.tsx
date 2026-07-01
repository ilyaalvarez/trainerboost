'use client'
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const MODULES = [
  {
    id: 'clients',
    label: 'Gestión de clientes',
    description: 'Todos tus clientes en un sitio. Ficha, historial, objetivos y pagos.',
  },
  {
    id: 'tracking',
    label: 'Seguimiento de progreso',
    description: 'Gráficas de peso, fuerza y medidas. El cliente lo ve en tiempo real.',
  },
  {
    id: 'plans',
    label: 'Planes de entrenamiento',
    description: 'Crea y asigna rutinas en minutos. Plantillas reutilizables.',
  },
  {
    id: 'payments',
    label: 'Cobros automáticos',
    description: 'Stripe integrado. Tus clientes pagan solos, tú cobras a tiempo.',
  },
]

export function FeatureScroll() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef   = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!sectionRef.current || !trackRef.current) return

    const ctx = gsap.context(() => {
      const getDistance = () =>
        trackRef.current!.scrollWidth - window.innerWidth + 96

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        pin: true,
        scrub: 1.2,
        start: 'top top',
        end: () => `+=${getDistance()}`,
        onUpdate: (self) => {
          gsap.set(trackRef.current, {
            x: -getDistance() * self.progress,
          })
        },
      })

      gsap.from('.feature-scroll-title', {
        x: -40, opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'top 40%',
          scrub: true,
        },
      })

      return () => { st.kill() }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={sectionRef}
      style={{
        background: 'var(--tb-void)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        className="feature-scroll-title"
        style={{
          position: 'absolute',
          top: '40px', left: 'clamp(20px, 5vw, 64px)',
          zIndex: 10,
          fontFamily: 'monospace',
          fontSize: '11px',
          letterSpacing: '0.12em',
          color: 'var(--tb-muted)',
          textTransform: 'uppercase',
        }}
      >
        Módulos del sistema
      </div>

      <div
        ref={trackRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          paddingLeft: '64px',
          paddingRight: '64px',
          height: '100vh',
          width: 'max-content',
          willChange: 'transform',
        }}
      >
        {MODULES.map((mod, i) => (
          <div
            key={mod.id}
            style={{
              width: 'min(700px, 80vw)',
              height: 'min(480px, 60vh)',
              background: 'var(--tb-surface)',
              borderRadius: '12px',
              border: '1px solid var(--tb-border)',
              overflow: 'hidden',
              position: 'relative',
              flexShrink: 0,
              boxShadow: i === 1
                ? 'var(--shadow-brand-md)'
                : 'var(--shadow-brand-sm)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid var(--tb-border)',
            }}>
              <div style={{
                fontSize: '11px',
                color: 'var(--tb-brand)',
                fontFamily: 'monospace',
                letterSpacing: '0.08em',
                marginBottom: '6px',
              }}>
                0{i + 1}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(22px, 2.5vw, 32px)',
                color: 'var(--tb-text)',
                margin: '0 0 8px',
              }}>
                {mod.label}
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--tb-muted)',
                margin: 0,
                maxWidth: '360px',
                lineHeight: 1.6,
              }}>
                {mod.description}
              </p>
            </div>

            <div style={{
              flex: 1,
              background: 'var(--tb-surface-up)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--tb-faint)',
              fontSize: '12px',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
            }}>
              SCREENSHOT · {mod.id.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
