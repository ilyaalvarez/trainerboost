'use client'
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PAINS = [
  {
    bad:  'Planes en PDF por WhatsApp',
    good: 'Planes digitales que el cliente ve en su app',
  },
  {
    bad:  'Cobros a mano y facturas en Excel',
    good: 'Stripe integrado — cobras solo, sin recordatorios',
  },
  {
    bad:  'Clientes que no renuevan porque no ven su progreso',
    good: 'Gráficas en tiempo real que los mantienen enganchados',
  },
]

export function PainPoints() {
  const sectionRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.pain-row').forEach((row, i) => {
        gsap.fromTo(row,
          { opacity: 0, y: -10 },
          {
            opacity: 1, y: 0,
            scrollTrigger: {
              trigger: row,
              start: 'top 88%',
              end: 'top 60%',
              scrub: 0.9,
            },
          }
        )

        const goodEl = row.querySelector<HTMLElement>('.pain-good')
        if (goodEl) {
          gsap.from(goodEl, {
            opacity: 0, x: -16,
            duration: 0.5,
            ease: 'expo.out',
            delay: i * 0.08,
            scrollTrigger: {
              trigger: row,
              start: 'top 82%',
              once: true,
            },
          })
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        background: 'var(--tb-surface)',
        padding: 'clamp(80px, 10vw, 140px) 0',
      }}
    >
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 clamp(20px, 5vw, 48px)' }}>
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
          El problema
        </span>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'clamp(28px, 4vw, 52px)',
          color: 'var(--tb-text)',
          lineHeight: 1.15,
          margin: '0 0 clamp(48px, 6vw, 72px)',
          letterSpacing: '-0.02em',
        }}>
          El caos que nadie{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--tb-muted)' }}>cuenta en Instagram.</em>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {PAINS.map(({ bad, good }, i) => (
            <div
              key={i}
              className="pain-row"
              style={{
                padding: 'clamp(24px, 3vw, 36px) 0',
                borderBottom: '1px solid var(--tb-border)',
                borderTop: i === 0 ? '1px solid var(--tb-border)' : undefined,
              }}
            >
              <span
                className="pain-bad"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'clamp(18px, 2.5vw, 28px)',
                  fontWeight: 500,
                  color: 'var(--tb-faint)',
                  textDecoration: 'line-through',
                  textDecorationColor: 'rgba(143,212,58,0.25)',
                  marginBottom: '10px',
                  letterSpacing: '-0.01em',
                }}
              >
                {bad}
              </span>
              <span
                className="pain-good"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'clamp(18px, 2.5vw, 28px)',
                  fontWeight: 600,
                  color: 'var(--tb-text)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.3,
                }}
              >
                <span style={{ color: 'var(--tb-brand)', marginRight: '10px' }}>→</span>
                {good}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
