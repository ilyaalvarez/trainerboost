'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import LogoFull from '@/components/logo/LogoFull'
import './styles/landing.css'

const WaitlistForm = dynamic(() => import('@/components/landing/WaitlistForm'), { ssr: false })
const RGPDConsent  = dynamic(() => import('@/components/landing/RGPDConsent'),  { ssr: false })

// ─── Magnetic cursor ──────────────────────────────────────────────────────────
function MagneticCursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    let cleanup: (() => void) | null = null

    import('@/lib/gsap/config').then(({ getGSAP }) =>
      getGSAP().then(({ gsap }) => {
        const xRing = gsap.quickTo(ringRef.current, 'x', { duration: 0.5, ease: 'power3.out' })
        const yRing = gsap.quickTo(ringRef.current, 'y', { duration: 0.5, ease: 'power3.out' })
        const xDot  = gsap.quickTo(dotRef.current,  'x', { duration: 0.08, ease: 'none' })
        const yDot  = gsap.quickTo(dotRef.current,  'y', { duration: 0.08, ease: 'none' })

        const onMove = (e: MouseEvent) => { xRing(e.clientX); yRing(e.clientY); xDot(e.clientX); yDot(e.clientY) }
        const onOver = (e: MouseEvent) => {
          if ((e.target as HTMLElement).closest('a, button, input')) ringRef.current?.classList.add('mag-cursor--hover')
        }
        const onOut  = () => ringRef.current?.classList.remove('mag-cursor--hover')

        window.addEventListener('mousemove', onMove)
        document.addEventListener('mouseover', onOver)
        document.addEventListener('mouseout',  onOut)
        cleanup = () => {
          window.removeEventListener('mousemove', onMove)
          document.removeEventListener('mouseover', onOver)
          document.removeEventListener('mouseout',  onOut)
        }
      })
    )

    return () => cleanup?.()
  }, [])

  return (
    <>
      <div ref={ringRef} className="mag-cursor" aria-hidden="true" />
      <div ref={dotRef}  className="mag-cursor-dot" aria-hidden="true" />
    </>
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
    detail: 'Portal web incluido. Tus clientes acceden desde cualquier dispositivo sin instalar ninguna app.',
  },
  {
    statement: 'COBRAS AUTOMÁTICAMENTE. SIN RECORDAR A NADIE.',
    detail: 'Stripe integrado de forma nativa. Pagos recurrentes, facturas automáticas, historial limpio.',
  },
  {
    statement: 'CADA CLIENTE. SU HISTORIAL COMPLETO. SIEMPRE.',
    detail: 'Progreso, mediciones, rutinas pasadas. Todo en un solo lugar, accesible en segundos.',
  },
]

const STATUS_ROWS = [
  { k: 'ESTADO',          v: 'BETA PRIVADA',    amber: true  },
  { k: 'LANZAMIENTO',     v: 'Q3 2026',         amber: false },
  { k: 'PRECIO FUNDADOR', v: '19€ / MES',       amber: true  },
  { k: 'DESCUENTO BETA',  v: '—40% VITALICIO',  amber: false },
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
    a: 'El plan base arranca en 19€/mes para hasta 10 clientes activos. Los fundadores obtienen un 40% de descuento permanente, bloqueado desde el día que se unen.',
  },
  {
    q: '¿Necesito dar mi tarjeta ahora?',
    a: 'No. La lista de espera es solo tu email. Sin tarjeta, sin compromiso. Te avisamos cuando tu acceso esté listo y decides en ese momento.',
  },
  {
    q: '¿Por qué TrainerBoost y no otra plataforma?',
    a: 'La mayoría están pensadas para el mercado anglosajón: en inglés, con precios en dólares y soporte en otra zona horaria. TrainerBoost está construido desde cero para el entrenador personal en España.',
  },
]

