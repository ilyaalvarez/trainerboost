'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import LogoFull from '@/components/logo/LogoFull'
import './styles/landing.css'

const WaitlistForm = dynamic(() => import('@/components/landing/WaitlistForm'), { ssr: false })
const RGPDConsent  = dynamic(() => import('@/components/landing/RGPDConsent'),  { ssr: false })

// ─── Text scramble ───────────────────────────────────────────────────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%'

function useScramble(target: string, active: boolean, delay = 0) {
  const [display, setDisplay] = useState(() =>
    target.split('').map((c) => (c === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)])).join('')
  )

  useEffect(() => {
    if (!active) return
    let rafId: number
    let t0: number | null = null

    const run = (ts: number) => {
      if (t0 === null) t0 = ts + delay * 1000
      if (ts < t0) { rafId = requestAnimationFrame(run); return }

      const revealed = Math.min(Math.floor((ts - t0) / 36), target.length)

      setDisplay(
        target.split('').map((ch, i) => {
          if (ch === ' ') return ' '
          if (i < revealed) return ch
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        }).join('')
      )

      if (revealed < target.length) rafId = requestAnimationFrame(run)
    }

    rafId = requestAnimationFrame(run)
    return () => cancelAnimationFrame(rafId)
  }, [active, delay, target])

  return display
}

// ─── Live boost bar ──────────────────────────────────────────────────────────
function BoostBar({ total, max }: { total: number; max: number }) {
  const fillRef  = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const fired    = useRef(false)
  const pct      = Math.min((total / max) * 100, 100)

  useEffect(() => {
    const fill  = fillRef.current
    const count = countRef.current
    if (!fill || !count || fired.current) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        fired.current = true

        import('@/lib/gsap/config').then(({ getGSAP }) =>
          getGSAP().then(({ gsap }) => {
            gsap.fromTo(fill, { width: '0%' }, { width: `${pct}%`, duration: 1.7, ease: 'power2.out' })
            const obj = { v: 0 }
            gsap.to(obj, {
              v: total, duration: 1.5, ease: 'power2.out',
              onUpdate() { if (count) count.textContent = String(Math.round(obj.v)) },
            })
          })
        )
      },
      { threshold: 0.4 }
    )
    io.observe(fill)
    return () => io.disconnect()
  }, [pct, total])

  return (
    <div className="boost-bar-wrapper">
      <div className="boost-bar-header">
        <span className="boost-bar-label">BOOST DISPONIBLE</span>
        <span className="boost-bar-count">
          <strong><span ref={countRef}>0</span></strong>
          <span> / {max} plazas</span>
        </span>
      </div>
      <div className="boost-bar-track">
        <div ref={fillRef} className="boost-bar-fill" />
      </div>
    </div>
  )
}

// ─── Ticker ──────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  '< 10 MIN DE SETUP',
  '0€ PARA TUS CLIENTES',
  '100% EN ESPAÑOL',
  'DATOS EN SERVIDORES EU',
  'SIN COMISIÓN EN COBROS',
  'STRIPE NATIVO',
  'CHAT DIRECTO CON CLIENTES',
  'SEGUIMIENTO EN TIEMPO REAL',
  'RGPD COMPLIANT',
  'CANCELA CUANDO QUIERAS',
]

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="ticker-section" aria-hidden="true">
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const PROBLEMS = [
  { tool: 'WHATSAPP',       reality: 'Rutinas perdidas entre memes del grupo de familia.' },
  { tool: 'PDF / EMAIL',    reality: 'El cliente dice que no le llegó. Lo dice siempre.' },
  { tool: 'EXCEL',          reality: 'Sin sync. Sin historial real. Sin datos que te sirvan.' },
  { tool: 'BIZUM / TRANSF.', reality: 'Persiguiendo pagos a final de cada mes.' },
]

const UNLOCKS = [
  {
    badge: 'FUNDADOR',
    title: '40% DESCUENTO VITALICIO',
    desc: 'El precio que pagues hoy se congela. Sin revisiones anuales. Sin excepciones nunca.',
  },
  {
    badge: 'BETA PRIVADA',
    title: 'ACCESO ANTES DEL LANZAMIENTO',
    desc: 'Semanas de ventaja frente al mercado. Tus clientes ya activos cuando la competencia empiece.',
  },
  {
    badge: 'SIN FEE',
    title: 'COBROS DIRECTOS SIN COMISIÓN',
    desc: 'Crea pagos con Stripe y cobra el 100% de lo que facturas. TrainerBoost no toca tus ingresos.',
  },
  {
    badge: 'SOPORTE',
    title: 'CANAL DIRECTO AL EQUIPO',
    desc: 'Acceso al grupo privado con los fundadores. Tu feedback va directamente al roadmap.',
  },
]

