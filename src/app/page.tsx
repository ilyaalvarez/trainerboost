'use client'
import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { BootLoader } from '@/components/landing/BootLoader'
import { GymLights } from '@/components/landing/GymLights'
import { ClientCard } from '@/components/landing/ClientCard'
import { FichasScroll } from '@/components/landing/FichasScroll'
import { ProfileSelector } from '@/components/landing/ProfileSelector'
import { TextReveal } from '@/components/ui/TextReveal'
import { Accordion } from '@/components/ui/Accordion'
import WaitlistForm from '@/components/landing/WaitlistForm'
import LogoFull from '@/components/logo/LogoFull'
import LogoIcon from '@/components/logo/LogoIcon'
import { CLIENTS, HERO_CLIENT } from '@/components/landing/clientData'
import './styles/landing.css'

const PAIN_ITEMS = [
  {
    bad: 'Planes de entrenamiento en PDF por WhatsApp',
    good: 'Rutinas digitales que el cliente ve desde su móvil',
  },
  {
    bad: 'Cobros manuales y recordatorios incómodos',
    good: 'Stripe integrado — el cobro llega solo, sin perseguir',
  },
  {
    bad: 'Clientes que abandonan porque no ven su progreso',
    good: 'Gráficas automáticas que los mantienen comprometidos',
  },
]

const FAQ_ITEMS = [
  {
    q: '¿Cuándo estará disponible?',
    a: 'Estamos en beta privada con entrenadores seleccionados. El lanzamiento público está previsto para más adelante en 2026. Únete a la lista para tener acceso antes que nadie.',
  },
  {
    q: '¿Tengo que instalar alguna app?',
    a: 'No. TrainerBoost funciona desde el navegador, en cualquier dispositivo.',
  },
  {
    q: '¿Mis clientes necesitan descargarse algo?',
    a: 'Tampoco. Tus clientes acceden a su área desde el móvil o la tablet directamente, sin descargar nada.',
  },
  {
    q: '¿Qué pasa con mis datos si cancelo?',
    a: 'Son tuyos. Puedes exportar clientes, historial y rutinas en cualquier momento, en formatos estándar.',
  },
  {
    q: '¿Funciona para entrenadores con muchos clientes?',
    a: 'Sí. Desde 5 hasta más de 100 clientes sin cambiar de herramienta. La plataforma escala contigo.',
  },
  {
    q: '¿En qué se diferencia de una app genérica de fitness?',
    a: 'Las apps de fitness están pensadas para el cliente final. TrainerBoost está pensado para ti: para gestionar tu negocio, hacer seguimiento y cobrar. Sin ruido extra.',
  },
]

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
      dot.style.opacity = ring.style.opacity = '1'
      const isLink = !!(e.target as HTMLElement).closest('a, button, [role="button"], input')
      dot.classList.toggle('cursor-dot--hover', isLink)
      ring.classList.toggle('cursor-ring--hover', isLink)
    }
    document.addEventListener('mousemove', onMove)
    let raf: number
    const tick = () => {
      rx += (mx - rx) * 0.11; ry += (my - ry) * 0.11
      gsap.set(ring, { x: rx, y: ry })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  )
}

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

