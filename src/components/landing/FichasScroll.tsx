'use client'
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { ClientCard } from './ClientCard'
import { CLIENTS } from './clientData'

const INIT_SCALE   = [1.0, 0.93, 0.86, 0.79]
const INIT_Y       = [0, 20, 40, 60]
const INIT_OPACITY = [1.0, 0.68, 0.40, 0.20]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function FichasScroll() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const bgRef      = useRef<HTMLDivElement>(null)
  const stackRef   = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const stack   = stackRef.current
    if (!section || !stack) return

    // Mobile: sin animacion
    if (window.innerWidth < 768) return

    const ctx = gsap.context(() => {
      const cardWraps = Array.from(stack.querySelectorAll<HTMLElement>('.fichas-stack-card-wrap'))
      const dots      = Array.from(section.querySelectorAll<HTMLElement>('.fichas-dot'))
      const N = CLIENTS.length  // 4

      // Set initial stack state
      cardWraps.forEach((wrap, i) => {
        gsap.set(wrap, {
          scale:   INIT_SCALE[i],
          y:       INIT_Y[i],
          opacity: INIT_OPACITY[i],
          zIndex:  N - i,
        })
      })

      // Set first dot as active
      if (dots[0]) gsap.set(dots[0], { width: 20, background: '#8FD43A' })

      ScrollTrigger.create({
        trigger: section,
        pin: true,
        scrub: 1.4,
        start: 'top top',
        end: '+=250%',
        onUpdate(self) {
          const progress = self.progress
          const segmentSize = 1 / (N - 1)  // 0.333...
          const rawIdx      = progress / segmentSize
          const activeIdx   = Math.min(Math.floor(rawIdx), N - 2)
          const segProgress = Math.min(rawIdx - activeIdx, 1)

          cardWraps.forEach((wrap, i) => {
            if (i < activeIdx) {
              gsap.set(wrap, { scale: 0.72, y: -80, opacity: 0, zIndex: 0 })
            } else if (i === activeIdx) {
              gsap.set(wrap, {
                scale:   lerp(1.0, 0.72, segProgress),
                y:       lerp(0, -80, segProgress),
                opacity: lerp(1.0, 0, segProgress),
                zIndex:  N - i,
              })
            } else {
              const relPos     = i - activeIdx      // 1, 2, 3...
              const prevRelPos = relPos - 1          // 0, 1, 2...
              gsap.set(wrap, {
                scale:   lerp(INIT_SCALE[relPos] ?? 0.79,   INIT_SCALE[prevRelPos] ?? 1.0,   segProgress),
                y:       lerp(INIT_Y[relPos] ?? 60,         INIT_Y[prevRelPos] ?? 0,         segProgress),
                opacity: lerp(INIT_OPACITY[relPos] ?? 0.12, INIT_OPACITY[prevRelPos] ?? 1.0, segProgress),
                zIndex:  N - i,
              })
            }
          })

          // Actualizar fondo
          const bgIdx = Math.min(Math.round(progress * (N - 1)), N - 1)
          if (bgRef.current) {
            bgRef.current.style.background = CLIENTS[bgIdx].bg
          }

          // Actualizar dots
          dots.forEach((dot, i) => {
            const isActive = i === Math.min(activeIdx, N - 1)
            gsap.set(dot, {
              width:      isActive ? 20 : 6,
              background: isActive ? '#8FD43A' : 'rgba(255,255,255,0.2)',
            })
          })
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef} className="fichas-stack-section">
      <div ref={bgRef} className="fichas-stack-bg" />
      <span className="fichas-stack-label" aria-hidden="true">Sus clientes</span>

      <div className="fichas-stack-stage">
        <div className="fichas-side-panel fichas-side-panel--left">
          <p className="fichas-panel-label">Gestión de clientes</p>
          <h3 className="fichas-panel-title">Al siguiente<br />nivel</h3>
          <p className="fichas-panel-desc">
            Cada cliente tiene su propia ficha con historial, progreso y objetivos.
            Siempre actualizado.
          </p>
        </div>

        <div ref={stackRef} className="fichas-stack-inner">
          {CLIENTS.map((client) => (
            <div key={client.variant} className="fichas-stack-card-wrap">
              <ClientCard client={client} animateMode="none" />
            </div>
          ))}
        </div>

        <div className="fichas-side-panel fichas-side-panel--right">
          <ul className="fichas-panel-features">
            <li>Historial de sesiones</li>
            <li>Progreso visual en tiempo real</li>
            <li>Objetivos personalizados</li>
            <li>Desde cualquier dispositivo</li>
          </ul>
        </div>
      </div>

      <div className="fichas-stack-dots" aria-hidden="true">
        {CLIENTS.map((_, i) => (
          <div key={i} className="fichas-dot" data-dot={i} />
        ))}
      </div>
    </div>
  )
}
