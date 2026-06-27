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

const ACCENT_ALPHA = (v: 1 | 2 | 3 | 4, a: number) => {
  const base: Record<1 | 2 | 3 | 4, string> = {
    1: `rgba(99,179,237,${a})`,
    2: `rgba(246,173,85,${a})`,
    3: `rgba(143,212,58,${a})`,
    4: `rgba(143,212,58,${a})`,
  }
  return base[v]
}

const PROGRESS_GRAD: Record<1 | 2 | 3 | 4, string> = {
  1: 'linear-gradient(90deg,#63B3ED,#90CDF4)',
  2: 'linear-gradient(90deg,#F6AD55,#FBD38D)',
  3: 'linear-gradient(90deg,#8FD43A,#B5E860)',
  4: 'linear-gradient(90deg,#8FD43A,#B5E860)',
}

const SHADOW: Record<1 | 2 | 3 | 4, string> = {
  1: '0 0 32px rgba(99,179,237,0.10),0 8px 32px rgba(0,0,0,0.55)',
  2: '0 0 32px rgba(246,173,85,0.10),0 8px 32px rgba(0,0,0,0.55)',
  3: '0 0 40px rgba(143,212,58,0.14),0 8px 32px rgba(0,0,0,0.55)',
  4: '0 0 56px rgba(143,212,58,0.22),0 8px 40px rgba(0,0,0,0.65)',
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('')
}

export function ClientCard({ client, animateMode = 'scroll', className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const v   = client.variant
  const acc = ACCENT[v]

  useEffect(() => {
    if (animateMode === 'none') return
    const ctx = gsap.context(() => {
      const trigger =
        animateMode === 'scroll'
          ? { scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true } }
          : {}
      gsap.from('.cc-bar-fill', {
        scaleX: 0, transformOrigin: 'left center',
        duration: 1.1, ease: 'expo.out',
        delay: animateMode === 'immediate' ? 0.1 : 0, ...trigger,
      })
      gsap.from('.cc-adh-fill', {
        scaleX: 0, transformOrigin: 'left center',
        duration: 0.9, ease: 'expo.out',
        delay: animateMode === 'immediate' ? 0.2 : 0, ...trigger,
      })
      gsap.from('.cc-mval', {
        opacity: 0, y: 6, duration: 0.5, stagger: 0.08, ease: 'expo.out',
        delay: animateMode === 'immediate' ? 0.15 : 0, ...trigger,
      })
    }, ref)
    return () => ctx.revert()
  }, [v, animateMode])

  return (
    <div
      ref={ref}
      className={`cc-v3${className ? ` ${className}` : ''}`}
      style={{
        '--cc-acc': acc,
        '--cc-glow': ACCENT_ALPHA(v, 0.18),
        boxShadow: SHADOW[v],
        ...style,
      } as React.CSSProperties}
    >
      {/* Accent bar top */}
      <div className="cc-accent-bar" style={{ background: acc }} />

      {/* ── Row 1: Badge + semanas ─────────────────────── */}
      <div className="cc-row-header">
        <span
          className="cc-badge"
          style={{
            color: acc,
            background: ACCENT_ALPHA(v, 0.12),
            border: `1px solid ${ACCENT_ALPHA(v, 0.35)}`,
          }}
        >
          {client.badge}
        </span>
        <span className="cc-week">SEM. {client.weeks}</span>
      </div>

      {/* ── Row 2: Avatar + identidad + % grande ────────── */}
      <div className="cc-row-identity">
        <div
          className="cc-avatar"
          style={{
            background: ACCENT_ALPHA(v, 0.14),
            border: `1.5px solid ${ACCENT_ALPHA(v, 0.4)}`,
            boxShadow: `0 0 18px ${ACCENT_ALPHA(v, 0.18)}`,
          }}
        >
          <span className="cc-initials" style={{ color: acc }}>
            {initials(client.name)}
          </span>
        </div>

        <div className="cc-identity">
          <p className="cc-name">{client.name}</p>
          <p className="cc-city">{client.city}</p>
          <p className="cc-goal">{client.goal}</p>
        </div>

        <div className="cc-pct-block">
          <span className="cc-pct" style={{ color: acc, textShadow: `0 0 20px ${ACCENT_ALPHA(v, 0.35)}` }}>
            {client.progress}<span className="cc-pct-sym">%</span>
          </span>
          <span className="cc-pct-lbl">completado</span>
        </div>
      </div>

      {/* ── Progress bar ────────────────────────────────── */}
      <div className="cc-bar-wrap">
        <div
          className="cc-bar-fill"
          style={{
            width: `${client.progress}%`,
            background: PROGRESS_GRAD[v],
            boxShadow: `0 0 10px ${ACCENT_ALPHA(v, 0.55)}`,
          }}
        />
      </div>

      {/* ── Row 3: Métricas primarias ────────────────────── */}
      <div className="cc-metrics">
        {/* Peso */}
        <div className="cc-metric">
          <svg className="cc-mic" style={{ color: acc }} viewBox="0 0 16 16" fill="none">
            <path d="M8 2v9M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="cc-mval">{client.metrics.weight}</span>
          <span className="cc-mlbl">Peso</span>
        </div>
        <div className="cc-metric-sep" />
        {/* Fuerza */}
        <div className="cc-metric">
          <svg className="cc-mic" style={{ color: acc }} viewBox="0 0 16 16" fill="currentColor">
            <polygon points="9,1 4,9 8,9 7,15 13,7 9,7"/>
          </svg>
          <span className="cc-mval">{client.metrics.strength}</span>
          <span className="cc-mlbl">Fuerza</span>
        </div>
        <div className="cc-metric-sep" />
        {/* Sesiones */}
        <div className="cc-metric">
          <svg className="cc-mic" style={{ color: acc }} viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="8" y1="2" x2="8" y2="4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8" y1="11.5" x2="8" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="cc-mval">{client.totalSessions}</span>
          <span className="cc-mlbl">Sesiones</span>
        </div>
      </div>

      {/* ── Row 4: Métricas secundarias ──────────────────── */}
      <div className="cc-secondary">
        <div className="cc-secondary-item">
          <span className="cc-slbl">Próxima sesión</span>
          <span className="cc-sval">{client.nextSession}</span>
        </div>
        <div className="cc-secondary-item cc-secondary-item--right">
          <span className="cc-slbl">Adherencia</span>
          <div className="cc-adh-row">
            <div className="cc-adh-track">
              <div
                className="cc-adh-fill"
                style={{
                  width: `${client.adherence}%`,
                  background: acc,
                  boxShadow: `0 0 6px ${ACCENT_ALPHA(v, 0.5)}`,
                }}
              />
            </div>
            <span className="cc-sval">{client.adherence}%</span>
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <div className="cc-footer">
        {v === 4 ? (
          <>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l4 4 6-7" stroke={acc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ color: acc }}>OBJETIVO ALCANZADO</span>
          </>
        ) : (
          <span>{client.metrics.label.toUpperCase()}</span>
        )}
      </div>
    </div>
  )
}