const TICKER_ITEMS = [
  'GESTIÓN DE CLIENTES',
  'PAGOS CON STRIPE',
  'RUTINAS PERSONALIZADAS',
  'PORTAL WEB PARA CLIENTES',
  'SEGUIMIENTO DE PROGRESO',
  'SERVIDORES EN EUROPA',
  'CHAT DIRECTO',
  '100% EN ESPAÑOL',
  'RGPD COMPLIANT',
  'SIN COMISIÓN EN COBROS',
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

// ─── DrawSVG separator ────────────────────────────────────────────────────────
function DrawSep() {
  return (
    <svg
      className="draw-separator"
      height="1"
      style={{ display: 'block', marginBottom: '48px', overflow: 'visible' }}
      aria-hidden="true"
    >
      <line className="draw-sep-line" x1="0" y1="0.5" x2="100%" y2="0.5"
        stroke="rgba(212,137,42,0.18)" strokeWidth="1" />
    </svg>
  )
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="ticker-section" aria-hidden="true">
      <div className="ticker-track">
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

// ─── LandingPage ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [count, setCount] = useState(0)

  // Fetch real waitlist count
  useEffect(() => {
    fetch('/api/waitlist')
      .then(r => r.json())
      .then(d => { if (typeof d.total === 'number') setCount(d.total) })
      .catch(() => {})
  }, [])

  // GSAP orchestration
  useEffect(() => {
    let cleanup: (() => void) | null = null
    let magneticCleanup: (() => void) | null = null

    import('@/lib/gsap/config').then(({ getGSAPFull }) =>
      getGSAPFull().then(({ gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin }) => {

        void ScrambleTextPlugin // registered in getGSAPFull
        void DrawSVGPlugin

        const ctx = gsap.context(() => {

          // ── Hero entrance timeline ────────────────────────────────────────
          const tl = gsap.timeline({ delay: 0.55 })

          tl.fromTo('.lp-nav-inner',
            { opacity: 0, y: -14 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
          )

          // SplitText per headline line — alternating stagger direction
          const lines = document.querySelectorAll<HTMLElement>('.hero-h1-line')
          lines.forEach((line, idx) => {
            const split = new SplitText(line, { type: 'chars' })
            tl.fromTo(split.chars,
              { opacity: 0, y: idx % 2 === 0 ? -70 : 70, skewX: idx % 2 === 0 ? -10 : 10 },
              {
                opacity: 1, y: 0, skewX: 0,
                duration: 0.8, ease: 'expo.out',
                stagger: { amount: 0.25, from: idx % 2 === 0 ? 'start' : 'end' },
              },
              idx === 0 ? undefined : '-=0.55'
            )
          })

          tl.fromTo('.hero-sub',
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
            '-=0.4'
          )
          tl.fromTo('.hero-form-section',
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
            '-=0.35'
          )

          // ── Hero background text parallax ─────────────────────────────────
          gsap.to('.hero-bg-text', {
            y: '-22%',
            ease: 'none',
            scrollTrigger: {
              trigger: '.hero-section',
              start: 'top top',
              end: 'bottom top',
              scrub: 1.5,
            },
          })

          // ── ScrambleText on section labels ────────────────────────────────
          gsap.utils.toArray<HTMLElement>('.section-label').forEach((el) => {
            const original = el.getAttribute('data-label') ?? el.textContent ?? ''
            el.setAttribute('data-label', original)
            ScrollTrigger.create({
              trigger: el,
              start: 'top 92%',
              once: true,
              onEnter: () => {
                gsap.to(el, {
                  duration: 1.0,
                  scrambleText: { text: original, chars: '#@!%$&', revealDelay: 0.25, speed: 0.85 },
                })
              },
            })
          })

          // ── DrawSVG on separator lines ─────────────────────────────────────
          gsap.utils.toArray<SVGLineElement>('.draw-sep-line').forEach((line) => {
            gsap.fromTo(line,
              { drawSVG: '0%' },
              {
                drawSVG: '100%', duration: 1.4, ease: 'power2.inOut',
                scrollTrigger: { trigger: line, start: 'top 90%', once: true },
              }
            )
          })

          // ── Problem rows — enter from left ────────────────────────────────
          gsap.utils.toArray<HTMLElement>('.problem-item').forEach((el, i) => {
            gsap.fromTo(el,
              { opacity: 0, x: -48 },
              {
                opacity: 1, x: 0, duration: 0.55, ease: 'power3.out',
                delay: i * 0.09,
                scrollTrigger: { trigger: el, start: 'top 92%', once: true },
              }
            )
          })

          // ── Feature items — clipPath wipe from left ───────────────────────
          gsap.utils.toArray<HTMLElement>('.feature-item').forEach((el) => {
            gsap.fromTo(el,
              { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
              {
                clipPath: 'inset(0 0% 0 0)', duration: 0.85, ease: 'power3.inOut',
                scrollTrigger: { trigger: el, start: 'top 88%', once: true },
              }
            )
          })

          // ── Status board rows ──────────────────────────────────────────────
          gsap.fromTo('.status-row',
            { opacity: 0, x: -20 },
            {
              opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', stagger: 0.08,
              scrollTrigger: { trigger: '.status-board', start: 'top 85%', once: true },
            }
          )

          // ── FAQ rows ───────────────────────────────────────────────────────
          gsap.utils.toArray<HTMLElement>('.faq-row').forEach((el) => {
            gsap.fromTo(el,
              { opacity: 0, y: 14 },
              {
                opacity: 1, y: 0, duration: 0.4, ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 94%', once: true },
              }
            )
          })

          // ── CTA section heading SplitText ─────────────────────────────────
          const ctaLines = document.querySelectorAll<HTMLElement>('.cta-h2-line')
          ctaLines.forEach((line, idx) => {
            const split = new SplitText(line, { type: 'chars' })
            gsap.fromTo(split.chars,
              { opacity: 0, y: 60 },
              {
                opacity: 1, y: 0, duration: 0.75, ease: 'expo.out',
                stagger: { amount: 0.2, from: idx % 2 === 0 ? 'start' : 'end' },
                delay: idx * 0.1,
                scrollTrigger: { trigger: '.cta-section', start: 'top 80%', once: true },
              }
            )
          })

        }) // end gsap.context

        // ── Magnetic CTA button (outside context for cleanup) ─────────────
        const ctaBtn = document.querySelector<HTMLElement>('.magnetic-cta')
        if (ctaBtn) {
          let inRange = false
          const onMouse = (e: MouseEvent) => {
            const r  = ctaBtn.getBoundingClientRect()
            const cx = r.left + r.width / 2
            const cy = r.top  + r.height / 2
            const dx = e.clientX - cx
            const dy = e.clientY - cy
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 130) {
              inRange = true
              const pull = 0.38 * (1 - dist / 130)
              gsap.to(ctaBtn, { x: dx * pull, y: dy * pull, duration: 0.25, ease: 'power2.out' })
            } else if (inRange) {
              inRange = false
              gsap.to(ctaBtn, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1.1, 0.4)' })
            }
          }
          window.addEventListener('mousemove', onMouse)
          magneticCleanup = () => window.removeEventListener('mousemove', onMouse)
        }

        cleanup = () => {
          ctx.revert()
          ScrollTrigger.getAll().forEach(t => t.kill())
          magneticCleanup?.()
        }
      })
    )

    return () => cleanup?.()
  }, [])

  return (
    <div className="landing-root">
      <MagneticCursor />
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

      <main id="main-content" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="hero-section lp-section">
          <div className="hero-bg-text" aria-hidden="true">BOOST</div>
          <div className="lp-container hero-content">

            <h1 className="hero-h1">
              <span className="hero-h1-line">ENTRENA MÁS.</span>
              <span className="hero-h1-line hero-h1-line--amber">GESTIONA MENOS.</span>
            </h1>

            <div className="hero-bottom-grid">
              <p className="hero-sub" style={{ opacity: 0 }}>
                Construimos TrainerBoost porque los entrenadores personales en España
                merecen una herramienta hecha para ellos.
                <br /><br />
                <strong>Sin comisiones ocultas. Sin inglés. Sin onboarding de tres horas.</strong>
              </p>
              <div className="hero-form-section" style={{ opacity: 0 }}>
                <WaitlistForm onSuccess={(t) => setCount(t)} />
              </div>
            </div>

          </div>
        </section>

        {/* ── Ticker ───────────────────────────────────────────────────────── */}
        <Ticker />

        {/* ── Problem ──────────────────────────────────────────────────────── */}
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

        {/* ── Features ─────────────────────────────────────────────────────── */}
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

        {/* ── Status board ─────────────────────────────────────────────────── */}
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

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="lp-section">
          <div className="lp-container">
            <DrawSep />
            <div className="faq-grid">
              <div>
                <span className="section-label">PREGUNTAS</span>
                <h2 className="faq-heading">
                  ANTES DE<br />APUNTARTE
                </h2>
              </div>
              <div>
                {FAQS.map(faq => <FaqItem key={faq.q} {...faq} />)}
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────────── */}
        <section className="cta-section lp-section">
          <div className="lp-container">
            <DrawSep />
            <h2 className="cta-h2">
              <span className="cta-h2-line">APÚNTATE</span>
              <span className="cta-h2-line cta-h2-line--amber">AHORA.</span>
            </h2>

            <div className="cta-grid">
              <div>
                <a href="#main-content" className="magnetic-cta" onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('.waitlist-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}>
                  <span>QUIERO ACCESO</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em',
                  color: 'var(--smoke)', marginTop: '14px', textTransform: 'uppercase',
                }}>
                  Sin tarjeta · Sin compromiso · Solo tu email
                </p>
              </div>

              <div className="cta-perks">
                {[
                  '40% descuento vitalicio en precio fundador',
                  'Acceso semanas antes del lanzamiento público',
                  'Canal directo con el equipo de producto',
                ].map((perk) => (
                  <div key={perk} style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontSize: '11px', flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: '13px', color: 'var(--ivory-dim)', lineHeight: 1.6 }}>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <LogoFull height={20} animated={false} />
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '0 28px', justifyContent: 'center' }} aria-label="Footer">
            {([
              ['/pricing',      'Precios'],
              ['/demo/trainer', 'Demo'],
              ['/login',        'Acceso'],
              ['/privacy',      'Privacidad'],
              ['/terms',        'Términos'],
            ] as [string, string][]).map(([href, label]) => (
              <Link key={href} href={href} className="lp-nav-link" style={{ fontSize: '10px' }}>
                {label}
              </Link>
            ))}
          </nav>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em',
            color: 'var(--ash)', margin: 0, textTransform: 'uppercase',
          }}>
            © 2026 TrainerBoost · España
          </p>
        </div>
      </footer>

      <RGPDConsent />
    </div>
  )
}
