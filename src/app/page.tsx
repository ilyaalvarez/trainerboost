'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import LogoFull from '@/components/logo/LogoFull'
import './styles/landing.css'

const WaitlistForm = dynamic(() => import('@/components/landing/WaitlistForm'), { ssr: false })
const RGPDConsent  = dynamic(() => import('@/components/landing/RGPDConsent'),  { ssr: false })

// ─── Crosshair cursor (mirilla) ───────────────────────────────────────────────
function CrosshairCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    let cleanup: (() => void) | null = null

    import('@/lib/gsap/config').then(({ getGSAP }) =>
      getGSAP().then(({ gsap }) => {
        const el = cursorRef.current
        if (!el) return

        const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' })
        const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' })

        const onMove = (e: MouseEvent) => { xTo(e.clientX); yTo(e.clientY) }
        const onOver = (e: MouseEvent) => {
          if ((e.target as HTMLElement).closest('a, button, input'))
            el.classList.add('crosshair-cursor--hover')
        }
        const onOut = () => el.classList.remove('crosshair-cursor--hover')
        const onLeave = () => gsap.to(el, { opacity: 0, duration: 0.2 })
        const onEnter = () => gsap.to(el, { opacity: 1, duration: 0.2 })

        window.addEventListener('mousemove', onMove)
        document.addEventListener('mouseover', onOver)
        document.addEventListener('mouseout',  onOut)
        document.addEventListener('mouseleave', onLeave)
        document.addEventListener('mouseenter', onEnter)

        cleanup = () => {
          window.removeEventListener('mousemove', onMove)
          document.removeEventListener('mouseover', onOver)
          document.removeEventListener('mouseout',  onOut)
          document.removeEventListener('mouseleave', onLeave)
          document.removeEventListener('mouseenter', onEnter)
        }
      })
    )

    return () => cleanup?.()
  }, [])

  return (
    <div ref={cursorRef} className="crosshair-cursor" aria-hidden="true">
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer ring */}
        <circle className="crosshair-ring" cx="26" cy="26" r="22" />
        {/* Top arm */}
        <line className="crosshair-arm" x1="26" y1="3" x2="26" y2="19" />
        {/* Bottom arm */}
        <line className="crosshair-arm" x1="26" y1="33" x2="26" y2="49" />
        {/* Left arm */}
        <line className="crosshair-arm" x1="3" y1="26" x2="19" y2="26" />
        {/* Right arm */}
        <line className="crosshair-arm" x1="33" y1="26" x2="49" y2="26" />
        {/* Center dot */}
        <circle className="crosshair-dot" cx="26" cy="26" r="2" />
      </svg>
    </div>
  )
}

// ─── Scroll progress bar ──────────────────────────────────────────────────────
function ScrollProgress() {
  return (
    <div className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress-fill" />
    </div>
  )
}

// ─── DrawSVG separator ────────────────────────────────────────────────────────
function DrawSep() {
  return (
    <svg className="draw-separator" height="1" aria-hidden="true">
      <line className="draw-sep-line" x1="0" y1="0.5" x2="100%" y2="0.5"
        stroke="rgba(212,137,42,0.18)" strokeWidth="1" />
    </svg>
  )
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  'GESTIÓN DE CLIENTES',
  'COBROS CON STRIPE',
  'RUTINAS PERSONALIZADAS',
  'PORTAL WEB PARA CLIENTES',
  'SEGUIMIENTO DE PROGRESO',
  'SERVIDORES EN EUROPA',
  'CHAT DIRECTO',
  '100% EN ESPAÑOL',
  'RGPD COMPLIANT',
  '0% COMISIÓN EN COBROS',
]

