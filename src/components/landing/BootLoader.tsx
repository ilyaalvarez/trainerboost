'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const BOOT_LINES = [
  'INICIALIZANDO SISTEMA',
  'CARGANDO MÓDULOS',
  'CONECTANDO PLATAFORMA',
]

interface Props { onComplete: () => void }

export function BootLoader({ onComplete }: Props) {
  const rootRef  = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (sessionStorage.getItem('tb-booted')) { onComplete(); return }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem('tb-booted', '1')
          onComplete()
        },
      })

      tl.from('.boot-bar', {
        scaleX: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'expo.out',
        transformOrigin: 'left center',
      })

      .from('.boot-logo', {
        opacity: 0, y: 12,
        duration: 0.5,
        ease: 'expo.out',
      }, '-=0.4')

      .from('.boot-line', {
        opacity: 0, x: -8,
        duration: 0.4,
        stagger: 0.1,
        ease: 'expo.out',
      }, '-=0.3')

      .to(countRef.current, {
        textContent: 100,
        duration: 1.0,
        snap: { textContent: 1 },
        ease: 'power2.inOut',
      }, '<')

      .to({}, { duration: 0.3 })

      .to(rootRef.current, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.8,
        ease: 'expo.inOut',
      })

    }, rootRef)

    return () => ctx.revert()
  }, [onComplete])

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--tb-void)',
        clipPath: 'inset(0 0 0% 0)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '40px',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          className="boot-logo"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(22px, 4vw, 38px)',
            letterSpacing: '0.2em',
            color: 'var(--tb-brand)',
            marginBottom: '8px',
          }}
        >
          TRAINERBOOST
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--tb-muted)',
            letterSpacing: '0.06em',
          }}
        >
          Software para entrenadores personales
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: 'min(320px, 80vw)' }}>
        {BOOT_LINES.map((line) => (
          <div key={line} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              className="boot-line"
              style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                letterSpacing: '0.08em',
                color: 'var(--tb-muted)',
                width: '190px',
                flexShrink: 0,
              }}
            >
              {line}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--tb-border)', overflow: 'hidden' }}>
              <div
                className="boot-bar"
                style={{ height: '100%', background: 'var(--tb-brand)', transformOrigin: 'left' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          fontFamily: 'monospace',
          fontSize: 'clamp(48px, 8vw, 80px)',
          fontWeight: 700,
          color: 'var(--tb-brand)',
          lineHeight: 1,
        }}
      >
        <span ref={countRef}>0</span>
        <span style={{ fontSize: '0.4em', opacity: 0.5, marginLeft: 4 }}>%</span>
      </div>
    </div>
  )
}
