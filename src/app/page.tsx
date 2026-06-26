'use client'
import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { BootLoader } from '@/components/landing/BootLoader'
import WaitlistForm from '@/components/landing/WaitlistForm'
import { Accordion } from '@/components/ui/Accordion'
import { FeatureScroll } from '@/components/landing/FeatureScroll'
import { ModuleSelector } from '@/components/landing/ModuleSelector'
import LogoFull from '@/components/logo/LogoFull'
import LogoIcon from '@/components/logo/LogoIcon'
import './styles/landing.css'

gsap.registerPlugin(ScrollTrigger)

// ── Mockup dashboard — sin device frame, datos de ejemplo reales ─────────────
function DashboardMockup() {
  const CHART = '0,45 30,35 55,40 80,18 110,22 140,10 170,14 200,6'
  return (
    <div className="dm-outer">
      <div className="dm-pill dm-pill--tl">
        <span className="dm-pill-val">24</span>
        <span className="dm-pill-label">clientes activos</span>
      </div>
      <div className="dm-pill dm-pill--tr">
        <span className="dm-pill-val">2.840€</span>
        <span className="dm-pill-label">ingresos este mes</span>
      </div>
      <div className="dm-pill dm-pill--b">
        <span className="dm-pill-val">38</span>
        <span className="dm-pill-label">sesiones esta semana</span>
      </div>

      <div className="dm-card">
        <div className="dm-sidebar">
          <div className="dm-logo-mark" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`dm-nav-item${i === 0 ? ' dm-nav-item--active' : ''}`} />
          ))}
        </div>

        <div className="dm-content">
          <div className="dm-topbar">
            <span className="dm-section-label">Dashboard · Jun 2026</span>
            <div className="dm-avatar-sm" />
          </div>

          <div className="dm-stats-row">
            {[
              { val: '24',     label: 'Clientes', trend: '+3'  },
              { val: '2.840€', label: 'Ingresos', trend: '+12%' },
              { val: '38',     label: 'Sesiones', trend: '↑'   },
            ].map((s) => (
              <div key={s.label} className="dm-stat-card">
                <span className="dm-stat-val">{s.val}</span>
                <span className="dm-stat-label">{s.label}</span>
                <span className="dm-stat-trend">{s.trend}</span>
              </div>
            ))}
          </div>

          <div className="dm-chart-area">
            <span className="dm-chart-label">Ingresos por semana</span>
            <svg viewBox="0 0 200 60" className="dm-chart-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#8FD43A" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#8FD43A" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={`0,60 ${CHART} 200,60`} fill="url(#cg)" />
              <polyline
                points={CHART}
                fill="none"
                stroke="#8FD43A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="200" cy="6" r="2.5" fill="#8FD43A" />
            </svg>
          </div>

          <div className="dm-clients-list">
            {[
              { init: 'CM', name: 'Carlos M.', prog: '82%', badge: 'activo'   },
              { init: 'LR', name: 'Lucía R.',  prog: '64%', badge: 'activo'   },
              { init: 'JM', name: 'Jorge M.',  prog: '91%', badge: 'renovado' },
            ].map((c) => (
              <div key={c.name} className="dm-client-row">
                <div className="dm-avatar"><span>{c.init}</span></div>
                <div className="dm-client-info">
                  <span className="dm-client-name">{c.name}</span>
                  <div className="dm-progress-bar">
                    <div className="dm-progress-fill" style={{ width: c.prog }} />
                  </div>
                </div>
                <span className={`dm-client-badge dm-client-badge--${c.badge}`}>{c.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Atmósfera crimson fija — el gym encendiéndose ────────────────────────────
function GymAtmosphere() {
  return (
    <div className="gym-lights" aria-hidden="true">
      <div className="gym-ambient" />
      <div className="gym-ceiling-panel" />
      <div className="gym-strip-ceiling" />
      <div className="gym-strip-floor" />
      <div className="gym-side gym-side--l" />
      <div className="gym-side gym-side--r" />
    </div>
  )
}

// ── Cursor dual — dot instantáneo + ring con lerp ────────────────────────────
function DualCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mx = 0, my = 0, rx = 0, ry = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      gsap.set(dot, { x: mx, y: my })
      dot.style.opacity  = '1'
      ring.style.opacity = '1'
      const isLink = !!(e.target as HTMLElement).closest('a, button, [role="button"], input')
      dot.classList.toggle('cursor-dot--hover',   isLink)
      ring.classList.toggle('cursor-ring--hover', isLink)
    }

    document.addEventListener('mousemove', onMove)

    let raf: number
    const tick = () => {
      rx += (mx - rx) * 0.11
      ry += (my - ry) * 0.11
      gsap.set(ring, { x: rx, y: ry })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  )
}

// ── Barra de progreso lateral ─────────────────────────────────────────────────
function ScrollProgressBar() {
  const fillRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const update = () => {
      const max = document.body.scrollHeight - window.innerHeight
      if (fillRef.current && max > 0) {
        fillRef.current.style.height = `${(window.scrollY / max) * 100}%`
      }
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={fillRef} className="scroll-progress-fill" />
    </div>
  )
}

// ── Sticky bar — aparece tras el primer viewport ──────────────────────────────
function StickyBar() {
  const [visible, setVisible] = useState(false)
  const [email,   setEmail]   = useState('')
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'success'>('idle')

  useEffect(() => {
    const check = () => setVisible(window.scrollY > window.innerHeight * 0.7)
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || status !== 'idle') return
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'sticky' }),
      })
      setStatus(res.ok ? 'success' : 'idle')
    } catch { setStatus('idle') }
  }

  return (
    <div className={`sticky-bar${visible ? ' sticky-bar--visible' : ''}`} aria-label="Lista de espera (barra fija)">
      {status === 'success' ? (
        <p className="sticky-bar-success">Recibido. Te avisamos antes del lanzamiento.</p>
      ) : (
        <form onSubmit={submit} className="sticky-bar-form" noValidate>
          <span className="sticky-bar-label">Lista de espera</span>
          <div className="sticky-bar-input-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="sticky-bar-input"
              disabled={status === 'loading'}
              aria-label="Email para la lista de espera"
            />
            <button
              type="submit"
              className="sticky-bar-btn"
              disabled={status === 'loading' || !email}
            >
              {status === 'loading' ? '...' : 'Avísame'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// ── Datos ─────────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  { val: '0%',      label: 'Comisión sobre tus cobros' },
  { val: '5h',      label: 'Ahorradas cada semana'      },
  { val: '< 1 día', label: 'Para estar operativo'       },
  { val: '100%',    label: 'En español'                 },
  { val: '0',       label: 'Apps que instalar'          },
  { val: 'España',  label: 'Hecho y pensado aquí'       },
]

const PAIN_ITEMS = [
  {
    bad:  'WhatsApp no es un CRM.',
    good: 'Cada cliente, en su ficha. Todo el historial en un sitio.',
  },
  {
    bad:  'Excel no es una plataforma de cobros.',
    good: 'Stripe integrado. El cliente paga. Tú cobras. Fin.',
  },
  {
    bad:  'Un PDF no es un plan de entrenamiento.',
    good: 'La rutina la creas una vez. La usas con veinte clientes.',
  },
]

const VENTAJA_CELLS = [
  {
    label: 'Sin comisiones',
    text: 'Pagas la cuota y ya. Cada euro que cobran tus clientes es tuyo. Ni porcentajes ni sorpresas al final del mes.',
  },
  {
    label: 'Sin apps',
    text: 'Tus clientes acceden desde el navegador. No hay "descarga la app" que interrumpa la experiencia antes de empezar.',
  },
  {
    label: 'Operativo en un día',
    text: 'Si sabes usar WhatsApp y Excel, ya sabes usar lo que reemplazamos. Setup completo en menos de una hora.',
  },
]

const FAQ_ITEMS = [
  {
    q: '¿Cuándo estará disponible?',
    a: 'Estamos en beta privada con entrenadores seleccionados. El lanzamiento público está previsto para finales de 2026. Únete a la lista para tener acceso antes que nadie.',
  },
  {
    q: '¿Tengo que instalar alguna app?',
    a: 'No. TrainerBoost funciona desde el navegador. Tus clientes tampoco necesitan instalar nada — acceden desde el móvil o la tablet directamente.',
  },
  {
    q: '¿Cobráis comisión sobre mis pagos?',
    a: 'No. Tus cobros son tuyos. Solo pagas la cuota mensual de la plataforma. Stripe aplica su tarifa estándar de pasarela — que es lo normal — pero TrainerBoost no se lleva ningún porcentaje.',
  },
  {
    q: '¿Qué pasa con mis datos si cancelo?',
    a: 'Son tuyos. Puedes exportar clientes, historial y rutinas en cualquier momento, en formatos estándar. No te dejamos encadenado a la plataforma.',
  },
  {
    q: '¿Funciona para entrenadores con muchos clientes?',
    a: 'Sí. Desde 5 hasta más de 100 clientes sin cambiar de herramienta. La plataforma escala contigo.',
  },
  {
    q: '¿En qué se diferencia de una app genérica de fitness?',
    a: 'Las apps de fitness están pensadas para el cliente final. TrainerBoost está pensado para ti: para gestionar tu negocio, cobrar y hacer seguimiento. Sin ruido extra.',
  },
]

// ── Página principal ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const [booted, setBooted] = useState(false)

  // 1 — Lenis + GSAP ticker
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true, touchMultiplier: 1.5 })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      lenis.destroy()
      gsap.ticker.remove(tick)
    }
  }, [])

  // 2 — Entrada del hero (solo tras boot)
  useEffect(() => {
    if (!booted) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

      // Gym lights — primero
      tl.from('.gym-strip-ceiling, .gym-strip-floor', {
        scaleX: 0,
        transformOrigin: 'center center',
        duration: 1.4,
        ease: 'power3.out',
      }, 0)

      // Contenido — stagger de líneas
      tl.from('.hero-eyebrow',   { opacity: 0, y: 8,  duration: 0.5 }, 0.3)
        .from('.hero-h1-line',   { y: '105%', duration: 1.0, stagger: 0.1 }, 0.45)
        .from('.hero-sub',       { opacity: 0, y: 12, duration: 0.6 }, '-=0.5')
        .from('.hero-form-wrap', { opacity: 0, y: 10, duration: 0.5 }, '-=0.4')

      // Dashboard 3D
      tl.from('.dm-outer', {
        opacity: 0,
        y: 40,
        rotateX: 18,
        transformOrigin: 'center top',
        duration: 1.2,
        ease: 'expo.out',
      }, 0.6)
      tl.from('.dm-pill', {
        opacity: 0,
        scale: 0.75,
        duration: 0.5,
        stagger: 0.12,
        ease: 'back.out(1.4)',
      }, 1.0)

      // Borde scan del formulario
      gsap.to('.hero-form-border-outline', {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1.4,
        delay: 1.2,
        ease: 'power3.out',
      })
    })
    return () => ctx.revert()
  }, [booted])

  // 3 — ScrollTrigger: reveals de secciones
  useEffect(() => {
    if (!booted) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.pain-item').forEach((item) => {
        gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 84%', once: true } })
          .from(item.querySelector('.pain-bad'),  { opacity: 0, x: -14, duration: 0.5, ease: 'expo.out' })
          .from(item.querySelector('.pain-good'), { opacity: 0, x: -14, duration: 0.5, ease: 'expo.out' }, '-=0.2')
      })

      gsap.from('.ventaja-cell', {
        opacity: 0, y: 18, duration: 0.55, stagger: 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: '.ventaja-grid', start: 'top 82%', once: true },
      })

      gsap.from('.pricing-card', {
        opacity: 0, y: 24, duration: 0.6, stagger: 0.14, ease: 'expo.out',
        scrollTrigger: { trigger: '.pricing-cards', start: 'top 84%', once: true },
      })

      gsap.to('.cta-form-border-outline', {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1.4, ease: 'power3.out',
        scrollTrigger: { trigger: '.cta-section', start: 'top 65%', once: true },
      })

      const onMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth  - 0.5) *  7
        const y = (e.clientY / window.innerHeight - 0.5) *  4
        gsap.to('.dm-outer', {
          rotateY: -4 + x,
          rotateX: 6 - y,
          duration: 0.9,
          ease: 'power2.out',
        })
      }
      window.addEventListener('mousemove', onMouseMove)
      return () => window.removeEventListener('mousemove', onMouseMove)
    })
    return () => ctx.revert()
  }, [booted])

  return (
    <>
      {!booted && <BootLoader onComplete={() => setBooted(true)} />}

      <div className="landing-root" style={{ opacity: booted ? 1 : 0, transition: 'opacity 0.3s' }}>

        {/* Capa fija */}
        <GymAtmosphere />
        <DualCursor />
        <ScrollProgressBar />

        {/* Navegación */}
        <nav className="lp-nav" aria-label="Navegación principal">
          <div className="lp-container lp-nav-inner">
            <button
              className="lp-nav-logo-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Ir al inicio"
            >
              <LogoIcon size={26} />
              <span className="nav-status">BETA PRIVADA</span>
            </button>

            <div className="lp-nav-anchors">
              <a href="#sistema" className="lp-nav-anchor">El sistema</a>
              <a href="#precios" className="lp-nav-anchor">Precios</a>
              <a href="#faq"     className="lp-nav-anchor">FAQ</a>
            </div>

            <button
              className="nav-cta"
              onClick={() => document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Lista de espera
            </button>
          </div>
        </nav>

        <main id="main-content">

          {/* ──────────────────────────────────────────────
              HERO — Two columns
              ────────────────────────────────────────── */}
          <section className="hero-section" aria-labelledby="hero-heading">
            <div className="hero-left">
              <div className="hero-eyebrow" aria-hidden="true">
                <div className="hero-eyebrow-dot" />
                <span className="hero-eyebrow-text">Sistema activo · Beta privada · Q3 2026</span>
              </div>

              <h1 id="hero-heading" className="hero-h1">
                <span style={{ overflow: 'hidden', display: 'block' }}>
                  <span className="hero-h1-line" style={{ display: 'block' }}>Ya tienes</span>
                </span>
                <span style={{ overflow: 'hidden', display: 'block' }}>
                  <span className="hero-h1-line" style={{ display: 'block' }}>los clientes.</span>
                </span>
                <span style={{ overflow: 'hidden', display: 'block' }}>
                  <span className="hero-h1-line hero-h1-accent" style={{ display: 'block' }}>Ahora necesitas</span>
                </span>
                <span style={{ overflow: 'hidden', display: 'block' }}>
                  <span className="hero-h1-line hero-h1-accent" style={{ display: 'block' }}>el sistema.</span>
                </span>
              </h1>

              <p className="hero-sub">
                Para entrenadores personales en España que gestionan su negocio
                desde el grupo de WhatsApp. Clientes, rutinas, progreso y cobros.
                En un solo sitio.
              </p>

              <div className="hero-form-wrap" id="hero-form">
                <div className="hero-form-cinematic">
                  <div className="hero-form-border-outline" aria-hidden="true" />
                  <WaitlistForm />
                </div>
                <p className="hero-note">Sin tarjeta · Sin contrato · Aviso antes del lanzamiento</p>
              </div>
            </div>

            <div className="hero-right" aria-hidden="true">
              <DashboardMockup />
            </div>
          </section>

          {/* ──────────────────────────────────────────────
              MARQUEE — stats reales
              ────────────────────────────────────────── */}
          <div className="stats-marquee" aria-hidden="true">
            <div className="stats-marquee-track">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <div key={i} className="stats-item">
                  <span className="stats-item-val">{item.val}</span>
                  <span className="stats-item-sep" />
                  <span className="stats-item-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ──────────────────────────────────────────────
              01 — FEATURE SCROLL — horizontal pin
              ────────────────────────────────────────── */}
          <FeatureScroll />

          {/* ──────────────────────────────────────────────
              02 — PAIN — las tres mentiras
              ────────────────────────────────────────── */}
          <section className="pain-section" id="problema" aria-labelledby="pain-heading">
            <div className="lp-container" style={{ padding: 'var(--gap-3xl) clamp(20px, 5vw, 60px)' }}>
              <span className="section-num">02 — El problema</span>
              <h2 id="pain-heading" className="section-h2">
                Tres herramientas<br />
                <span className="section-h2-em">que no fueron diseñadas para ti.</span>
              </h2>
              <div className="pain-list">
                {PAIN_ITEMS.map((p, i) => (
                  <div key={i} className="pain-item">
                    <p className="pain-bad">{p.bad}</p>
                    <p className="pain-good">
                      <span className="pain-arrow" aria-hidden="true">→</span>
                      {p.good}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────
              03 — MODULE SELECTOR
              ────────────────────────────────────────── */}
          <section id="sistema" aria-label="El sistema TrainerBoost">
            <ModuleSelector />
          </section>

          {/* ──────────────────────────────────────────────
              04 — VENTAJA
              ────────────────────────────────────────── */}
          <section className="ventaja-section" aria-labelledby="ventaja-heading">
            <div className="lp-container" style={{ padding: 'var(--gap-3xl) clamp(20px, 5vw, 60px)' }}>
              <span className="section-num">04 — Por qué TrainerBoost</span>
              <h2 id="ventaja-heading" className="section-h2">
                Sin comisiones. Sin apps.<br />
                <span className="section-h2-em">Sin aprender otro software.</span>
              </h2>
              <div className="ventaja-grid">
                {VENTAJA_CELLS.map((v, i) => (
                  <div key={i} className="ventaja-cell">
                    <span className="ventaja-cell-label">{v.label}</span>
                    <p className="ventaja-cell-text">{v.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────
              05 — PRICING
              ────────────────────────────────────────── */}
          <section className="pricing-section" id="precios" aria-labelledby="pricing-heading">
            <div className="lp-container" style={{ padding: 'var(--gap-3xl) clamp(20px, 5vw, 60px)' }}>
              <span className="section-num">05 — Precios</span>
              <h2 id="pricing-heading" className="section-h2">
                Sin sorpresas.<br />
                <span className="section-h2-em">Sin letras pequeñas.</span>
              </h2>
              <p style={{
                color: 'var(--text-dim)',
                fontSize: '13px',
                marginTop: '12px',
                fontFamily: 'var(--mono)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '0',
              }}>
                Precios de acceso anticipado — para los que llegan primero.
              </p>
              <div className="pricing-cards">
                <div className="pricing-card">
                  <span className="pricing-plan">Gratuito</span>
                  <p className="pricing-price">0<span>€</span></p>
                  <span className="pricing-period">Para empezar · Sin tarjeta</span>
                  <p className="pricing-desc">
                    Para entrenadores que quieren ver si esto funciona para ellos antes de comprometerse.
                  </p>
                  <ul className="pricing-items">
                    <li className="pricing-item">Hasta 5 clientes</li>
                    <li className="pricing-item">Fichas y seguimiento básico</li>
                    <li className="pricing-item">Rutinas simples</li>
                  </ul>
                  <button
                    className="pricing-cta pricing-cta--outline"
                    onClick={() => document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Unirme a la lista
                  </button>
                </div>

                <div className="pricing-card pricing-card--featured">
                  <span className="pricing-plan">Pro</span>
                  <p className="pricing-price">19<span>€/mes</span></p>
                  <span className="pricing-period">Para crecer · Sin comisiones</span>
                  <p className="pricing-desc">
                    Para entrenadores que ya tienen clientes y quieren gestionar su negocio en serio.
                  </p>
                  <ul className="pricing-items">
                    <li className="pricing-item">Clientes ilimitados</li>
                    <li className="pricing-item">Cobros integrados con Stripe</li>
                    <li className="pricing-item">Seguimiento y rutinas avanzados</li>
                    <li className="pricing-item">0% de comisión sobre tus cobros</li>
                  </ul>
                  <button
                    className="pricing-cta pricing-cta--fill"
                    onClick={() => document.getElementById('cta-form')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Acceso anticipado
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────
              06 — FAQ
              ────────────────────────────────────────── */}
          <section className="faq-section" id="faq" aria-labelledby="faq-heading">
            <div className="lp-container" style={{ padding: 'var(--gap-3xl) clamp(20px, 5vw, 60px)' }}>
              <div className="faq-layout">
                <div>
                  <span className="section-num">06 — FAQ</span>
                  <h2 id="faq-heading" className="faq-h2">
                    Preguntas
                    <span className="faq-h2-em">reales.</span>
                  </h2>
                </div>
                <Accordion items={FAQ_ITEMS} />
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────
              07 — CTA FINAL
              ────────────────────────────────────────── */}
          <section className="cta-section" id="cta-form" aria-labelledby="cta-heading">
            <div className="cta-glow" aria-hidden="true" />
            <div
              className="lp-container"
              style={{ position: 'relative', zIndex: 1, padding: 'var(--gap-3xl) clamp(20px, 5vw, 60px)' }}
            >
              <span className="cta-eyebrow">Lista de espera · Acceso limitado</span>
              <h2 id="cta-heading" className="cta-h2">
                <span className="cta-h2-line">Si llevas más de 6 meses</span>
                <span className="cta-h2-em">en WhatsApp,</span>
                <span
                  className="cta-h2-line"
                  style={{ fontSize: '0.65em', color: 'var(--text-dim)', display: 'block' }}
                >
                  ya sabes lo que te está costando.
                </span>
              </h2>
              <p className="cta-sub">
                Únete a la lista. Cuando lancemos, eres el primero.
                Sin spam. Solo el aviso cuando abramos.
              </p>
              <div className="cta-form-cinematic">
                <div className="cta-form-border-outline" aria-hidden="true" />
                <WaitlistForm className="cta-form-wrap" />
              </div>
            </div>
          </section>

          {/* ──────────────────────────────────────────────
              FOOTER
              ────────────────────────────────────────── */}
          <footer className="lp-footer" aria-label="Pie de página">
            <div
              className="lp-container lp-footer-inner"
              style={{ padding: '0 clamp(20px, 5vw, 60px)' }}
            >
              <LogoFull height={28} />
              <nav className="lp-footer-links" aria-label="Páginas legales">
                <a href="/privacidad" className="lp-footer-link">Privacidad</a>
                <a href="/terminos"   className="lp-footer-link">Términos</a>
                <a href="/cookies"    className="lp-footer-link">Cookies</a>
              </nav>
              <p className="lp-footer-copy">&copy; 2026 TrainerBoost &middot; España</p>
            </div>
          </footer>

        </main>

        <StickyBar />
      </div>
    </>
  )
}