function Ticker() {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const velocity = Math.abs(window.scrollY - lastY)
      lastY = window.scrollY
      if (!trackRef.current) return
      if (velocity > 12) {
        trackRef.current.classList.add('ticker-track--fast')
      } else {
        trackRef.current.classList.remove('ticker-track--fast')
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="ticker-section" aria-hidden="true">
      <div ref={trackRef} className="ticker-track">
        {items.map((item, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-sep" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const PROBLEMS = [
  { tool: 'WHATSAPP',    text: 'RUTINAS PERDIDAS EN EL HISTORIAL.' },
  { tool: 'EXCEL',       text: 'DATOS QUE NO SE SINCRONIZAN SOLOS.' },
  { tool: 'BIZUM',       text: 'PERSIGUIENDO PAGOS CADA FIN DE MES.' },
  { tool: 'PDF / EMAIL', text: 'ARCHIVOS QUE EL CLIENTE NO ABRE.' },
]

const FEATURES = [
  {
    statement: 'TUS CLIENTES VEN SUS RUTINAS SIN DESCARGAR NADA.',
    detail: 'Portal web incluido. Acceden desde cualquier dispositivo sin instalar ninguna app.',
  },
  {
    statement: 'COBRAS AUTOMÁTICAMENTE. SIN RECORDAR A NADIE.',
    detail: 'Stripe nativo. Pagos recurrentes, facturas automáticas, historial limpio.',
  },
  {
    statement: 'CADA CLIENTE. SU HISTORIAL COMPLETO. SIEMPRE.',
    detail: 'Progreso, mediciones, rutinas pasadas. Todo accesible en segundos.',
  },
]

const STATUS_ROWS = [
  { k: 'ESTADO',          v: 'BETA PRIVADA',    amber: true  },
  { k: 'LANZAMIENTO',     v: 'Q3 2026',         amber: false },
  { k: 'PRECIO FUNDADOR', v: '19€ / MES',       amber: true  },
  { k: 'PLATAFORMA',      v: 'WEB + MÓVIL',     amber: false },
  { k: 'SERVIDORES',      v: 'EU · RGPD',       amber: false },
  { k: 'COMISIÓN COBROS', v: '0%',              amber: true  },
]

const FAQS = [
  {
    q: '¿Cuándo se lanza?',
    a: 'Estamos en beta privada. El lanzamiento público está previsto para Q3 2026. Los que se apunten ahora reciben acceso semanas antes del resto.',
  },
  {
    q: '¿Cuánto cuesta?',
    a: 'El plan base arranca en 19€/mes para hasta 10 clientes activos. Los que se apunten durante la beta obtienen el precio de lanzamiento, fijo desde el primer día.',
  },
  {
    q: '¿Para quién es TrainerBoost?',
    a: 'Para entrenadores personales en España que trabajan con entre 5 y 50 clientes simultáneos y quieren dejar de gestionar con WhatsApp, Excel y Bizum.',
  },
  {
    q: '¿Por qué TrainerBoost y no otra plataforma?',
    a: 'La mayoría están pensadas para el mercado anglosajón: en inglés, con precios en dólares y soporte en otra zona horaria. TrainerBoost está construido para el entrenador personal en España.',
  },
]

// ─── FaqItem ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-row">
      <button className="faq-question" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className="faq-q-text">{q}</span>
        <div className={`faq-icon${open ? ' faq-icon--open' : ''}`} aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1v8M1 5h8" stroke="#D4892A" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </button>
      {open && <p className="faq-answer">{a}</p>}
    </div>
  )
}

// ─── LandingPage ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetch('/api/waitlist')
      .then(r => r.json())
      .then(d => { if (typeof d.total === 'number') setCount(d.total) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cleanup: (() => void) | null = null

    import('@/lib/gsap/config').then(({ getGSAPFull }) =>
      getGSAPFull().then(({ gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin, Observer }) => {

        void ScrambleTextPlugin
        void DrawSVGPlugin

        const ctx = gsap.context(() => {

          // ── 1. Scroll progress bar ────────────────────────────────────────
          gsap.to('.scroll-progress-fill', {
            height: '100%',
            ease: 'none',
            scrollTrigger: { start: 'top top', end: 'bottom bottom', scrub: 0.15 },
          })

          // ── 2. Velocity-based page skew (Observer) ────────────────────────
          let lastVelocity = 0
          Observer.create({
            type: 'scroll',
            onChangeY(self) {
              const v = self.velocityY ?? 0
              lastVelocity = v
              gsap.to('.landing-inner', {
                skewY: v * 0.0006,
                ease: 'power4.out',
                duration: 0.6,
                overwrite: 'auto',
              })
            },
            onStop() {
              gsap.to('.landing-inner', {
                skewY: 0,
                ease: 'elastic.out(1, 0.6)',
                duration: 1.2,
                overwrite: 'auto',
              })
              lastVelocity = 0
            },
          })
          void lastVelocity

          // ── 3. Hero entrance timeline ─────────────────────────────────────
          const tl = gsap.timeline({ delay: 0.5 })

          tl.fromTo('.lp-nav-inner',
            { opacity: 0, y: -14 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
          )

          // SplitText per headline line — alternating direction
          const heroLines = document.querySelectorAll<HTMLElement>('.hero-h1-line')
          heroLines.forEach((line, idx) => {
            const split = new SplitText(line, { type: 'chars' })
            tl.fromTo(split.chars,
              { opacity: 0, y: idx % 2 === 0 ? -80 : 80, skewX: idx % 2 === 0 ? -12 : 12 },
              {
                opacity: 1, y: 0, skewX: 0,
                duration: 0.85, ease: 'expo.out',
                stagger: { amount: 0.28, from: idx % 2 === 0 ? 'start' : 'end' },
              },
              idx === 0 ? undefined : '-=0.6'
            )
          })

          tl.fromTo('.hero-sub',
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
            '-=0.45'
          )
          tl.fromTo('.hero-form-section',
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
            '-=0.4'
          )

          // ── 4. Hero bg text parallax ──────────────────────────────────────
          gsap.to('.hero-bg-text', {
            y: '-24%',
            ease: 'none',
            scrollTrigger: {
              trigger: '.hero-section',
              start: 'top top',
              end: 'bottom top',
              scrub: 1.5,
            },
          })

          // ── 5. ScrambleText — section labels (one-time on enter) ──────────
          gsap.utils.toArray<HTMLElement>('.section-label').forEach((el) => {
            const original = el.textContent ?? ''
            el.setAttribute('data-label', original)
            ScrollTrigger.create({
              trigger: el,
              start: 'top 93%',
              once: true,
              onEnter: () => {
                gsap.to(el, {
                  duration: 1.0,
                  scrambleText: { text: original, chars: '#@!%$&', revealDelay: 0.25, speed: 0.9 },
                })
              },
            })
          })

          // ── 6. DrawSVG — bidirectional ────────────────────────────────────
          gsap.utils.toArray<SVGLineElement>('.draw-sep-line').forEach((line) => {
            gsap.fromTo(line,
              { drawSVG: '0%' },
              {
                drawSVG: '100%', duration: 1.4, ease: 'power2.inOut',
                scrollTrigger: {
                  trigger: line,
                  start: 'top 90%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
          })

          // ── 7. Problem rows — 3D entrance, bidirectional ──────────────────
          gsap.utils.toArray<HTMLElement>('.problem-item').forEach((el, i) => {
            gsap.fromTo(el,
              { opacity: 0, x: -56, rotateX: 8, transformPerspective: 900, transformOrigin: 'left center' },
              {
                opacity: 1, x: 0, rotateX: 0,
                duration: 0.6, ease: 'power3.out',
                delay: i * 0.08,
                scrollTrigger: {
                  trigger: el,
                  start: 'top 90%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
          })

          // ── 8. Feature items — clipPath wipe, bidirectional ───────────────
          gsap.utils.toArray<HTMLElement>('.feature-item').forEach((el) => {
            gsap.fromTo(el,
              { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
              {
                clipPath: 'inset(0 0% 0 0)',
                duration: 0.9, ease: 'power3.inOut',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 87%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
          })

          // ── 9. Status board rows, bidirectional ───────────────────────────
          gsap.fromTo('.status-row',
            { opacity: 0, x: -22 },
            {
              opacity: 1, x: 0,
              duration: 0.45, ease: 'power2.out', stagger: 0.08,
              scrollTrigger: {
                trigger: '.status-board',
                start: 'top 84%',
                toggleActions: 'play none none reverse',
              },
            }
          )

          // ── 10. FAQ rows, bidirectional ───────────────────────────────────
          gsap.utils.toArray<HTMLElement>('.faq-row').forEach((el, i) => {
            gsap.fromTo(el,
              { opacity: 0, x: i % 2 === 0 ? -20 : 20 },
              {
                opacity: 1, x: 0,
                duration: 0.4, ease: 'power2.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 93%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
          })

          // ── 11. CTA headline SplitText, bidirectional ─────────────────────
          const ctaLines = document.querySelectorAll<HTMLElement>('.cta-h2-line')
          ctaLines.forEach((line, idx) => {
            const split = new SplitText(line, { type: 'chars' })
            gsap.fromTo(split.chars,
              { opacity: 0, y: 70, skewX: idx % 2 === 0 ? 8 : -8 },
              {
                opacity: 1, y: 0, skewX: 0,
                duration: 0.8, ease: 'expo.out',
                stagger: { amount: 0.22, from: idx % 2 === 0 ? 'start' : 'end' },
                delay: idx * 0.1,
                scrollTrigger: {
                  trigger: '.cta-section',
                  start: 'top 82%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
          })

        }) // end gsap.context

        cleanup = () => {
          ctx.revert()
          ScrollTrigger.getAll().forEach(t => t.kill())
        }
      })
    )

    return () => cleanup?.()
  }, [])

  return (
    <div className="landing-root">
      <CrosshairCursor />
      <ScrollProgress />
      <div className="scanline-sweep" aria-hidden="true" />

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div
          className="lp-nav-inner lp-container"
          style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LogoFull height={22} />
            <span className="nav-status">BETA</span>
          </div>
          <Link href="/login" className="lp-nav-link">
            ACCEDER
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </nav>

      <div className="landing-inner">
        <main id="main-content" style={{ position: 'relative', zIndex: 1 }}>

          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <section className="hero-section lp-section">
            <div className="hero-bg-text" aria-hidden="true">BOOST</div>
            <div className="lp-container hero-content">
              <h1 className="hero-h1">
                <span className="hero-h1-line">ENTRENA MÁS.</span>
                <span className="hero-h1-line hero-h1-line--amber">GESTIONA MENOS.</span>
              </h1>
              <div className="hero-bottom-grid">
                <p className="hero-sub" style={{ opacity: 0 }}>
                  Construimos TrainerBoost porque los entrenadores personales
                  en España merecen una herramienta hecha para ellos.
                  <br /><br />
                  <strong>Sin comisiones ocultas. Sin inglés. Sin onboarding de tres horas.</strong>
                </p>
                <div className="hero-form-section" style={{ opacity: 0 }}>
                  <WaitlistForm onSuccess={(t) => setCount(t)} />
                </div>
              </div>
            </div>
          </section>

          {/* ── Ticker ───────────────────────────────────────────────────── */}
          <Ticker />

          {/* ── Problem ──────────────────────────────────────────────────── */}
          <section className="lp-section">
            <div className="lp-container">
              <DrawSep />
              <span className="section-label">EL PROBLEMA</span>
              <div className="problem-list">
                {PROBLEMS.map(({ tool, text }) => (
                  <div key={tool} className="problem-item">
                    <span className="problem-tool">{tool}</span>
                    <span className="problem-text">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Features ─────────────────────────────────────────────────── */}
          <section className="lp-section">
            <div className="lp-container">
              <DrawSep />
              <span className="section-label">LO QUE CONSTRUIMOS</span>
              <div className="feature-list">
                {FEATURES.map(({ statement, detail }, i) => (
                  <div key={i} className="feature-item">
                    <div>
                      <div className="feature-index">0{i + 1}</div>
                      <p className="feature-statement">{statement}</p>
                    </div>
                    <p className="feature-detail">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Status board ─────────────────────────────────────────────── */}
          <section className="lp-section">
            <div className="lp-container">
              <DrawSep />
              <span className="section-label">ESTADO DEL PROYECTO</span>
              <div className="status-board" style={{ maxWidth: '600px' }}>
                <div className="status-board-header">
                  <span className="status-board-title">TRAINERBOOST — MISSION BRIEF</span>
                  <span className="status-live-dot" aria-hidden="true" />
                </div>
                {STATUS_ROWS.map(({ k, v, amber }) => (
                  <div key={k} className="status-row">
                    <span className="status-key">{k}</span>
                    <span className={`status-val${amber ? ' status-val--amber' : ''}`}>{v}</span>
                  </div>
                ))}
              </div>
              {count > 0 && (
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em',
                  color: 'var(--smoke)', marginTop: '20px', textTransform: 'uppercase',
                }}>
                  {count} entrenadores en la lista de espera
                </p>
              )}
            </div>
          </section>

          {/* ── FAQ ──────────────────────────────────────────────────────── */}
          <section className="lp-section">
            <div className="lp-container">
              <DrawSep />
              <div className="faq-grid">
                <div>
                  <span className="section-label">PREGUNTAS</span>
                  <h2 className="faq-heading">ANTES DE<br />APUNTARTE</h2>
                </div>
                <div>
                  {FAQS.map(faq => <FaqItem key={faq.q} {...faq} />)}
                </div>
              </div>
            </div>
          </section>

          {/* ── CTA final ────────────────────────────────────────────────── */}
          <section className="cta-section lp-section">
            <div className="lp-container">
              <DrawSep />
              <h2 className="cta-h2">
                <span className="cta-h2-line">APÚNTATE</span>
                <span className="cta-h2-line cta-h2-line--amber">AHORA.</span>
              </h2>
              <div className="cta-form-wrap">
                <WaitlistForm onSuccess={(t) => setCount(t)} />
              </div>
            </div>
          </section>

        </main>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer className="lp-footer">
          <div className="lp-container lp-footer-inner">
            <LogoFull height={18} animated={false} />
            <div className="lp-footer-links">
              <Link href="/privacy" className="lp-footer-link">Privacidad</Link>
              <Link href="/terms" className="lp-footer-link">Términos</Link>
            </div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.12em',
              color: 'var(--ash)', margin: 0, textTransform: 'uppercase',
            }}>
              © 2026 TrainerBoost · España
            </p>
          </div>
        </footer>
      </div>

      <RGPDConsent />
    </div>
  )
}
