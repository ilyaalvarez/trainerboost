'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import type { ClientData } from './clientData'

interface Props {
  client: ClientData
  animateMode?: 'scroll' | 'immediate' | 'none'
  className?: string
  style?: React.CSSProperties
}

const ACCENT: Record<1 | 2 | 3 | 4, string> = {
  1: '#63B3ED',
  2: '#F6AD55',
  3: '#8FD43A',
  4: '#8FD43A',
}

// CSS var(--card-accent) value — variant 4 uses a gradient
const ACCENT_BAND: Record<1 | 2 | 3 | 4, string> = {
  1: '#63B3ED',
  2: '#F6AD55',
  3: '#8FD43A',
  4: 'linear-gradient(90deg, #8FD43A, #B5E860)',
}

const SHADOW: Record<1 | 2 | 3 | 4, string> = {
  1: '0 0 30px rgba(99,179,237,0.10), 0 8px 32px rgba(0,0,0,0.5)',
  2: '0 0 30px rgba(246,173,85,0.10), 0 8px 32px rgba(0,0,0,0.5)',
  3: '0 0 40px rgba(143,212,58,0.15), 0 8px 32px rgba(0,0,0,0.5)',
  4: '0 0 60px rgba(143,212,58,0.25), 0 8px 40px rgba(0,0,0,0.6)',
}

const BORDER: Record<1 | 2 | 3 | 4, string> = {
  1: '1px solid rgba(255,255,255,0.07)',
  2: '1px solid rgba(255,255,255,0.07)',
  3: '1px solid rgba(255,255,255,0.07)',
  4: '1px solid rgba(143,212,58,0.3)',
}

const PROGRESS_GRADIENT: Record<1 | 2 | 3 | 4, string> = {
  1: 'linear-gradient(90deg, #63B3ED, #90CDF4)',
  2: 'linear-gradient(90deg, #F6AD55, #FBD38D)',
  3: 'linear-gradient(90deg, #8FD43A, #B5E860)',
  4: 'linear-gradient(90deg, #8FD43A, #B5E860)',
}

// rgba helpers — avoids hex-to-rgba conversion at runtime
const accentAlpha = (v: 1 | 2 | 3 | 4, a: number): string => {
  const bases: Record<1 | 2 | 3 | 4, string> = {
    1: `rgba(99,179,237,${a})`,
    2: `rgba(246,173,85,${a})`,
    3: `rgba(143,212,58,${a})`,
    4: `rgba(143,212,58,${a})`,
  }
  return bases[v]
}

export function ClientCard({ client, animateMode = 'scroll', className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const v = client.variant
  const accent = ACCENT[v]

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
      className={`client-card-v2${className ? ` ${className}` : ''}`}
      style={
        {
          '--card-accent': ACCENT_BAND[v],
          width: '380px',
          height: '520px',
          background: 'rgba(15,15,18,0.95)',
          border: BORDER[v],
          borderRadius: 'var(--r-card)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          boxShadow: SHADOW[v],
          ...style,
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <div style={{ padding: '28px 28px 20px' }}>
        {/* Row 1: badge + semana */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '9px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: accent,
              background: accentAlpha(v, 0.15),
              border: `1px solid ${accentAlpha(v, 0.4)}`,
              borderRadius: 'var(--r-pill)',
              padding: '3px 10px',
            }}
          >
            {client.badge}
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '9px',
              color: 'var(--tb-muted)',
              letterSpacing: '0.06em',
            }}
          >
            SEM. {client.weeks}
          </span>
        </div>

        {/* Row 2: avatar + name / city / goal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
          {/* Avatar */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${accentAlpha(v, 0.3)}, ${accentAlpha(v, 0.08)})`,
              border: `2px solid ${accentAlpha(v, 0.5)}`,
              boxShadow: `0 0 16px ${accentAlpha(v, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '20px',
              color: accent,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          {/* Name / city / goal */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--tb-text)',
                lineHeight: 1.2,
              }}
            >
              {client.name}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--tb-muted)',
                marginTop: '2px',
              }}
            >
              {client.city}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontStyle: 'italic',
                color: 'var(--tb-faint)',
                marginTop: '6px',
              }}
            >
              Objetivo: {client.goal}
            </div>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div style={{ height: '1px', background: 'var(--tb-border)', opacity: 0.4, margin: '0 28px' }} />

      {/* Progress section */}
      <div style={{ padding: '20px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '9px',
              color: 'var(--tb-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            PROGRESO
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              fontWeight: 700,
              color: accent,
            }}
          >
            {client.progress}%
          </span>
        </div>
        <div
          style={{
            marginTop: '10px',
            height: '8px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 'var(--r-pill)',
            overflow: 'hidden',
          }}
        >
          <div
            className="progress-fill"
            style={{
              width: `${client.progress}%`,
              height: '100%',
              background: PROGRESS_GRADIENT[v],
              borderRadius: 'var(--r-pill)',
              boxShadow: `0 0 8px ${accentAlpha(v, 0.6)}`,
            }}
          />
        </div>
      </div>

      {/* Separator */}
      <div style={{ height: '1px', background: 'var(--tb-border)', opacity: 0.4, margin: '0 28px' }} />

      {/* Metrics section */}
      <div
        style={{
          padding: '16px 28px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
        }}
      >
        {/* Peso */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: accent, marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2v9M4 8l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            className="metric-val"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '18px',
              color: accent,
              lineHeight: 1,
            }}
          >
            {client.metrics.weight}
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '8px',
              color: 'var(--tb-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginTop: '4px',
            }}
          >
            Peso
          </div>
        </div>

        {/* Fuerza */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: accent, marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M9 2L5 9h4l-2 5 6-7H9l1-5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            className="metric-val"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '18px',
              color: accent,
              lineHeight: 1,
            }}
          >
            {client.metrics.strength}
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '8px',
              color: 'var(--tb-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginTop: '4px',
            }}
          >
            Fuerza
          </div>
        </div>

        {/* Tiempo */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: accent, marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 5.5V8l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div
            className="metric-val"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '18px',
              color: accent,
              lineHeight: 1,
            }}
          >
            {client.weeks} sem
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '8px',
              color: 'var(--tb-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginTop: '4px',
            }}
          >
            Tiempo
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 28px 24px', marginTop: 'auto' }}>
        <div style={{ height: '1px', background: 'var(--tb-border)', opacity: 0.4, marginBottom: '16px' }} />
        {v === 4 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8l4 4 6-7"
                stroke="#8FD43A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                color: '#8FD43A',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              OBJETIVO ALCANZADO
            </span>
          </div>
        ) : (
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '9px',
              color: 'var(--tb-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {client.metrics.label}
          </span>
        )}
      </div>
    </div>
  )
}