export default function LandingPage() {
  const [booted, setBooted] = useState(false)
  const heroCardRef = useRef<HTMLDivElement>(null)
  const landingRef  = useRef<HTMLDivElement>(null)

  // Hero entrance after boot
  useEffect(() => {
    if (!booted) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('.hero-badge',     { opacity: 0, y: 16, duration: 0.6 }, 0.1)
        .from('.hero-h1',        { opacity: 0, y: 32, duration: 0.8 }, 0.2)
        .from('.hero-sub',       { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
        .from('.hero-waitlist-inline', { opacity: 0, y: 16, duration: 0.5 }, '-=0.3')
        .from('.hero-card-wrap', { opacity: 0, y: 60, scale: 0.92, duration: 1.0 }, 0.3)
    }, landingRef)

    // Float animation outside ctx — evita warning "rotateX/Y not eligible for reset"
    // cuando ctx.revert() corre mientras el parallax tiene rotateX/Y activos
    const floatTween = heroCardRef.current
      ? gsap.to(heroCardRef.current, { y: 12, repeat: -1, yoyo: true, duration: 4, ease: 'sine.inOut' })
      : null

    return () => { ctx.revert(); floatTween?.kill() }
  }, [booted])

  // Mouse parallax on hero card
  useEffect(() => {
    if (!booted) return
    const card = heroCardRef.current
    if (!card) return
    const quickX = gsap.quickTo(card, 'rotateY', { duration: 0.6, ease: 'power3.out' })
    const quickY = gsap.quickTo(card, 'rotateX', { duration: 0.6, ease: 'power3.out' })
    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      quickX((e.clientX - (rect.left + rect.width  / 2)) / rect.width  *  12)
      quickY((e.clientY - (rect.top  + rect.height / 2)) / rect.height * -8)
    }
    const onLeave = () => { quickX(0); quickY(0) }
    window.addEventListener('mousemove', onMove)
    card.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      card.removeEventListener('mouseleave', onLeave)
      gsap.killTweensOf(card)
    }
  }, [booted])

  // Pain section scroll reveals
  useEffect(() => {
    if (!booted) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.pain-item').forEach((item) => {
        gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 84%', once: true } })
          .from(item.querySelector('.pain-bad'),  { opacity: 0, x: -16, duration: 0.5, ease: 'expo.out' })
          .from(item.querySelector('.pain-good'), { opacity: 0, x: -16, duration: 0.5, ease: 'expo.out' }, '-=0.2')
      })
    }, landingRef)
    return () => ctx.revert()
  }, [booted])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {!booted && <BootLoader onComplete={() => setBooted(true)} />}

      <div
        ref={landingRef}
        className="landing-root"
        style={{ opacity: booted ? 1 : 0, transition: 'opacity 0.4s ease' }}
      >
        <DualCursor />
        <ScrollProgressBar />

        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <nav className="lp-nav-v2" aria-label="Navegación principal">
          <button
            className="lp-nav-v2-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Ir al inicio"
          >
            <LogoIcon size={24} />
          </button>
          <div className="lp-nav-v2-anchors">
            <a href="#sistema" className="lp-nav-v2-anchor">Cómo funciona</a>
            <a href="#faq"     className="lp-nav-v2-anchor">FAQ</a>
          </div>
          <button
            className="lp-nav-v2-cta"
            onClick={() => scrollTo('cta-final')}
          >
            Lista de espera
          </button>
        </nav>

        <main id="main-content">

          {/* ── S1: Hero ──────────────────────────────────────────────────── */}
          <section className="hero-section" aria-labelledby="hero-heading">
            <GymLights />

            <div className="hero-left" style={{ position: 'relative', zIndex: 1 }}>
              <h1 id="hero-heading" className="hero-h1">
                Gestiona tus clientes<br />como un profesional
              </h1>

              <p className="hero-sub">
                Clientes organizados. Seguimiento automático.<br />
                Cobros sin perseguir a nadie. Todo en un sitio.
              </p>

              <div className="hero-waitlist-inline">
                <WaitlistForm />
                <p className="hero-waitlist-hint">
                  Sin compromiso &middot; Te avisamos antes del lanzamiento
                </p>
              </div>
            </div>

            <div className="hero-right" style={{ position: 'relative', zIndex: 1 }}>
              <div className="hero-card-wrap">
                <div ref={heroCardRef} className="hero-card-inner">
                  <div className="hero-card-glow" aria-hidden="true" />
                  <ClientCard client={HERO_CLIENT} animateMode="none" />
                </div>
              </div>
            </div>
          </section>

          {/* ── S2: Fichas Scroll ─────────────────────────────────────────── */}
          <div id="fichas">
            <FichasScroll />
          </div>

          {/* ── S3: Problema ──────────────────────────────────────────────── */}
          <section className="pain-section" aria-label="El problema">
            <TextReveal
              as="h2"
              className="pain-section-title"
            >
              {"Sin TrainerBoost, así\nes el día de un\nEntrenador Personal"}
            </TextReveal>

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

            <TextReveal
              as="h2"
              className="pain-close-title"
              delay={0.1}
            >
              {"Todo lo que necesitas\npara gestionar mejor\ny cobrar a tiempo."}
            </TextReveal>
          </section>

          {/* ── S4: Profile Selector ──────────────────────────────────────── */}
          <ProfileSelector />

          {/* ── S5: FAQ ───────────────────────────────────────────────────── */}
          <section className="faq-section" id="faq" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="faq-section-title">
              Preguntas frecuentes<br />de Entrenadores Personales
            </h2>
            <div className="faq-inner">
              <Accordion items={FAQ_ITEMS} />
            </div>
          </section>

          {/* ── S6: CTA Final ─────────────────────────────────────────────── */}
          <section
            className="cta-final-section"
            id="cta-final"
            aria-labelledby="cta-final-heading"
          >
            <div className="cta-final-card-bg" aria-hidden="true">
              <ClientCard
                client={CLIENTS[3]}
                animateMode="none"
                style={{ opacity: 0.12, transform: 'rotate(6deg)' }}
              />
            </div>

            <div className="cta-final-content">
              <h2 id="cta-final-heading" className="cta-final-h2">
                Empieza hoy.
              </h2>
              <p className="cta-final-sub">
                Apúntate. Te avisamos antes del lanzamiento.
              </p>
              <WaitlistForm />
            </div>
          </section>

        </main>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="lp-footer-v2" aria-label="Pie de página">
          <LogoFull height={24} />
          <nav className="lp-footer-v2-links" aria-label="Páginas legales">
            <a href="/privacidad"   className="lp-footer-v2-link">Privacidad</a>
            <a href="/terminos"     className="lp-footer-v2-link">Términos</a>
            <a href="/cookies"      className="lp-footer-v2-link">Cookies</a>
            <a href="/aviso-legal"  className="lp-footer-v2-link">Aviso Legal</a>
          </nav>
          <p className="lp-footer-v2-copy">&copy; 2026 TrainerBoost &middot; España</p>
        </footer>

      </div>
    </>
  )
}
