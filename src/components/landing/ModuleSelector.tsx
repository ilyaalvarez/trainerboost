'use client'
import { useRef, useState } from 'react'
import gsap from 'gsap'

const TABS = [
  { id: 'clients',  label: 'Clientes',     icon: '◆' },
  { id: 'track',    label: 'Seguimiento',  icon: '◈' },
  { id: 'payments', label: 'Cobros',       icon: '◇' },
  { id: 'comms',    label: 'Comunicación', icon: '○' },
]

const TAB_CONTENT: Record<string, { heading: string; desc: string }> = {
  clients:  { heading: 'Cada cliente, su historial completo.', desc: 'Ficha, objetivos, rutinas pasadas, medidas y pagos. Todo accesible en segundos, sin buscar en WhatsApp.' },
  track:    { heading: 'El progreso que retiene clientes.', desc: 'Gráficas de peso, fuerza y medidas. El cliente lo ve en tiempo real — sin preguntar, sin exportar nada.' },
  payments: { heading: 'Cobras solo. Sin recordar a nadie.', desc: 'Stripe nativo. Pagos recurrentes, facturas automáticas, historial limpio. Tú te centras en entrenar.' },
  comms:    { heading: 'Comunicación directa, fuera de tu móvil.', desc: 'Mensajes con cada cliente centralizados. Profesional desde el primer contacto.' },
}

export function ModuleSelector() {
  const [active, setActive] = useState('clients')
  const visualRef = useRef<HTMLDivElement>(null)
  const descRef   = useRef<HTMLDivElement>(null)

  const switchTab = (id: string) => {
    if (id === active) return

    const fadeOut = (el: HTMLElement | null, cb: () => void) => {
      if (!el) { cb(); return }
      gsap.to(el, { opacity: 0, y: 8, duration: 0.2, ease: 'expo.in', onComplete: cb })
    }

    fadeOut(visualRef.current, () => {
      fadeOut(descRef.current, () => {
        setActive(id)
        gsap.to(visualRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' })
        gsap.to(descRef.current,   { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out', delay: 0.05 })
      })
    })
  }

  const content = TAB_CONTENT[active]

  return (
    <section style={{
      background: 'var(--tb-void)',
      padding: 'clamp(80px, 10vw, 140px) 0',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 clamp(20px, 5vw, 48px)' }}>
        <span style={{
          display: 'block',
          fontFamily: 'monospace',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--tb-brand)',
          marginBottom: '20px',
        }}>
          El sistema
        </span>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'clamp(28px, 4vw, 52px)',
          color: 'var(--tb-text)',
          lineHeight: 1.15,
          margin: '0 0 clamp(40px, 5vw, 64px)',
          letterSpacing: '-0.02em',
        }}>
          Una plataforma completa.{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--tb-muted)' }}>Cero compromiso.</em>
        </h2>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: 'clamp(32px, 4vw, 56px)',
          flexWrap: 'wrap',
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              style={{
                height: '40px',
                padding: '0 20px',
                border: `1px solid ${active === tab.id ? 'var(--tb-brand)' : 'var(--tb-border)'}`,
                borderRadius: '6px',
                background: active === tab.id ? 'rgba(143,212,58,0.08)' : 'transparent',
                color: active === tab.id ? 'var(--tb-brand)' : 'var(--tb-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'border-color 200ms, color 200ms, background 200ms',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '10px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Description crossfade */}
        <div
          ref={descRef}
          style={{
            marginBottom: 'clamp(24px, 3vw, 40px)',
          }}
        >
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(20px, 2.5vw, 32px)',
            color: 'var(--tb-text)',
            margin: '0 0 10px',
            letterSpacing: '-0.01em',
          }}>
            {content.heading}
          </h3>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            color: 'var(--tb-muted)',
            margin: 0,
            lineHeight: 1.7,
            maxWidth: '560px',
          }}>
            {content.desc}
          </p>
        </div>

        {/* Visual with crossfade */}
        <div
          ref={visualRef}
          style={{
            maxWidth: '100%',
            aspectRatio: '16/9',
            background: 'var(--tb-surface-up)',
            borderRadius: '8px',
            border: '1px solid var(--tb-border)',
            boxShadow: 'var(--shadow-brand-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--tb-brand)',
            fontFamily: 'monospace',
            fontSize: 'clamp(18px, 3vw, 28px)',
            fontWeight: 700,
            letterSpacing: '0.12em',
          }}
        >
          {TABS.find(t => t.id === active)?.label?.toUpperCase()}
        </div>
      </div>
    </section>
  )
}
