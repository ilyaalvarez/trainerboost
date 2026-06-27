'use client'
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { ClientCard } from './ClientCard'
import { CLIENTS } from './clientData'

export function FichasScroll() {
  const wrapRef  = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const bgRef    = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (window.innerWidth < 768) return

    const ctx = gsap.context(() => {
      const getX = () =>
        -(trackRef.current!.scrollWidth - window.innerWidth + 160)

      ScrollTrigger.create({
        trigger: wrapRef.current,
        pin: true,
        scrub: 1.5,
        start: 'top top',
        end: () => `+=${Math.abs(getX())}`,
        onUpdate(self) {
          gsap.set(trackRef.current, { x: getX() * self.progress })

          const cards = trackRef.current!.querySelectorAll<HTMLElement>('.client-card')
          const center = window.innerWidth / 2
          cards.forEach((card) => {
            const rect = card.getBoundingClientRect()
            const cardCenter = rect.left + rect.width / 2
            const dist = Math.abs(cardCenter - center)
            const scale = Math.max(0.88, 1 - (dist / window.innerWidth) * 0.3)
            const opacity = Math.max(0.45, 1 - (dist / window.innerWidth) * 0.8)
            gsap.to(card, { scale, opacity, duration: 0.3, ease: 'power2.out' })
          })

          const idx = Math.min(
            Math.round(self.progress * (CLIENTS.length - 1)),
            CLIENTS.length - 1
          )
          if (bgRef.current) {
            bgRef.current.style.background = CLIENTS[idx].bg
          }
        },
      })
    }, wrapRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={wrapRef} className="fichas-wrap">
      {/* Fondo dinámico crossfade */}
      <div
        ref={bgRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          transition: 'background 0.6s cubic-bezier(0.16,1,0.3,1)',
          background: CLIENTS[0].bg,
        }}
      />

      <span className="fichas-label" aria-hidden="true">Tus clientes</span>

      <div ref={trackRef} className="fichas-track">
        {CLIENTS.map((client) => (
          <ClientCard key={client.variant} client={client} animateMode="scroll" />
        ))}
      </div>
    </div>
  )
}
