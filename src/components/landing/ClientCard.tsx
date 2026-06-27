'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import type { ClientData } from './clientData'

interface Props {
  client: ClientData
  animateMode?: 'scroll' | 'immediate' | 'none'
  className?: string
  style?: React.CSSProperties
}

export function ClientCard({ client, animateMode = 'scroll', className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isComplete = client.progress === 100

  useEffect(() => {
    if (animateMode === 'none') return
    const ctx = gsap.context(() => {
      const trigger =
        animateMode === 'scroll'
          ? { scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true } }
          : {}

      gsap.from('.progress-fill', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.2,
        ease: 'expo.out',
        delay: animateMode === 'immediate' ? 0.15 : 0,
        ...trigger,
      })
      gsap.from('.metric-val', {
        opacity: 0,
        y: 8,
        duration: 0.6,
        stagger: 0.1,
        ease: 'expo.out',
        delay: animateMode === 'immediate' ? 0.25 : 0,
        ...trigger,
      })
    }, ref)
    return () => ctx.revert()
  }, [client.variant, animateMode])

  const initials = client.name
    .split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <div
      ref={ref}
      className={`client-card${className ? ` ${className}` : ''}`}
      style={{
        width: '360px',
        height: '500px',
        background: 'var(--tb-surface-up)',
        border: `1px solid ${isComplete ? 'var(--tb-brand)' : 'var(--tb-border)'}`,
        borderRadius: 'var(--r-card)',
        padding: 'var(--s8)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s5)',
        flexShrink: 0,
        boxShadow: isComplete ? 'var(--shadow-lg)' : 'var(--shadow-md)',
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {/* Badge + semana */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.1em',
          color: 'var(--tb-brand)',
          border: '1px solid rgba(143,212,58,0.3)',
          borderRadius: 'var(--r-pill)',
          padding: '3px 10px',
        }}>{client.badge}</span>
        <span style={{
          fontFamily: 'monospace', fontSize: '9px',
          color: 'var(--tb-muted)', letterSpacing: '0.06em',
        }}>SEM. {client.weeks}</span>
      </div>

      {/* Avatar + nombre */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: isComplete
            ? 'linear-gradient(135deg, rgba(143,212,58,0.3), rgba(143,212,58,0.1))'
            : 'var(--tb-surface)',
          border: `1.5px solid ${isComplete ? 'var(--tb-brand)' : 'var(--tb-border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '18px', color: 'var(--tb-brand)', flexShrink: 0,
        }}>{initials}</div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'var(--text-md)', color: 'var(--tb-text)', lineHeight: 1.2,
          }}>{client.name}</div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
            color: 'var(--tb-muted)', marginTop: '2px',
          }}>{client.city}</div>
        </div>
      </div>

      {/* Objetivo */}
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
        color: 'var(--tb-muted)', fontStyle: 'italic',
      }}>Objetivo: {client.goal}</div>

      {/* Barra de progreso */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--tb-muted)', letterSpacing: '0.06em' }}>PROGRESO</span>
          <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--tb-brand)', fontWeight: 700 }}>{client.progress}%</span>
        </div>
        <div style={{ height: '3px', background: 'var(--tb-border)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
          <div
            className="progress-fill"
            style={{
              height: '100%',
              width: `${client.progress}%`,
              background: isComplete ? 'linear-gradient(90deg, #8FD43A, #B5E860)' : 'var(--tb-brand)',
              borderRadius: 'var(--r-pill)',
              boxShadow: '0 0 6px rgba(143,212,58,0.5)',
            }}
          />
        </div>
      </div>

      {/* Divisor */}
      <div style={{ height: '1px', background: 'var(--tb-border)' }} />

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--s3)' }}>
        {([
          { label: 'Peso',   value: client.metrics.weight },
          { label: 'Fuerza', value: client.metrics.strength },
          { label: 'Tiempo', value: `${client.weeks} sem` },
        ] as const).map((m) => (
          <div key={m.label} style={{ textAlign: 'center' }}>
            <div className="metric-val" style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'var(--text-md)', color: 'var(--tb-brand)', lineHeight: 1,
            }}>{m.value}</div>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: '9px',
              color: 'var(--tb-muted)', marginTop: '4px',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{
          fontFamily: 'monospace', fontSize: '9px',
          color: isComplete ? 'var(--tb-brand)' : 'var(--tb-faint)',
          letterSpacing: '0.06em',
          borderTop: '1px solid var(--tb-border)',
          paddingTop: 'var(--s3)',
        }}>
          {isComplete ? '✓ OBJETIVO ALCANZADO' : client.metrics.label}
        </div>
      </div>
    </div>
  )
}
