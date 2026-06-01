'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Check, Zap, Loader2, Sparkles, ChevronDown,
  Shield, Clock, TrendingUp, Users, Award,
} from 'lucide-react'
import { PLANS, type PlanKey } from '@/lib/stripe'
import { cn } from '@/lib/utils'

const PLAN_ORDER: PlanKey[] = ['starter', 'pro', 'unlimited']

const FREE_FEATURES = [
  '3 clientes',
  'Rutinas básicas',
  'Mensajería básica',
  'Gestión de citas',
  'Registro de progreso',
  'Sin analytics',
]

const TRUST_BADGES = [
  { icon: Shield, text: 'Pago 100% seguro' },
  { icon: Clock,  text: 'Cancela en 1 clic' },
  { icon: Check,  text: 'Sin cargos ocultos' },
  { icon: Award,  text: 'Factura incluida' },
]

const TESTIMONIALS = [
  {
    text: 'Empecé con el plan gratuito y en una semana ya tenía los 3 clientes llenos. El upgrade a Starter fue inmediato.',
    name: 'Marcos T.',
    role: 'PT · Málaga',
    initials: 'MT',
    plan: 'Starter',
  },
  {
    text: 'El plan Pro me cambió el negocio. Paso de chatear por WhatsApp a tener todo en un solo lugar.',
    name: 'Elena V.',
    role: 'Coach online · Madrid',
    initials: 'EV',
    plan: 'Pro',
  },
]

