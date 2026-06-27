'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const BOOT_LINES = [
  'CALIBRANDO SISTEMA',
  'SINCRONIZANDO CLIENTES',
  'ACTIVANDO SEGUIMIENTO',
  'PLATAFORMA LISTA',
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

      // Barras de carga — lentas y deliberadas
      tl.from('.boot-bar', {
        scaleX: 0,
        duration: 0.9,
        stagger: 0.2,
        ease: 'expo.out',
        transformOrigin: 'left center',
      })

      // Logo — aparición elegante
      .from('.boot-logo', {
        opacity: 0, y: 16,
        duration: 0.7,
        ease: 'expo.out',
      }, '-=0.5')

      // Subtítulo
      .from('.boot-sub', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.4')

      // Líneas de estado — aparecen con ritmo
      .from('.boot-line', {
        opacity: 0, x: -10,
        duration: 0.55,
        stagger: 0.18,
        ease: 'expo.out',
      }, '-=0.3')

      // Contador 0 → 100 — pausado, se siente real
      .to(countRef.current, {
        textContent: 100,
        duration: 1.8,
        snap: { textContent: 1 },
        ease: 'power1.inOut',
      }, '<')

      // Pausa — el usuario lee "PLATAFORMA LISTA"
      .to({}, { duration: 0.7 })

      // Reveal hacia arriba — cinemático
      .to(rootRef.current, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 1.1,
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
        gap: '44px',
      }}
    >
      {/* Logo + tagline */}
      <div style={{ textAlign: 'center' }}>
        <div
          className="boot-logo"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 'clamp(24px, 4.5vw, 42px)',
            letterSpacing: '0.22em',
            color: 'var(--tb-brand)',
            marginBottom: '10px',
          }}
        >
          TRAINERBOOST
        </div>
        <div
          className="boot-sub"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--tb-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Software para entrenadores personales
        </div>
      </div>

      {/* Líneas de estado */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: 'min(360px, 80vw)' }}>
        {BOOT_LINES.map((line) => (
          <div key={line} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span
              className="boot-line"
              style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                letterSpacing: '0.1em',
                color: 'var(--tb-muted)',
                width: '210px',
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

      {/* Contador */}
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: 'clamp(52px, 9vw, 88px)',
          fontWeight: 700,
          color: 'var(--tb-brand)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        <span ref={countRef}>0</span>
        <span style={{ fontSize: '0.38em', opacity: 0.45, marginLeft: 4 }}>%</span>
      </div>
    </div>
  )
}
