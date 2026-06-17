'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import LogoFull from '@/components/logo/LogoFull'
import StatsBar from '@/components/landing/StatsBar'
import './styles/landing.css'

const WaitlistForm = dynamic(() => import('@/components/landing/WaitlistForm'), { ssr: false })
const RGPDConsent = dynamic(() => import('@/components/landing/RGPDConsent'), { ssr: false })

// ─── Custom SVG icons — no Lucide/Heroicons ───────────────────────────────────

function IconBolt() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M11.5 2L5 11h6l-1.5 7 9-10h-6.5L11.5 2Z" stroke="#8FD43A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPercent() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="2.25" stroke="#8FD43A" strokeWidth="1.75" />
      <circle cx="14" cy="14" r="2.25" stroke="#8FD43A" strokeWidth="1.75" />
      <path d="M16 4L4 16" stroke="#8FD43A" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2L3 5v5c0 4 3.5 7 7 8 3.5-1 7-4 7-8V5L10 2Z" stroke="#8FD43A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10l2 2 4-4" stroke="#8FD43A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8" cy="7" r="3" stroke="#8FD43A" strokeWidth="1.75" />
      <path d="M2 17c0-3 2.7-5 6-5s6 2 6 5" stroke="#8FD43A" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M14 5c1.7 0 3 1.3 3 3s-1.3 3-3 3" stroke="#8FD43A" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M17 17c0-2.2-1.2-4-3-4.7" stroke="#8FD43A" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 5" stroke="#8FD43A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Achievement cards data ───────────────────────────────────────────────────

const ACHIEVEMENTS = [
  {
    icon: <IconPercent />,
    label: 'Fundador',
    title: '40% descuento vitalicio',
    desc: 'El precio que fijes hoy se congela para siempre. Sin revisiones anuales, sin sorpresas.',
  },
  {
    icon: <IconBolt />,
    label: 'Beta privada',
    title: 'Acceso antes que nadie',
    desc: 'Entra a la plataforma semanas antes del lanzamiento público. Tú moldeas el producto.',
  },
  {
    icon: <IconShield />,
    label: 'Sin fee',
    title: 'Cobros sin comisiones',
    desc: 'Cobros directos a tus clientes vía Stripe. El 100% del pago es tuyo. Siempre.',
  },
  {
    icon: <IconUsers />,
    label: 'Soporte',
    title: 'Canal directo al equipo',
    desc: 'Grupo privado con los fundadores. Tu feedback va directo al roadmap del producto.',
  },
] as const

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: '¿Cuándo abre el acceso?',
    a: 'Estamos en fase final de desarrollo. Los primeros 100 entrenadores en lista serán los primeros en recibir acceso, con varias semanas de antelación al lanzamiento público.',
  },
  {
    q: '¿Cuánto costará TrainerBoost?',
    a: 'El plan de lanzamiento parte de 19€/mes para hasta 10 clientes. Los miembros fundadores obtienen un 40% de descuento permanente bloqueado en el momento de unirse.',
  },
  {
    q: '¿Necesito dar mis datos de pago para apuntarme?',
    a: 'No. La lista de espera es solo tu email. Sin tarjeta, sin compromiso. Solo te avisamos cuando tu plaza esté disponible.',
  },
]

// ─── FaqItem ──────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        className="w-full flex items-center justify-between gap-4 py-5 text-sm font-medium text-fg-primary hover:text-fg-secondary transition-colors text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-300 text-fg-disabled ${open ? 'rotate-180' : ''}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="pb-5 text-sm text-fg-muted leading-relaxed">
          {a}
        </div>
      )}
    </div>
  )
}