const FAQS = [
  {
    q: '¿Cuándo abre el acceso?',
    a: 'Las primeras 100 plazas reciben acceso semanas antes del lanzamiento público. Te avisamos por email en cuanto tu plaza esté lista.',
  },
  {
    q: '¿Cuánto costará?',
    a: 'El plan base arranca en 19€/mes para hasta 10 clientes. Los fundadores pagan un 40% menos, bloqueado de por vida desde el día que se unen.',
  },
  {
    q: '¿Necesito dar mis datos de pago ahora?',
    a: 'No. La lista de espera es solo tu email. Sin tarjeta, sin compromiso. Te avisamos cuando tu plaza esté disponible y decides en ese momento.',
  },
]

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-row" style={{ borderBottom: '1px solid rgba(200,255,71,0.08)' }}>
      <button
        className="w-full flex items-start justify-between gap-8 py-6 text-left"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#E8FFD8', lineHeight: 1.5 }}>{q}</span>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
          className="shrink-0"
          style={{
            marginTop: '2px',
            transition: 'transform 0.25s',
            transform: open ? 'rotate(45deg)' : 'none',
          }}
        >
          <path d="M8 3v10M3 8h10" stroke="#C8FF47" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <p style={{ paddingBottom: '24px', fontSize: '13px', lineHeight: 1.7, color: 'rgba(232,255,216,0.5)', margin: 0 }}>
          {a}
        </p>
      )}
    </div>
  )
}

