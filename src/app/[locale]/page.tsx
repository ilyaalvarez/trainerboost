'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import gsap from 'gsap'
import { BootLoader } from '@/components/landing/BootLoader'
import { GymLights } from '@/components/landing/GymLights'
import { ClientCard } from '@/components/landing/ClientCard'
import { FichasScroll } from '@/components/landing/FichasScroll'
import { ProfileSelector } from '@/components/landing/ProfileSelector'
import { TextReveal } from '@/components/ui/TextReveal'
import { Accordion } from '@/components/ui/Accordion'
import WaitlistForm from '@/components/landing/WaitlistForm'
import { LanguageSelector } from '@/components/landing/LanguageSelector'
import LogoFull from '@/components/logo/LogoFull'
import LogoIcon from '@/components/logo/LogoIcon'
import { CLIENTS, HERO_CLIENT } from '@/components/landing/clientData'
import { es } from '@/messages/es'
import { en } from '@/messages/en'
import type { Locale } from '@/messages/types'
import '../styles/landing.css'

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

export default function LocaleLandingPage() {
  const params = useParams()
  const locale = (params?.locale as Locale) === 'en' ? 'en' : 'es'
  const t = locale === 'en' ? en : es

  const [booted, setBooted] = useState(false)
  const heroCardRef      = useRef<HTMLDivElement>(null)
  const landingRef       = useRef<HTMLDivElement>(null)
  const skipHeroEntrance = useRef(false)

  useEffect(() => {
    skipHeroEntrance.current = !sessionStorage.getItem('tb-booted')
  }, [])

  useEffect(() => {
    if (!booted) return
    const ctx = gsap.context(() => {
      if (!skipHeroEntrance.current) {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
        tl.from('.hero-h1',             { opacity: 0, y: 32, duration: 0.8 }, 0.2)
          .from('.hero-sub',            { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
          .from('.hero-waitlist-inline', { opacity: 0, y: 16, duration: 0.5 }, '-=0.3')
          .from('.hero-card-wrap',      { opacity: 0, y: 60, scale: 0.92, duration: 1.0 }, 0.3)
      }
    }, landingRef)

    const floatTween = heroCardRef.current
      ? gsap.to(heroCardRef.current, { y: 12, repeat: -1, yoyo: true, duration: 4, ease: 'sine.inOut' })
      : null

    return () => { ctx.revert(); floatTween?.kill() }
  }, [booted])

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
      gsap.set(card, { clearProps: 'rotateX,rotateY' })
    }
  }, [booted])

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

      <div ref={landingRef} className="landing-root">
        <DualCursor />
        <ScrollProgressBar />

        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <nav className="lp-nav-v2" aria-label={t.nav.ariaLabel}>
          <button
            className="lp-nav-v2-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label={t.nav.goToTop}
          >
            <LogoIcon size={24} />
          </button>
          <div className="lp-nav-v2-anchors">
            <a href="#sistema" className="lp-nav-v2-anchor">{t.nav.howItWorks}</a>
            <a href="#faq"     className="lp-nav-v2-anchor">{t.nav.faq}</a>
          </div>
          <button className="lp-nav-v2-cta" onClick={() => scrollTo('cta-final')}>
            {t.nav.waitlist}
          </button>
          <LanguageSelector locale={locale} />
        </nav>

        <main id="main-content" aria-label={t.a11y.mainContent}>

          {/* ── S1: Hero ──────────────────────────────────────────────────── */}
          <section className="hero-section" aria-labelledby="hero-heading">
            <GymLights />

            <div className="hero-left" style={{ position: 'relative', zIndex: 1 }}>
              <h1 id="hero-heading" className="hero-h1">
                {t.hero.h1.split('\n').map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))}
              </h1>

              <p className="hero-sub">
                {t.hero.sub.split('\n').map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))}
              </p>

              <div className="hero-waitlist-inline">
                <WaitlistForm locale={locale} />
                <p className="hero-waitlist-hint">{t.hero.hint}</p>
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
          <section className="pain-section" aria-label={t.a11y.painLabel}>
            <TextReveal as="h2" className="pain-section-title">
              {t.pain.sectionTitle}
            </TextReveal>

            <div className="pain-list">
              {t.pain.items.map((p, i) => (
                <div key={i} className="pain-item">
                  <p className="pain-bad">{p.bad}</p>
                  <p className="pain-good">
                    <span className="pain-arrow" aria-hidden="true">→</span>
                    {p.good}
                  </p>
                </div>
              ))}
            </div>

            <TextReveal as="h2" className="pain-close-title" delay={0.1}>
              {t.pain.closeTitle}
            </TextReveal>
          </section>

          {/* ── S4: Profile Selector ──────────────────────────────────────── */}
          <ProfileSelector />

          {/* ── S5: FAQ ───────────────────────────────────────────────────── */}
          <section className="faq-section" id="faq" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="faq-section-title">
              {t.faq.sectionTitle.split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h2>
            <div className="faq-inner">
              <Accordion items={t.faq.items} />
            </div>
          </section>

          {/* ── S6: CTA Final ─────────────────────────────────────────────── */}
          <section
            className="cta-final-section"
            id="cta-final"
            aria-label={t.a11y.ctaLabel}
          >
            <div className="cta-final-card-bg" aria-hidden="true">
              <ClientCard
                client={CLIENTS[3]}
                animateMode="none"
                style={{ opacity: 0.12, transform: 'rotate(6deg)' }}
              />
            </div>

            <div className="cta-final-content">
              <h2 className="cta-final-h2">{t.cta.h2}</h2>
              <p className="cta-final-sub">{t.cta.sub}</p>
              <WaitlistForm locale={locale} />
            </div>
          </section>

        </main>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="lp-footer-v2" aria-label={t.footer.ariaLabel}>
          <LogoFull height={24} />
          <nav className="lp-footer-v2-links" aria-label={t.footer.legalLinks}>
            <a href="/privacidad"  className="lp-footer-v2-link">Privacidad</a>
            <a href="/terminos"    className="lp-footer-v2-link">Términos</a>
            <a href="/cookies"     className="lp-footer-v2-link">Cookies</a>
            <a href="/aviso-legal" className="lp-footer-v2-link">Aviso Legal</a>
          </nav>
          <p className="lp-footer-v2-copy">{t.footer.copy}</p>
        </footer>

      </div>
    </>
  )
}