// ─── LandingPage ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  useEffect(() => {
    import('@/lib/gsap/config').then(({ getGSAP }) =>
      getGSAP().then(({ gsap }) => {
        const ctx = gsap.context(() => {
          // Hero entrance
          gsap.fromTo('.hero-headline', { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.15 })
          gsap.fromTo('.hero-sub', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.35 })
          gsap.fromTo('.hero-form', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.5 })

          // Scroll fade-up
          gsap.utils.toArray<HTMLElement>('.gsap-fade-up').forEach((el) => {
            gsap.fromTo(
              el,
              { opacity: 0, y: 28 },
              {
                opacity: 1,
                y: 0,
                duration: 0.65,
                ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 90%', once: true },
              }
            )
          })

          // Bento cards stagger
          gsap.fromTo(
            '.achievement-card',
            { opacity: 0, scale: 0.94 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.5,
              ease: 'back.out(1.3)',
              stagger: 0.09,
              scrollTrigger: { trigger: '.achievement-grid', start: 'top 88%', once: true },
            }
          )
        })

        return () => ctx.revert()
      })
    )
  }, [])

  return (
    <div className="min-h-screen bg-background text-fg-primary overflow-x-hidden">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <LogoFull height={22} />
          <Link
            href="/login"
            className="text-xs font-medium text-fg-muted hover:text-fg-primary transition-colors py-2 px-3"
          >
            Ya tengo cuenta →
          </Link>
        </div>
      </nav>

      <main id="main-content">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="max-w-2xl">

            {/* Access tag */}
            <div className="hero-tag mb-8">
              <span className="hero-tag__dot" />
              ACCESO ANTICIPADO · 100 PLAZAS
            </div>

            {/* H1 */}
            <h1
              className="hero-headline font-display text-[clamp(3rem,8vw,5.5rem)] font-extrabold leading-[0.95] tracking-tight uppercase text-fg-primary mb-6"
              style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)', opacity: 0 }}
            >
              Sube de nivel<br />
              <span style={{ color: '#8FD43A' }}>tu negocio</span>
            </h1>

            {/* Sub */}
            <p
              className="hero-sub text-base md:text-lg text-fg-muted mb-8 max-w-lg leading-relaxed"
              style={{ opacity: 0 }}
            >
              La plataforma de gestión para entrenadores personales que quieren escalar.
              Clientes, rutinas, cobros y análisis. En español. En beta privada.
            </p>

            {/* Form */}
            <div className="hero-form" style={{ opacity: 0 }}>
              <WaitlistForm />
            </div>
          </div>
        </section>

        {/* ── Stats bar ──────────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <StatsBar />
        </section>

        {/* ── Achievement bento ─────────────────────────────────────────── */}
        <section className="border-t border-border/40 py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="mb-12 gsap-fade-up">
              <p
                className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-3"
                style={{ fontFamily: 'var(--font-mono)', color: '#8FD43A' }}
              >
                Lo que desbloqueas como fundador
              </p>
              <h2
                className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-tight tracking-tight uppercase text-fg-primary"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                Perks exclusivos de beta
              </h2>
            </div>

            <div className="achievement-grid">
              {ACHIEVEMENTS.map(({ icon, label, title, desc }) => (
                <div key={title} className="achievement-card">
                  <div className="achievement-card__icon">
                    {icon}
                  </div>
                  <div>
                    <p className="achievement-card__label">{label}</p>
                    <h3 className="achievement-card__title">{title}</h3>
                  </div>
                  <p className="achievement-card__desc">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social proof — minimal, no stars ──────────────────────────── */}
        <section className="border-t border-border/40 py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="max-w-xl gsap-fade-up">
              <p
                className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-6"
                style={{ fontFamily: 'var(--font-mono)', color: '#8FD43A' }}
              >
                Por qué los entrenadores lo necesitan
              </p>
              <ul className="space-y-4">
                {[
                  'Gestionar 15+ clientes con WhatsApp es un trabajo a tiempo completo',
                  'Ninguna herramienta en el mercado está hecha para entrenadores en español',
                  'Los cobros por Bizum y PDF son el principal freno para escalar',
                  'El cliente que ve su progreso en tiempo real renueva 3x más',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-fg-secondary leading-relaxed">
                    <span className="mt-0.5 shrink-0">
                      <IconCheck />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────────── */}
        <section className="border-t border-border/40 py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-[280px_1fr] gap-12 md:gap-20">
              <div className="gsap-fade-up">
                <p
                  className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-3"
                  style={{ fontFamily: 'var(--font-mono)', color: '#8FD43A' }}
                >
                  Preguntas
                </p>
                <h2
                  className="text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold leading-tight tracking-tight uppercase text-fg-primary"
                  style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
                >
                  Antes de apuntarte
                </h2>
              </div>
              <div className="gsap-fade-up">
                {FAQS.map((faq) => (
                  <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA final ──────────────────────────────────────────────────── */}
        <section className="border-t border-border/40 py-20">
          <div className="max-w-5xl mx-auto px-6 gsap-fade-up">
            <div className="max-w-xl">
              <h2
                className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[0.95] tracking-tight uppercase text-fg-primary mb-6"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                Quedan <span style={{ color: '#8FD43A' }}>pocas plazas.</span><br />No vuelvas más tarde.
              </h2>
              <p className="text-sm text-fg-muted mb-8">
                El precio de fundador y los perks desaparecen cuando se cubran las 100 plazas.
              </p>
              <WaitlistForm />
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <LogoFull height={20} />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-fg-disabled justify-center" aria-label="Footer">
            <Link href="/pricing" className="hover:text-fg-secondary transition-colors">Precios</Link>
            <Link href="/demo/trainer" className="hover:text-fg-secondary transition-colors">Demo</Link>
            <Link href="/login" className="hover:text-fg-secondary transition-colors">Acceso</Link>
            <Link href="/privacy" className="hover:text-fg-secondary transition-colors">Privacidad</Link>
            <Link href="/terms" className="hover:text-fg-secondary transition-colors">Términos</Link>
            <Link href="/contact" className="hover:text-fg-secondary transition-colors">Contacto</Link>
          </nav>
          <p className="text-xs text-fg-disabled text-center md:text-right">
            © 2026 TrainerBoost · España
          </p>
        </div>
      </footer>

      <RGPDConsent />

    </div>
  )
}
