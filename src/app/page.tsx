'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Zap, Users, Dumbbell, UtensilsCrossed, CalendarDays,
  MessageSquare, ArrowRight, TrendingUp, CheckCircle2,
  Shield, BarChart3, ChevronRight, Smartphone, X,
} from 'lucide-react'
import { PLAN_CONFIG } from '@/lib/plans'
import './styles/landing.css'

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRICING_TIERS = [
  { key: 'starter'   as const, highlight: false },
  { key: 'pro'       as const, highlight: true  },
  { key: 'unlimited' as const, highlight: false },
]

const FAQS = [
  {
    q: '¿Necesito tarjeta de crédito para empezar?',
    a: 'No. Puedes registrarte gratis y gestionar hasta 3 clientes sin introducir ningún dato de pago. Solo pagas cuando decides crecer.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. Cancelas desde tu panel en un clic y mantienes el acceso hasta el final del periodo ya pagado. Sin permanencia ni penalizaciones.',
  },
  {
    q: '¿Mis datos y los de mis clientes están seguros?',
    a: 'Totalmente. Ciframos la información, alojamos los datos en servidores europeos y cumplimos el RGPD. Cada entrenador solo accede a sus propios clientes.',
  },
  {
    q: '¿Mis clientes necesitan pagar algo?',
    a: 'No. Tus clientes acceden gratis a su portal (rutinas, nutrición, progreso y mensajes). La suscripción la pagas únicamente tú como entrenador.',
  },
  {
    q: '¿Puedo cambiar de plan más adelante?',
    a: 'Cuando quieras. Subes o bajas de plan desde el portal de facturación y el cambio se aplica al instante, con prorrateo automático.',
  },
]

const FEATURES = [
  {
    icon: Users,
    title: 'Gestión de clientes',
    desc: 'Perfil completo, historial de entrenamiento y seguimiento personalizado de cada cliente.',
  },
  {
    icon: Dumbbell,
    title: 'Rutinas personalizadas',
    desc: 'Crea, asigna y ajusta rutinas con ejercicios, series y notas de coaching.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Planes nutricionales',
    desc: 'Diseña menús con macros, calorías y seguimiento diario desde el móvil.',
  },
  {
    icon: CalendarDays,
    title: 'Gestión de citas',
    desc: 'Agenda presencial, online o videollamada. Recordatorios automáticos incluidos.',
  },
  {
    icon: MessageSquare,
    title: 'Mensajería integrada',
    desc: 'Chat directo con cada cliente. Sin WhatsApp, sin correos sueltos.',
  },
  {
    icon: TrendingUp,
    title: 'Progreso y analytics',
    desc: 'Gráficas de evolución, fotos de progreso y métricas que tus clientes verán.',
  },
]

const PAIN_POINTS = [
  'Capturas de WhatsApp para enviar rutinas',
  'PDFs en email que los clientes no abren',
  'Excel sin sincronización en tiempo real',
  'Bizum y transferencias que nunca llegan a tiempo',
  'Sin visibilidad del progreso del cliente',
]

const SOLUTION_POINTS = [
  'Rutinas asignadas con un clic, visibles al momento',
  'Portal web y móvil que tus clientes abren cada día',
  'Dashboard en tiempo real con todos los datos',
  'Cobro automático con Stripe, sin perseguir a nadie',
  'Gráficas de evolución, fotos y métricas en un lugar',
]

const STEPS = [
  {
    n: '01',
    title: 'Monta tu negocio digital en 10 minutos',
    desc: 'Crea tu cuenta, personaliza tu perfil y añade tus primeros clientes. Sin configuraciones técnicas. Sin tarjeta.',
  },
  {
    n: '02',
    title: 'Tus clientes tienen su portal desde el primer día',
    desc: 'Rutinas, dieta, progreso y mensajes. Todo en su móvil. Sin apps de terceros, sin descargas, sin fricción.',
  },
  {
    n: '03',
    title: 'Tú solo entrenas. TrainerBoost hace el resto.',
    desc: 'Cobros automáticos, recordatorios de cita, seguimiento de progreso. Tu negocio funciona aunque no estés mirando.',
  },
]

const METRICS = [
  {
    value: '< 10 min',
    label: 'Tiempo de onboarding',
    desc: 'De registro a primer cliente activo.',
  },
  {
    value: '0€',
    label: 'Para tus clientes',
    desc: 'Ellos acceden gratis. Tú pagas solo tú.',
  },
  {
    value: '100%',
    label: 'En español nativo',
    desc: 'Sin traducciones raras. Hecho en España.',
  },
  {
    value: '99.9%',
    label: 'Uptime garantizado',
    desc: 'SLA + backups diarios en servidores EU.',
  },
]