// ─── LandingPage ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [ready, setReady] = useState(false)
  const [count, setCount] = useState(52) // seed, real value fetched below

  const line1 = useScramble('DE 5 CLIENTES', ready, 0)
  const line2 = useScramble('A 50.',          ready, 0.26)
  const line3 = useScramble('SIN CAOS.',      ready, 0.52)

  // Fetch live waitlist count
  useEffect(() => {
    fetch('/api/waitlist')
      .then(r => r.json())
      .then(d => { if (typeof d.total === 'number') setCount(d.total) })
      .catch(() => {})
  }, [])

  // Trigger scramble after scanline sweep
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 700)
    return () => clearTimeout(t)
  }, [])

  // GSAP
  useEffect(() => {
    let cleanup: (() => void) | null = null

    import('@/lib/gsap/config').then(({ getGSAP }) =>
      getGSAP().then(({ gsap, ScrollTrigger }) => {
        const ctx = gsap.context(() => {
          // Nav — after scanline
          gsap.fromTo('.lp-nav-inner',
            { opacity: 0, y: -14 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.65 }
          )

          // H1 container — instantly visible so scramble shows
          gsap.set('.hero-h1', { opacity: 1, delay: 0.68 })

          // Sub
          gsap.fromTo('.hero-sub',
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 1.05 }
          )

          // Boost + form
          gsap.fromTo('.hero-boost-section',
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.2)', delay: 1.16 }
          )
          gsap.fromTo('.hero-form-section',
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', delay: 1.28 }
          )

          // Problem rows — enter from left like a scan
          gsap.utils.toArray<HTMLElement>('.problem-row').forEach((el, i) => {
            gsap.fromTo(el,
              { opacity: 0, x: -32 },
              {
                opacity: 1, x: 0, duration: 0.4, ease: 'power2.out',
                delay: i * 0.07,
                scrollTrigger: { trigger: el, start: 'top 93%', once: true },
              }
            )
          })

          // Unlock items — reveal via clip-path (not fade)
          gsap.utils.toArray<HTMLElement>('.unlock-item').forEach((el, i) => {
            gsap.fromTo(el,
              { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
              {
                opacity: 1, clipPath: 'inset(0 0% 0 0)',
                duration: 0.55, ease: 'power2.out',
                delay: i * 0.06,
                scrollTrigger: { trigger: el, start: 'top 91%', once: true },
              }
            )
          })

          // FAQ
          gsap.utils.toArray<HTMLElement>('.faq-row').forEach((el) => {
            gsap.fromTo(el,
              { opacity: 0, y: 12 },
              {
                opacity: 1, y: 0, duration: 0.35, ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 93%', once: true },
              }
            )
          })
        })

        cleanup = () => {
          ctx.revert()
          ScrollTrigger.getAll().forEach(t => t.kill())
        }
      })
    )

    return () => cleanup?.()
  }, [])

  const spotsLeft = Math.max(0, 100 - count)

  return (
    <div className="landing-root">

      {/* Scanline sweep */}
      <div className="scanline-sweep" aria-hidden="true" />

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div
          className="lp-nav-inner max-w-6xl mx-auto px-6 h-14 flex items-center justify-between"
          style={{ opacity: 0 }}
        >
          <div className="flex items-center gap-3">
            <LogoFull height={22} />
            <span className="nav-beta">BETA</span>
          </div>
          <Link href="/login" className="lp-nav-link">ENTRAR →</Link>
        </div>
      </nav>

      <main id="main-content" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pt-14 pb-10">
          <div className="hero-rule mb-10" />

          {/* H1 scramble */}
          <h1 className="hero-h1 mb-10" style={{ opacity: 0 }}>
            <span className="block">{line1}</span>
            <span className="block hero-line--accent">{line2}</span>
            <span className="block">{line3}</span>
          </h1>

          {/* Sub + boost bar */}
          <div className="grid md:grid-cols-[55fr_45fr] gap-10 md:gap-20 items-end mb-10">
            <p className="hero-sub" style={{ opacity: 0 }}>
              WhatsApp no es un CRM.<br />
              <strong>TrainerBoost sí.</strong>
            </p>
            <div className="hero-boost-section" style={{ opacity: 0 }}>
              <BoostBar total={count} max={100} />
            </div>
          </div>

          {/* Form */}
          <div className="hero-form-section" style={{ opacity: 0 }}>
            <WaitlistForm onSuccess={(t) => setCount(t)} />
          </div>

          <div className="hero-rule mt-10" />
        </section>

        {/* ── Ticker ────────────────────────────────────────────── */}
        <Ticker />

        {/* ── Problem ───────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <span className="section-label">¿QUÉ USAS AHORA?</span>
          <div className="problem-table">
            {PROBLEMS.map(({ tool, reality }) => (
              <div key={tool} className="problem-row">
                <span className="problem-tool">{tool}</span>
                <span className="problem-reality">{reality}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Unlocks ───────────────────────────────────────────── */}
        <section style={{ borderTop: '1px solid rgba(200,255,71,0.07)', paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="max-w-6xl mx-auto px-6">
            <span className="section-label">ACCESO FUNDADOR</span>
            <div className="unlock-table">
              {UNLOCKS.map(({ badge, title, desc }) => (
                <div key={title} className="unlock-item">
                  <div><span className="unlock-badge">{badge}</span></div>
                  <div>
                    <h3 className="unlock-title">{title}</h3>
                    <p className="unlock-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <section style={{ borderTop: '1px solid rgba(200,255,71,0.07)', paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-[240px_1fr] gap-16 md:gap-28">
              <div>
                <span className="section-label">PREGUNTAS</span>
                <h2
                  style={{
                    fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)',
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.05,
                    color: '#E8FFD8',
                    margin: 0,
                  }}
                >
                  ANTES DE<br />APUNTARTE
                </h2>
              </div>
              <div>
                {FAQS.map(faq => <FaqItem key={faq.q} {...faq} />)}
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────── */}
        <section style={{ borderTop: '1px solid rgba(200,255,71,0.07)', paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="hero-rule mb-14" />

            <span className="section-label">ÚLTIMAS PLAZAS</span>

            <h2
              className="hero-h1 mb-10"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
            >
              <span className="block">QUEDAN</span>
              <span className="block hero-line--accent">{spotsLeft} PLAZAS.</span>
              <span className="block">NO VUELVAS</span>
              <span className="block">MÁS TARDE.</span>
            </h2>

            <WaitlistForm onSuccess={(t) => setCount(t)} />

            <div className="hero-rule mt-14" />
          </div>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{ padding: '40px 24px', position: 'relative', zIndex: 1 }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <LogoFull height={20} animated={false} />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 justify-center" aria-label="Footer">
            {[
              ['/pricing',      'Precios'],
              ['/demo/trainer', 'Demo'],
              ['/login',        'Acceso'],
              ['/privacy',      'Privacidad'],
              ['/terms',        'Términos'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="lp-nav-link" style={{ fontSize: '10px' }}>
                {label}
              </Link>
            ))}
          </nav>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            letterSpacing: '0.12em', color: 'rgba(232,255,216,0.18)',
          }}>
            © 2026 TRAINERBOOST · ESPAÑA
          </p>
        </div>
      </footer>

      <RGPDConsent />
    </div>
  )
}
