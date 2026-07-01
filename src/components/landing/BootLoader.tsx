'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import type { Locale } from '@/messages/types'

const BOOT_LINES: Record<Locale, string[]> = {
  es: ['CALIBRANDO SISTEMA', 'SINCRONIZANDO CLIENTES', 'ACTIVANDO SEGUIMIENTO', 'PLATAFORMA LISTA'],
  en: ['CALIBRATING SYSTEM', 'SYNCING CLIENTS', 'ACTIVATING TRACKING', 'PLATFORM READY'],
}
const BOOT_SUB: Record<Locale, string> = {
  es: 'Software para entrenadores personales',
  en: 'Software for personal trainers',
}

interface Props { onComplete: () => void; locale?: Locale }

export function BootLoader({ onComplete, locale = 'es' }: Props) {
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

      // Barras + logo + sub — rápido y limpio
      tl.from('.boot-bar', {
        scaleX: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'expo.out',
        transformOrigin: 'left center',
      })
      .from('.boot-logo', {
        opacity: 0, y: 10,
        duration: 0.3,
        ease: 'expo.out',
      }, '-=0.2')
      .from('.boot-sub', {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.out',
      }, '-=0.15')

      // Líneas de estado
      .from('.boot-line', {
        opacity: 0, x: -8,
        duration: 0.3,
        stagger: 0.09,
        ease: 'expo.out',
      }, '-=0.1')

      // Contador 0 → 100
      .to(countRef.current, {
        textContent: 100,
        duration: 0.8,
        snap: { textContent: 1 },
        ease: 'power1.inOut',
      }, '<')

      // Pausa mínima
      .to({}, { duration: 0.12 })

      // Exit cinemático hacia arriba
      .to(rootRef.current, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.52,
        ease: 'expo.inOut',
      })

    }, rootRef)

    return () => ctx.revert()
  }, [onComplete])

  const lines = BOOT_LINES[locale]
  const sub   = BOOT_SUB[locale]

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
          {sub}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: 'min(360px, 80vw)' }}>
        {lines.map((line) => (
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