const TRUST_BADGES = [
  '🔒 RGPD compliant',
  '🇪🇺 Datos en servidores EU',
  '💬 Soporte en español',
  '⚡ Uptime 99.9%',
  '🔐 SSL + backups diarios',
]

const TRUST = ['Sin tarjeta de crédito', 'Soporte incluido', 'Cancela cuando quieras']

const AVATARS = [
  { initials: 'CM', bg: 'bg-sky-500/15',     text: 'text-sky-300'    },
  { initials: 'SL', bg: 'bg-violet-500/15',  text: 'text-violet-300' },
  { initials: 'JR', bg: 'bg-emerald-500/15', text: 'text-emerald-300'},
  { initials: 'MP', bg: 'bg-amber-500/15',   text: 'text-amber-300'  },
  { initials: 'AR', bg: 'bg-rose-500/15',    text: 'text-rose-300'   },
] as const

// ─── FaqItem — GSAP accordion ─────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  const answerRef = useRef<HTMLDivElement>(null)

  const toggle = () => {
    if (!answerRef.current) return

    // Lazy-load gsap so it's never imported server-side
    import('gsap').then(({ gsap }) => {
      const el = answerRef.current!
      if (!open) {
        gsap.to(el, { height: 'auto', duration: 0.38, ease: 'power2.inOut', overflow: 'visible' })
      } else {
        gsap.to(el, { height: 0, duration: 0.32, ease: 'power2.inOut', overflow: 'hidden' })
      }
    })
    setOpen((v) => !v)
  }

  return (
    <div className="faq-item card p-0 overflow-hidden">
      <button
        className="faq-question w-full flex items-center justify-between gap-4 cursor-pointer px-5 py-4 text-sm font-medium text-fg-primary hover:text-fg-secondary transition-colors text-left"
        onClick={toggle}
        aria-expanded={open}
      >
        {q}
        <ArrowRight
          className={`w-4 h-4 text-fg-disabled shrink-0 transition-transform duration-300 ${open ? 'rotate-90' : ''}`}
        />
      </button>
      <div
        ref={answerRef}
        className="faq-answer"
        style={{ height: 0, overflow: 'hidden' }}
      >
        <div className="px-5 pb-4 text-sm text-fg-muted leading-relaxed border-t border-border/40 pt-3">
          {a}
        </div>
      </div>
    </div>
  )
}

