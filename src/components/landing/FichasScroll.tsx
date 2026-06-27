'use client'
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { ClientCard } from './ClientCard'
import { CLIENTS } from './clientData'

const INIT_SCALE   = [1.0, 0.93, 0.86, 0.79]
const INIT_Y       = [0, 20, 40, 60]
const INIT_OPACITY = [1.0, 1.0, 0.95, 0.88]

const PANEL_DATA = [
  {
    label: 'Clientes nuevos',
    title: 'El primer\nmes importa',
    desc: 'Ningún cliente nuevo se siente solo. TrainerBoost los guía desde el día uno.',
    features: [
      'Ficha de bienvenida digital',
      'Plan inicial personalizado',
      'Recordatorios automáticos',
      'Check-in semanal',
    ],
  },
  {
    label: 'En progreso',
    title: 'Mantén\nel ritmo',
    desc: '22 sesiones sin perder el hilo. Así se fideliza a un cliente.',
    features: [
      'Historial completo de sesiones',
      'Ajuste de objetivos en vivo',
      'Comparativa de progreso',
      'Mensajes de motivación',
    ],
  },
  {
    label: 'Clientes premium',
    title: 'Más exigentes,\nmás rentables',
    desc: 'Pagan puntual y exigen calidad. TrainerBoost te da las herramientas.',
    features: [
      'Planificación de ciclos',
      'Análisis avanzado de métricas',
      'Cobros automatizados',
      'Informes mensuales',
    ],
  },
  {
    label: 'Casos de éxito',
    title: 'Tu mejor\npublicidad',
    desc: '92 sesiones. Se convierte en la embajadora de tu negocio.',
    features: [
      'Resultados documentados',
      'Perfil público compartible',
      'Programa de referidos',
      'Métricas de impacto',
    ],
  },
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function FichasScroll() {
  const sectionRef     = useRef<HTMLDivElement>(null)
  const bgRef          = useRef<HTMLDivElement>(null)
  const stackRef       = useRef<HTMLDivElement>(null)
  const leftPanelRef   = useRef<HTMLDivElement>(null)
  const rightPanelRef  = useRef<HTMLDivElement>(null)
  const activePanelIdx = useRef(0)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const stack   = stackRef.current
    if (!section || !stack) return

    if (window.innerWidth < 768) return

    const ctx = gsap.context(() => {
      const cardWraps = Array.from(stack.querySelectorAll<HTMLElement>('.fichas-stack-card-wrap'))
      const dots      = Array.from(section.querySelectorAll<HTMLElement>('.fichas-dot'))
      const N = CLIENTS.length

      cardWraps.forEach((wrap, i) => {
        gsap.set(wrap, {
          scale:   INIT_SCALE[i],
          y:       INIT_Y[i],
          opacity: INIT_OPACITY[i],
          zIndex:  N - i,
        })
      })

      if (dots[0]) gsap.set(dots[0], { width: 20, background: '#8FD43A' })

      ScrollTrigger.create({
        trigger: section,
        pin: true,
        scrub: 2,
        start: 'top top',
        end: '+=300%',
        onUpdate(self) {
          const progress = self.progress
          const segmentSize = 1 / (N - 1)
          const rawIdx      = progress / segmentSize
          const activeIdx   = Math.min(Math.floor(rawIdx), N - 2)
          const rawSeg      = Math.min(rawIdx - activeIdx, 1)
          // Cada carta se queda visible el 45% de su segmento antes de salir
          const DWELL       = 0.28
          const segProgress = rawSeg < DWELL ? 0 : (rawSeg - DWELL) / (1 - DWELL)

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
              const relPos     = i - activeIdx
              const prevRelPos = relPos - 1
              gsap.set(wrap, {
                scale:   lerp(INIT_SCALE[relPos] ?? 0.79,   INIT_SCALE[prevRelPos] ?? 1.0,   segProgress),
                y:       lerp(INIT_Y[relPos] ?? 60,         INIT_Y[prevRelPos] ?? 0,         segProgress),
                opacity: lerp(INIT_OPACITY[relPos] ?? 0.12, INIT_OPACITY[prevRelPos] ?? 1.0, segProgress),
                zIndex:  N - i,
              })
            }
          })

          const bgIdx = Math.min(Math.round(progress * (N - 1)), N - 1)

          if (bgRef.current) {
            bgRef.current.style.background = CLIENTS[bgIdx].bg
          }

          // Swap panel content when active card changes
          if (bgIdx !== activePanelIdx.current) {
            activePanelIdx.current = bgIdx
            leftPanelRef.current?.querySelectorAll<HTMLElement>('.fichas-panel-state').forEach((el, i) => {
              el.classList.toggle('is-active', i === bgIdx)
            })
            rightPanelRef.current?.querySelectorAll<HTMLElement>('.fichas-panel-state').forEach((el, i) => {
              el.classList.toggle('is-active', i === bgIdx)
            })
          }

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
        <div className="fichas-side-panel fichas-side-panel--left" ref={leftPanelRef}>
          {PANEL_DATA.map((panel, i) => (
            <div key={i} className={`fichas-panel-state${i === 0 ? ' is-active' : ''}`}>
              <p className="fichas-panel-label">{panel.label}</p>
              <h3 className="fichas-panel-title">
                {panel.title.split('\n').map((line, j, arr) => (
                  <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                ))}
              </h3>
              <p className="fichas-panel-desc">{panel.desc}</p>
            </div>
          ))}
        </div>

        <div ref={stackRef} className="fichas-stack-inner">
          {CLIENTS.map((client) => (
            <div key={client.variant} className="fichas-stack-card-wrap">
              <ClientCard client={client} animateMode="none" />
            </div>
          ))}
        </div>

        <div className="fichas-side-panel fichas-side-panel--right" ref={rightPanelRef}>
          {PANEL_DATA.map((panel, i) => (
            <div key={i} className={`fichas-panel-state${i === 0 ? ' is-active' : ''}`}>
              <ul className="fichas-panel-features">
                {panel.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
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