const FAQ = [
  {
    q: '¿Necesito tarjeta de crédito para el plan gratuito?',
    a: 'No. El plan gratuito no requiere tarjeta. Puedes empezar en 2 minutos sin introducir ningún dato de pago.',
  },
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí, sin compromisos. Puedes cancelar tu suscripción en cualquier momento desde los ajustes de tu cuenta con un solo clic.',
  },
  {
    q: '¿Qué ocurre si llego al límite de clientes de mi plan?',
    a: 'Te avisamos cuando te acerques al límite. Puedes hacer upgrade a cualquier plan superior en cualquier momento para ampliar tu capacidad.',
  },
  {
    q: '¿Puedo cambiar de plan cuando quiera?',
    a: 'Sí. Puedes subir o bajar de plan en cualquier momento. Los cambios se aplican de forma inmediata y el cobro se prorratea.',
  },
  {
    q: '¿Los clientes pagan algo?',
    a: 'No. El coste recae únicamente en el entrenador. Tus clientes acceden al portal de forma completamente gratuita.',
  },
  {
    q: '¿Hay descuentos por pago anual?',
    a: 'Estamos trabajando en ello. Si te interesa, escríbenos y te avisaremos cuando lancemos los planes anuales con descuento.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn('border-b border-border/50 last:border-0 transition-colors duration-200', open && 'bg-surface-2/30')}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 px-1 text-left group"
      >
        <span className={cn('font-medium text-sm leading-snug transition-colors duration-150', open ? 'text-white' : 'text-slate-200 group-hover:text-white')}>
          {q}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-slate-500 shrink-0 transition-transform duration-300', open && 'rotate-180 text-brand-primary')} />
      </button>
      <div className={cn('overflow-hidden transition-all duration-300', open ? 'max-h-40 pb-5' : 'max-h-0')}>
        <p className="text-sm text-slate-400 leading-relaxed pr-8">{a}</p>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null)
  const [annual, setAnnual] = useState(false)

  async function handleCheckout(plan: PlanKey) {
    setLoadingPlan(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) { router.push('/login'); return }
        toast.error(data.error || 'Error al procesar')
        return
      }
      window.location.href = data.url
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* Ambient background */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-80 pointer-events-none z-0"
           style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.08) 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] pointer-events-none z-0"
           style={{ background: 'radial-gradient(ellipse at 100% 100%, rgba(124,58,237,0.05) 0%, transparent 70%)' }} />

      {/* Nav */}
      <nav className="relative z-10 border-b border-border/50 bg-background/85 backdrop-blur-xl sticky top-0">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-glow-sm"
                 style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight gradient-text">TrainerBoost</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 hidden sm:block px-3 py-2 rounded-lg hover:bg-surface/70">
              Contacto
            </Link>
            <div className="w-px h-4 bg-border mx-2 hidden sm:block" />
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 px-3 py-2 rounded-lg hover:bg-surface/70 hidden sm:block">
              Entrar
            </Link>
            <Link href="/register" className="btn-gradient text-sm py-2 px-4 ml-1">
              Probar gratis
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="chip mb-5 mx-auto w-fit">
            <Zap className="w-3 h-3" />
            Planes y precios
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
            Empieza gratis,<br />
            <span className="gradient-text">crece cuando quieras</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
            Sin tarjeta de crédito. Sin sorpresas. Cancela en 1 clic.
          </p>
        </div>

        {/* ── Billing toggle ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className={`text-sm ${!annual ? 'text-white' : 'text-slate-400'}`}>Mensual</span>
          <button
            onClick={() => setAnnual(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors ${annual ? 'bg-sky-500' : 'bg-slate-700'}`}
            aria-label="Cambiar período de facturación"
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${annual ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm ${annual ? 'text-white' : 'text-slate-400'}`}>
            Anual <span className="text-emerald-400 font-semibold">-20%</span>
          </span>
        </div>
        {annual && (
          <p className="text-center text-xs text-slate-500 -mt-4 mb-8">
            La facturación anual estará disponible próximamente.
          </p>
        )}

        {/* ── Plans grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch mb-10 animate-fade-in-up delay-100">

          {/* FREE */}
          <div className="relative flex flex-col rounded-2xl border border-border/80 bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border-bright">
            <div className="mb-5">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gratis</div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold font-mono text-white">0€</span>
                <span className="text-slate-400 text-sm">/mes</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Para probar sin compromiso</p>
            </div>

            <div className="divider mb-5" />

            <ul className="space-y-2.5 flex-1 mb-6">
              {FREE_FEATURES.map(feat => (
                <li key={feat} className="flex items-start gap-2.5 text-xs">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${feat.startsWith('Sin') ? 'bg-slate-700/80' : 'bg-brand-accent/20'}`}>
                    <Check className={`w-2 h-2 ${feat.startsWith('Sin') ? 'text-slate-500' : 'text-brand-accent'}`} />
                  </div>
                  <span className={feat.startsWith('Sin') ? 'text-slate-500 line-through' : 'text-slate-300'}>{feat}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-center transition-all duration-200 bg-surface-2 border border-border hover:border-border-bright hover:bg-surface-3 text-white block hover:-translate-y-0.5"
            >
              Empezar gratis
            </Link>
          </div>

          {/* Paid plans */}
          {PLAN_ORDER.map((key, idx) => {
            const plan = PLANS[key]
            const isPopular = key === 'starter'
            return (
              <div
                key={key}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-6 transition-all duration-300',
                  isPopular
                    ? 'border-brand-primary/60 shadow-glow-primary hover:-translate-y-2'
                    : 'border-border/80 bg-surface hover:border-border-bright hover:-translate-y-1',
                  `animate-fade-in-up delay-${(idx + 1) * 100 + 100}`,
                )}
                style={isPopular ? {
                  background: 'linear-gradient(180deg, rgba(14,165,233,0.08) 0%, #1E293B 55%)',
                } : undefined}
              >
                {/* Popular top accent */}
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                       style={{ background: 'linear-gradient(90deg, #0EA5E9, #7C3AED)' }} />
                )}

                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-glow-sm"
                      style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}
                    >
                      <Sparkles className="w-3 h-3" /> Más popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{plan.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-mono text-white">
                      {annual ? Math.floor(plan.price * 0.8) : plan.price}€
                    </span>
                    <span className="text-slate-400 text-sm">/mes</span>
                  </div>
                  {annual && (
                    <p className="text-xs text-emerald-400 mt-1">
                      {Math.floor(plan.price * 0.8 * 12)}€/año · ahorras {Math.floor(plan.price * 0.2 * 12)}€
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    {key === 'unlimited' ? 'Clientes ilimitados' : `Hasta ${plan.maxClients} clientes`}
                  </p>
                </div>

                <div className="divider mb-5" />

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(feat => (
                    <li key={feat} className="flex items-start gap-2.5 text-xs">
                      <div className="w-3.5 h-3.5 rounded-full bg-brand-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2 h-2 text-brand-accent" />
                      </div>
                      <span className="text-slate-300">{feat}</span>
                    </li>
                  ))}
                </ul>

                {annual ? (
                  <a
                    href={`mailto:hola@trainerboost.es?subject=Facturación anual TrainerBoost – Plan ${plan.name}`}
                    className={cn(
                      'w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2',
                      isPopular
                        ? 'btn-gradient'
                        : 'bg-surface-2 border border-border hover:border-border-bright text-white hover:bg-surface-3 hover:-translate-y-0.5',
                    )}
                  >
                    Notifícame
                  </a>
                ) : (
                  <button
                    onClick={() => handleCheckout(key)}
                    disabled={!!loadingPlan}
                    className={cn(
                      'w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2',
                      isPopular
                        ? 'btn-gradient'
                        : 'bg-surface-2 border border-border hover:border-border-bright text-white hover:bg-surface-3 hover:-translate-y-0.5',
                    )}
                  >
                    {loadingPlan === key
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...</>
                      : 'Probar 14 días gratis'}
                  </button>
                )}
                <p className="text-xs text-slate-500 mt-1 text-center">
                  {annual ? 'Próximamente · Sin compromiso' : '14 días gratis · Sin compromiso'}
                </p>
              </div>
            )
          })}
        </div>

        {/* ── Trust badges ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-8 mb-12 border-y border-border/40 animate-fade-in-up delay-300">
          {TRUST_BADGES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-6 h-6 rounded-lg bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center">
                <Icon className="w-3 h-3 text-brand-accent" />
              </div>
              {text}
            </div>
          ))}
        </div>

        {/* ── Testimonials ───────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5 mb-16 animate-fade-in-up delay-300">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="card p-5 flex flex-col gap-4 hover:-translate-y-0.5 transition-transform duration-200">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-xs font-bold text-brand-primary shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                  Plan {t.plan}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16 text-center animate-fade-in-up delay-400">
          {[
            { icon: Users,      value: '500+',  label: 'Entrenadores activos' },
            { icon: TrendingUp, value: '8k+',   label: 'Clientes gestionados' },
            { icon: Award,      value: '4.9★',  label: 'Valoración media' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="card p-5 hover:-translate-y-0.5 transition-transform duration-200">
              <Icon className="w-5 h-5 text-brand-primary mx-auto mb-2" />
              <div className="text-2xl font-bold font-mono gradient-text mb-1">{value}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        {/* ── FAQ ────────────────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto animate-fade-in-up delay-400">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Preguntas frecuentes</h2>
            <p className="text-slate-400 text-sm">
              ¿No encuentras lo que buscas?{' '}
              <a href="mailto:hola@trainerboost.es" className="text-brand-primary hover:underline">Escríbenos</a>.
            </p>
          </div>

          <div className="card p-6">
            {FAQ.map(item => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ─────────────────────────────────────────────────── */}
        <div className="text-center mt-16 animate-fade-in-up delay-500">
          <div className="card p-8 max-w-md mx-auto border-brand-primary/20">
            <Zap className="w-8 h-8 text-brand-primary mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">¿Quieres verlo antes de decidir?</h3>
            <p className="text-sm text-slate-400 mb-5">Prueba la demo completa sin registro y sin tarjeta.</p>
            <Link href="/demo" className="btn-secondary w-full justify-center">
              Explorar demo gratuita →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