// ─── LandingPage ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  useEffect(() => {
    import('@/lib/gsap-animations').then(
      ({ animateHero, animateDashboardNumbers, initScrollAnimations, initMicroInteractions, cleanupAnimations }) => {
        import('@/lib/gsap').then(({ gsap }) => {
          const ctx = gsap.context(() => {
            animateHero()
            animateDashboardNumbers()
            initScrollAnimations()
            initMicroInteractions()
          })
          return () => {
            ctx.revert()
            cleanupAnimations()
          }
        })
      }
    )
  }, [])

  return (
    <div className="min-h-screen bg-background text-fg-primary overflow-x-hidden">

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="navbar border-b border-border/50 bg-background/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-base tracking-tight text-fg-primary">TrainerBoost</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="#features" className="text-sm text-fg-muted hover:text-fg-primary transition-colors hidden md:block px-3 py-2 rounded-lg hover:bg-surface">
              Funcionalidades
            </Link>
            <Link href="/pricing" className="text-sm text-fg-muted hover:text-fg-primary transition-colors hidden md:block px-3 py-2 rounded-lg hover:bg-surface">
              Precios
            </Link>
            <Link href="/demo" className="text-sm text-fg-muted hover:text-fg-primary transition-colors hidden sm:block px-3 py-2 rounded-lg hover:bg-surface">
              Demo
            </Link>
            <div className="w-px h-4 bg-border mx-2 hidden sm:block" />
            <Link href="/login" className="text-sm text-fg-muted hover:text-fg-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface hidden sm:block">
              Entrar
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4 ml-1" aria-label="Empezar gratis con TrainerBoost">
              Empezar gratis →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">

          {/* Left: copy */}
          <div>
            {/* Badge pill */}
            <div className="hero-badge inline-flex items-center gap-2 mb-7 px-3.5 py-1.5 rounded-full border border-brand-primary/20 bg-brand-primary/6 text-xs text-brand-primary font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
              💬 Nuevo: Mensajería en tiempo real + notificaciones push en todos los planes
            </div>

            {/* H1 */}
            <h1 className="hero-h1 text-[2.8rem] md:text-[3.6rem] font-extrabold text-fg-primary leading-[1.05] mb-3 tracking-tight">
              Escala tu negocio<br />
              de entrenamiento personal.
            </h1>
            <p className="hero-h1-accent text-[2rem] md:text-[2.6rem] font-normal text-brand-primary tracking-tight mb-6 leading-tight">
              Sin contratar a nadie. Sin caos.
            </p>

            {/* Subheadline */}
            <p className="hero-subheadline text-lg text-fg-muted mb-7 leading-relaxed max-w-lg">
              TrainerBoost gestiona tus clientes, rutinas, nutrición y cobros mientras tú entrenas.
              En español. Desde <strong className="text-fg-primary font-semibold">19€/mes</strong>.
            </p>

            {/* Social proof */}
            <div className="flex items-center gap-3 mb-7">
              <div className="flex -space-x-2">
                {AVATARS.map(({ initials, bg, text }, i) => (
                  <div
                    key={initials}
                    className={`hero-avatar relative w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold ${bg} ${text} ${i === AVATARS.length - 1 ? '' : ''}`}
                  >
                    {initials}
                    {i === AVATARS.length - 1 && (
                      <span className="hero-avatar-pulse" />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-xs text-fg-muted">
                Primeros entrenadores ya en beta · <span className="text-brand-primary font-medium">Únete gratis</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-7">
              <Link
                href="/register"
                className="hero-cta-primary btn-primary text-base px-7 py-3"
                aria-label="Probar TrainerBoost 14 días gratis"
              >
                <Zap className="w-4 h-4" /> Probar 14 días gratis
              </Link>
              <Link href="/demo/trainer" className="hero-cta-secondary btn-secondary flex items-center gap-2 py-3 px-6 text-base">
                Ver demo en vivo →
              </Link>
            </div>

            {/* Trust */}
            <div className="hero-trust flex flex-wrap gap-x-5 gap-y-2">
              {TRUST.map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-xs text-fg-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="hero-dashboard relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-card-elevated bg-surface">
              {/* Browser chrome */}
              <div className="bg-surface-2 border-b border-border px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border-bright" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border-bright" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border-bright" />
                </div>
                <div className="flex-1 mx-4 bg-background/60 rounded-md h-5 flex items-center px-2.5">
                  <span className="text-[10px] text-fg-disabled">app.trainerboost.es/dashboard</span>
                </div>
              </div>

              <div className="flex" style={{ height: '380px' }}>
                {/* Sidebar */}
                <div className="w-36 bg-background border-r border-border p-2.5 flex flex-col gap-0.5 shrink-0">
                  <div className="flex items-center gap-1.5 px-2 py-2 mb-2">
                    <div className="w-5 h-5 rounded-md shrink-0 flex items-center justify-center bg-brand-primary">
                      <Zap className="w-3 h-3 text-black" />
                    </div>
                    <span className="text-[9px] font-bold text-fg-primary">TrainerBoost</span>
                  </div>
                  {[
                    { label: 'Panel',     active: true  },
                    { label: 'Clientes',  active: false },
                    { label: 'Rutinas',   active: false },
                    { label: 'Nutrición', active: false },
                    { label: 'Citas',     active: false },
                    { label: 'Mensajes',  active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`text-[9px] px-2 py-1.5 rounded-md flex items-center gap-1.5 ${item.active ? 'text-brand-primary font-semibold bg-brand-primary/8' : 'text-fg-disabled'}`}
                    >
                      <span className={`w-1 h-1 rounded-full shrink-0 ${item.active ? 'bg-brand-primary' : 'bg-border-bright'}`} />
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Main */}
                <div className="flex-1 p-3.5 space-y-2.5 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-fg-primary">Panel principal</div>
                      <div className="text-[9px] text-fg-disabled">Jueves, 29 Mayo 2025</div>
                    </div>
                    <div className="h-5 w-16 rounded-md text-[8px] flex items-center justify-center text-black font-semibold bg-brand-primary">
                      + Añadir
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: 'Clientes activos', cls: 'bg-brand-primary/5 border-brand-primary/15', selector: 'stat-clientes',  val: '24'    },
                      { label: 'Citas hoy',         cls: 'bg-sky-500/5 border-sky-500/15',             selector: 'stat-citas',     val: '6'     },
                      { label: 'Mensajes nuevos',   cls: 'bg-violet-500/5 border-violet-500/15',       selector: 'stat-mensajes',  val: '8'     },
                      { label: 'Este mes',          cls: 'bg-amber-500/5 border-amber-500/15',         selector: 'stat-ingresos',  val: '2.800€'},
                    ].map((s) => (
                      <div key={s.label} className={`rounded-lg border p-2 ${s.cls}`}>
                        <div className="text-[8px] text-fg-disabled mb-0.5">{s.label}</div>
                        <div className={`${s.selector} text-[12px] font-bold text-fg-primary font-mono`}>{s.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Appointments */}
                  <div className="rounded-lg border border-border p-2 bg-surface/50">
                    <div className="text-[8px] font-semibold text-fg-primary mb-1.5 flex items-center justify-between">
                      Próximas citas
                      <span className="text-brand-primary font-normal">Ver todas →</span>
                    </div>
                    {[
                      { time: '09:00', name: 'Ana García',      type: 'Online' },
                      { time: '11:30', name: 'Pedro López',     type: 'Presencial' },
                      { time: '16:00', name: 'María Fernández', type: 'Online' },
                    ].map((a) => (
                      <div key={a.name} className="flex items-center gap-2 py-0.5">
                        <span className="text-[8px] text-fg-disabled font-mono w-8 shrink-0">{a.time}</span>
                        <span className="w-1 h-1 rounded-full shrink-0 bg-border-bright" />
                        <span className="text-[8px] text-fg-secondary flex-1 truncate">{a.name}</span>
                        <span className="text-[7px] text-fg-disabled shrink-0">{a.type}</span>
                      </div>
                    ))}
                  </div>

                  {/* Progress */}
                  <div className="rounded-lg border border-border p-2 bg-surface/50">
                    <div className="text-[8px] font-semibold text-fg-primary mb-2">Progreso semanal</div>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Rutinas completadas', cls: 'progress-rutinas', pct: 75 },
                        { label: 'Planes nutricionales', cls: 'progress-nutri',   pct: 60 },
                        { label: 'Seguimiento activo',  cls: 'progress-seguimiento', pct: 90 },
                      ].map((p) => (
                        <div key={p.label}>
                          <div className="flex justify-between mb-0.5">
                            <span className="text-[7px] text-fg-muted">{p.label}</span>
                            <span className="text-[7px] text-brand-primary font-semibold">{p.pct}%</span>
                          </div>
                          <div className="h-1 bg-border rounded-full overflow-hidden">
                            <div className={`${p.cls} h-full rounded-full bg-brand-primary`} style={{ width: '0%' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none bg-gradient-to-t from-surface to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Sección dolor ─────────────────────────────────────────────────── */}
      <section className="before-after-section max-w-6xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="text-center mb-14 section-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-fg-primary mb-3 tracking-tight">
            Así empieza todo entrenador.
          </h2>
          <p className="text-xl text-brand-primary font-medium">Y así se queda atrapado.</p>
        </div>

        {/* Narrative */}
        <p className="section-fade-up text-fg-muted text-base leading-relaxed max-w-2xl mx-auto text-center mb-14">
          Empiezas con 5 clientes. WhatsApp funciona. Luego son 10, y ya tienes
          3 conversaciones abiertas con rutinas distintas. Con 15 clientes, un lunes
          por la mañana tienes 23 mensajes sin leer, dos PDFs que no saben si llegaron
          y un cliente que dice que no le mandaste la dieta. Con 20 clientes, estás
          perdiendo más tiempo administrando que entrenando.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Before */}
          <div className="card p-6 relative overflow-hidden section-fade-up">
            <div className="absolute top-0 left-0 right-0 h-px bg-red-500/40" />
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-red-400" />
              </div>
              <span className="text-sm font-semibold text-red-400">Antes de TrainerBoost</span>
            </div>
            <ul className="space-y-3">
              {PAIN_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-fg-muted">
                  <div className="w-4 h-4 rounded-full bg-red-500/8 border border-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-2.5 h-2.5 text-red-400" />
                  </div>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="after-panel card p-6 relative overflow-hidden border-brand-primary/20 section-fade-up">
            <div className="absolute top-0 left-0 right-0 h-px bg-brand-primary/50" />
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-brand-primary/8 border border-brand-primary/15 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
              </div>
              <span className="text-sm font-semibold text-brand-primary">Con TrainerBoost</span>
            </div>
            <ul className="space-y-3">
              {SOLUTION_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-fg-secondary">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 3 Pasos ───────────────────────────────────────────────────────── */}
      <section className="steps-section border-t border-border/50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 section-fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-fg-primary mb-4 tracking-tight">
              Empieza en minutos. Nota el cambio en días.
            </h2>
          </div>

          {/* SVG connector (desktop) */}
          <div className="hidden md:block absolute left-0 right-0 pointer-events-none" aria-hidden="true">
            <svg width="100%" height="80" viewBox="0 0 900 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '900px', margin: '0 auto', display: 'block' }}>
              <path
                className="steps-connector-path"
                d="M 150 40 C 250 10, 350 70, 450 40 C 550 10, 650 70, 750 40"
              />
            </svg>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <div key={step.n} className={`step-card-wrapper card p-7 text-center flex flex-col items-center hover:-translate-y-0.5 transition-transform duration-300 section-fade-up ${i === 1 ? 'border-brand-primary/15' : ''}`}>
                <span className="step-number-bg">{step.n}</span>
                <div className="w-12 h-12 rounded-xl bg-brand-primary flex items-center justify-center mx-auto mb-5 font-bold text-lg font-mono relative z-10 text-black">
                  {step.n}
                </div>
                <h3 className="font-semibold text-fg-primary mb-3">{step.title}</h3>
                <p className="text-sm text-fg-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="text-center mb-16 section-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-fg-primary mb-4 tracking-tight">
            Todo lo que necesitas para gestionar y hacer crecer tu negocio
          </h2>
          <p className="text-fg-muted max-w-lg mx-auto">Desde la primera sesión hasta la fidelización a largo plazo.</p>
        </div>

        <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feat) => (
            <div key={feat.title} className="feature-card card p-6 group cursor-default">
              <div className="feature-icon w-9 h-9 rounded-lg bg-brand-primary/8 border border-brand-primary/15 flex items-center justify-center mb-4">
                <feat.icon className="w-4 h-4 text-brand-primary" />
              </div>
              <h3 className="font-semibold text-fg-primary mb-2">{feat.title}</h3>
              <p className="text-sm text-fg-muted leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Portal móvil ──────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="section-fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-fg-primary mb-5 tracking-tight">
                Tus clientes lo llevan en el bolsillo
              </h2>
              <p className="text-fg-muted mb-8 leading-relaxed">
                Cada cliente tiene su propio portal web y móvil. Sin apps adicionales.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  { icon: Dumbbell,        label: 'Rutinas del día con vídeos de ejercicios' },
                  { icon: TrendingUp,      label: 'Historial de progreso y fotos de evolución' },
                  { icon: UtensilsCrossed, label: 'Plan nutricional con macros diarios' },
                  { icon: MessageSquare,   label: 'Chat directo con el entrenador' },
                  { icon: Smartphone,      label: 'Notificaciones push de nuevas rutinas o citas' },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-3 text-sm text-fg-secondary">
                    <item.icon className="w-4 h-4 text-brand-primary shrink-0" />
                    {item.label}
                  </li>
                ))}
              </ul>
              <Link href="/demo/client" className="btn-secondary inline-flex items-center gap-2">
                Ver portal del cliente <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile mockup */}
            <div className="flex justify-center section-fade-up">
              <div className="relative" style={{ width: '260px' }}>
                <div className="rounded-[2rem] overflow-hidden border border-border-bright shadow-card-elevated bg-background">
                  <div className="bg-surface px-5 pt-3 pb-2 flex justify-between items-center">
                    <span className="text-[10px] text-fg-disabled font-medium">9:41</span>
                    <div className="flex gap-1">
                      <span className="text-[10px] text-fg-disabled">▮▮▮▮</span>
                    </div>
                  </div>
                  <div className="px-4 pb-3 border-b border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-[12px] font-bold text-fg-primary">Hola, Ana</div>
                        <div className="text-[9px] text-fg-disabled">Lunes · Día de pecho</div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-brand-primary/15 flex items-center justify-center text-[9px] font-bold text-brand-primary">AG</div>
                    </div>
                    <div className="flex gap-1 overflow-hidden">
                      {['Hoy', 'Rutinas', 'Nutrición', 'Progreso', 'Chat'].map((tab, i) => (
                        <div
                          key={tab}
                          className={`text-[8px] px-2 py-1 rounded-full whitespace-nowrap ${i === 0 ? 'font-semibold bg-brand-primary/10 text-brand-primary' : 'text-fg-disabled'}`}
                        >
                          {tab}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 space-y-2" style={{ minHeight: '320px' }}>
                    <div className="text-[9px] font-semibold text-fg-primary mb-1">Fuerza · Pecho y tríceps</div>
                    {[
                      { name: 'Press banca',      sets: '4×10 · 70kg', done: true  },
                      { name: 'Press inclinado',  sets: '3×10 · 55kg', done: true  },
                      { name: 'Aperturas cable',  sets: '3×15',        done: false },
                      { name: 'Fondos',           sets: '3×12',        done: false },
                      { name: 'Extensión tríceps',sets: '4×15',        done: false },
                    ].map((ex) => (
                      <div
                        key={ex.name}
                        className={`flex items-center gap-2 p-2 rounded-lg border ${ex.done ? 'bg-brand-primary/5 border-brand-primary/15' : 'bg-white/[0.02] border-border'}`}
                      >
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[8px] shrink-0 border ${ex.done ? 'bg-brand-primary/15 border-brand-primary/25 text-brand-primary' : 'bg-transparent border-border-bright text-transparent'}`}>
                          {ex.done ? '✓' : ''}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[8px] truncate ${ex.done ? 'line-through text-fg-disabled' : 'text-fg-secondary'}`}>{ex.name}</div>
                          <div className="text-[7px] text-fg-disabled">{ex.sets}</div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-3 p-2 rounded-lg border border-brand-primary/15 bg-brand-primary/5 flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-brand-primary shrink-0"
                        style={{ background: 'conic-gradient(var(--brand-primary) 40%, rgba(143,212,58,0.1) 40%)' }}
                      >
                        2/5
                      </div>
                      <div>
                        <div className="text-[8px] font-semibold text-fg-primary">40% completado</div>
                        <div className="text-[7px] text-fg-disabled">3 ejercicios más</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Métricas (reemplaza testimonios) ──────────────────────────────── */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14 section-fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-fg-primary mb-4 tracking-tight">
              Construido para que los números hablen.
            </h2>
          </div>

          <div className="metrics-grid grid grid-cols-2 gap-4 mb-8">
            {METRICS.map((m) => (
              <div key={m.label} className="metric-card card p-7">
                <div className="metric-number mb-2">{m.value}</div>
                <div className="text-sm font-semibold text-fg-primary mb-1">{m.label}</div>
                <div className="text-xs text-fg-muted leading-relaxed">{m.desc}</div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="trust-badge-strip section-fade-up">
            {TRUST_BADGES.map((b) => (
              <span key={b}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demos ─────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="text-center mb-14 section-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-fg-primary mb-4 tracking-tight">
            Explora antes de registrarte
          </h2>
          <p className="text-fg-muted max-w-lg mx-auto">Sin cuenta. Sin tarjeta. Sin compromiso.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/demo/trainer" className="demo-card card-hover p-6 group block" style={{ perspective: '800px' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-brand-primary/8 border border-brand-primary/15">
                <Zap className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <div className="font-semibold text-fg-primary">Panel Entrenador</div>
                <div className="text-xs text-fg-muted">Clientes, rutinas, citas y analytics</div>
              </div>
            </div>
            <div className="rounded-xl bg-background border border-border overflow-hidden mb-5">
              <div className="bg-surface-2 px-3 py-2 border-b border-border flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-border-bright" />
                <div className="w-2 h-2 rounded-full bg-border-bright" />
                <div className="w-2 h-2 rounded-full bg-border-bright" />
                <div className="flex-1 mx-3 bg-surface rounded-md h-4 flex items-center justify-center">
                  <span className="text-[9px] text-fg-disabled">app.trainerboost.es/demo/trainer</span>
                </div>
              </div>
              <div className="flex" style={{ height: '130px' }}>
                <div className="w-28 bg-background border-r border-border p-2 space-y-1 shrink-0">
                  {['Panel', 'Clientes', 'Rutinas', 'Nutrición', 'Citas', 'Mensajes'].map((item, i) => (
                    <div key={item} className={`text-[9px] px-2 py-1 rounded ${i === 0 ? 'text-brand-primary font-semibold bg-brand-primary/8' : 'text-fg-disabled'}`}>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="h-10 rounded bg-surface border border-border p-2">
                      <div className="text-[8px] text-fg-disabled">Clientes</div>
                      <div className="text-xs font-bold text-fg-primary font-mono">24</div>
                    </div>
                    <div className="h-10 rounded bg-surface border border-border p-2">
                      <div className="text-[8px] text-fg-disabled">Citas hoy</div>
                      <div className="text-xs font-bold text-fg-primary font-mono">6</div>
                    </div>
                  </div>
                  <div className="h-14 rounded bg-surface border border-border p-2">
                    <div className="text-[8px] text-fg-disabled mb-1">Citas de hoy</div>
                    <div className="text-[9px] text-fg-secondary">09:00 · Ana García</div>
                    <div className="text-[9px] text-fg-secondary">11:30 · Pedro López</div>
                    <div className="text-[9px] text-fg-secondary">16:00 · María Fdez.</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-brand-primary font-medium text-sm group-hover:gap-3 transition-all duration-200">
              Ver panel del entrenador <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link href="/demo/client" className="demo-card card-hover p-6 group block" style={{ perspective: '800px' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-sky-500/8 border border-sky-500/15">
                <Users className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <div className="font-semibold text-fg-primary">Portal Cliente</div>
                <div className="text-xs text-fg-muted">Rutinas, progreso y mensajes</div>
              </div>
            </div>
            <div className="rounded-xl bg-background border border-border overflow-hidden mb-5">
              <div className="bg-surface-2 px-3 py-2 border-b border-border flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-border-bright" />
                <div className="w-2 h-2 rounded-full bg-border-bright" />
                <div className="w-2 h-2 rounded-full bg-border-bright" />
                <div className="flex-1 mx-3 bg-surface rounded-md h-4 flex items-center justify-center">
                  <span className="text-[9px] text-fg-disabled">app.trainerboost.es/demo/client</span>
                </div>
              </div>
              <div className="p-3" style={{ height: '130px' }}>
                <div className="flex gap-2 pb-2 mb-2 border-b border-border overflow-hidden">
                  {['Progreso', 'Mi Rutina', 'Nutrición', 'Citas', 'Mensajes'].map((item, i) => (
                    <div key={item} className={`text-[9px] px-2 py-0.5 rounded whitespace-nowrap ${i === 1 ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'text-fg-disabled'}`}>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="text-[9px] font-semibold text-fg-primary mb-2">Fuerza + Hipertrofia · Hoy</div>
                <div className="space-y-1.5">
                  {[
                    { name: 'Press banca',    sets: '4×10', done: true  },
                    { name: 'Sentadilla',     sets: '4×8',  done: true  },
                    { name: 'Remo con barra', sets: '3×12', done: false },
                    { name: 'Press militar',  sets: '3×10', done: false },
                  ].map((ex) => (
                    <div key={ex.name} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center text-[8px] shrink-0 ${ex.done ? 'bg-brand-primary/15 border-brand-primary/25 text-brand-primary' : 'border-border text-fg-disabled'}`}>
                        {ex.done ? '✓' : ''}
                      </div>
                      <span className={`text-[9px] flex-1 ${ex.done ? 'line-through text-fg-disabled' : 'text-fg-secondary'}`}>{ex.name}</span>
                      <span className="text-[9px] text-fg-disabled">{ex.sets}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sky-400 font-medium text-sm group-hover:gap-3 transition-all duration-200">
              Ver portal del cliente <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section id="precios" className="max-w-6xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="text-center mb-14 section-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-fg-primary mb-4 tracking-tight">
            Precios simples. Sin letra pequeña.
          </h2>
          <p className="text-fg-muted max-w-lg mx-auto">
            Empieza gratis con 3 clientes. Crece cuando lo necesites.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 items-stretch">
          {PRICING_TIERS.map(({ key, highlight }) => {
            const plan = PLAN_CONFIG[key]
            return (
              <div
                key={key}
                className={`relative card p-7 flex flex-col transition-all duration-200 hover:-translate-y-0.5 ${highlight ? 'pricing-card-pro' : ''}`}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 pricing-popular-badge">
                    Más popular
                  </div>
                )}
                <div className="font-semibold text-fg-primary">{plan.name}</div>
                <div className="flex items-end gap-1 mt-3 mb-5">
                  <span className="text-4xl font-bold text-fg-primary font-mono">{plan.price}€</span>
                  <span className="text-sm text-fg-muted mb-1">/mes</span>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-fg-secondary">
                      <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`w-full justify-center ${highlight ? 'btn-primary' : 'btn-secondary'}`}
                  aria-label={`Empezar con plan ${plan.name}`}
                >
                  Empezar ahora
                </Link>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-fg-disabled mt-8">
          ¿Solo quieres probar?{' '}
          <Link href="/register" className="text-brand-primary hover:underline">Crea una cuenta gratis</Link>{' '}
          y gestiona hasta 3 clientes sin tarjeta. Para siempre.
        </p>
      </section>

      {/* ── Para tu equipo ────────────────────────────────────────────────── */}
      <section className="border-t border-border/50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center section-fade-up">
            <div>
              <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full border border-brand-primary/20 bg-brand-primary/6 text-xs text-brand-primary font-medium">
                <Users className="w-3.5 h-3.5" /> Plan Equipo
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-fg-primary mb-5 tracking-tight">
                ¿Sois más de uno en el equipo?
              </h2>
              <p className="text-fg-muted mb-8 leading-relaxed">
                TrainerBoost Equipo permite que varios entrenadores compartan clientes, citas y panel desde un solo lugar. Perfecto para centros con 2–5 profesionales.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Todos los entrenadores ven el historial completo de cada cliente',
                  'Gestión de citas por entrenador con vista global del centro',
                  'Si uno no puede, otro le cubre sin perder contexto',
                  'Facturación centralizada del centro, no individual',
                  'Panel del responsable con vista de todos los entrenadores',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-fg-secondary">
                    <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/pricing#equipo" className="btn-primary inline-flex items-center gap-2">
                Ver plan Equipo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mini dashboard mockup equipo */}
            <div className="card p-6 section-fade-up">
              <div className="text-xs text-fg-disabled font-medium mb-4 uppercase tracking-wider">Vista del centro — 3 entrenadores</div>
              <div className="space-y-3">
                {[
                  { name: 'Álvaro García',  clients: 14, sessions: 3, revenue: '2.340€', color: 'text-brand-primary bg-brand-primary/10' },
                  { name: 'Sara Jiménez',   clients: 9,  sessions: 2, revenue: '1.350€', color: 'text-sky-400 bg-sky-400/10' },
                  { name: 'Marcos Delgado', clients: 11, sessions: 4, revenue: '1.650€', color: 'text-purple-400 bg-purple-400/10' },
                ].map((trainer) => (
                  <div key={trainer.name} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:border-border-bright transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${trainer.color}`}>
                      {trainer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-fg-primary truncate">{trainer.name}</div>
                      <div className="text-xs text-fg-muted">{trainer.clients} clientes · {trainer.sessions} citas hoy</div>
                    </div>
                    <div className="text-sm font-mono font-semibold text-brand-primary shrink-0">{trainer.revenue}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-fg-muted">Total del centro este mes</span>
                <span className="text-base font-bold font-mono text-fg-primary">5.340€</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="text-center mb-12 section-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-fg-primary tracking-tight">Preguntas frecuentes</h2>
        </div>
        <div className="space-y-2 section-fade-up">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ── CTA Final — fondo verde ───────────────────────────────────────── */}
      <section className="cta-final-section py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="cta-title text-4xl md:text-5xl font-bold mb-5 tracking-tight text-balance">
            ¿Cuántas horas pierdes cada semana en lo que no es entrenar?
          </h2>
          <p className="cta-sub text-lg mb-10">
            Empieza gratis hoy. Los primeros 3 clientes, para siempre gratis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/register" className="btn-cta-black" aria-label="Probar TrainerBoost 14 días gratis">
              <Zap className="w-4 h-4" /> Probar 14 días gratis
            </Link>
            <Link href="/demo" className="btn-cta-link">
              Ver demo primero →
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {TRUST.map((t) => (
              <div key={t} className="trust-item">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(0,0,0,0.4)' }} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-brand-primary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="font-bold text-fg-primary text-sm">TrainerBoost</span>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-fg-disabled" aria-label="Footer">
              <Link href="/pricing" className="hover:text-fg-secondary transition-colors">Precios</Link>
              <Link href="/demo/trainer" className="hover:text-fg-secondary transition-colors">Demo</Link>
              <Link href="/contact" className="hover:text-fg-secondary transition-colors">Contacto</Link>
              <Link href="/privacy" className="hover:text-fg-secondary transition-colors">Política de privacidad</Link>
              <Link href="/terms" className="hover:text-fg-secondary transition-colors">Términos de servicio</Link>
            </nav>
          </div>
          <p className="text-center text-xs text-fg-disabled">
            © 2025 TrainerBoost · Para entrenadores personales · España
          </p>
        </div>
      </footer>

    </div>
  )
}
