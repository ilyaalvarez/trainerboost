'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Check, Zap, Loader2, ArrowLeft, Sparkles, ChevronDown } from 'lucide-react'
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
    <div className="border-b border-border/60 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-medium text-white text-sm leading-snug">{q}</span>
        <ChevronDown className={cn('w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <p className="pb-5 text-sm text-slate-400 leading-relaxed pr-8">{a}</p>
      )}
    </div>
  )
}

export default function PricingPage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null)

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
    <div className="min-h-screen bg-background">
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-72 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.07) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-12 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Volver al inicio
        </Link>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="text-center mb-16">
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

        {/* ── Plans grid — Free + 3 paid ──────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch mb-14">

          {/* FREE */}
          <div className="relative flex flex-col rounded-2xl border border-border bg-surface p-6">
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
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${feat.startsWith('Sin') ? 'bg-slate-700' : 'bg-brand-accent/20'}`}>
                    <Check className={`w-2 h-2 ${feat.startsWith('Sin') ? 'text-slate-500' : 'text-brand-accent'}`} />
                  </div>
                  <span className={feat.startsWith('Sin') ? 'text-slate-500 line-through' : 'text-slate-300'}>{feat}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-center transition-all bg-surface-2 border border-border hover:border-border-bright text-white block"
            >
              Empezar gratis
            </Link>
          </div>

          {/* Paid plans */}
          {PLAN_ORDER.map(key => {
            const plan = PLANS[key]
            const isPopular = key === 'starter'
            return (
              <div
                key={key}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-6 transition-all duration-200',
                  isPopular
                    ? 'border-brand-primary/50 shadow-glow-primary'
                    : 'border-border bg-surface hover:border-border-bright'
                )}
                style={isPopular ? {
                  background: 'linear-gradient(180deg, rgba(14,165,233,0.06) 0%, #1E293B 50%)',
                } : undefined}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-glow-sm"
                      style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}
                    >
                      <Sparkles className="w-2.5 h-2.5" /> Más popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{plan.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-mono text-white">{plan.price}€</span>
                    <span className="text-slate-400 text-sm">/mes</span>
                  </div>
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

                <button
                  onClick={() => handleCheckout(key)}
                  disabled={!!loadingPlan}
                  className={cn(
                    'w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
                    isPopular
                      ? 'btn-gradient'
                      : 'bg-surface-2 border border-border hover:border-border-bright text-white hover:bg-surface-3'
                  )}
                >
                  {loadingPlan === key
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...</>
                    : `Empezar con ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>

        {/* ── Trust strip ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400 mb-20">
          {['Pago seguro con Stripe', 'Sin cargos ocultos', 'Factura incluida', 'Cancela en 1 clic'].map(t => (
            <div key={t} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              {t}
            </div>
          ))}
        </div>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Preguntas frecuentes</h2>
            <p className="text-slate-400 text-sm">¿No encuentras lo que buscas? <a href="mailto:hola@trainerboost.es" className="text-brand-primary hover:underline">Escríbenos</a>.</p>
          </div>

          <div className="card p-6">
            {FAQ.map(item => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ──────────────────────────────────────────────── */}
        <div className="text-center mt-16">
          <p className="text-slate-500 text-sm mb-2">¿Quieres verlo antes de decidir?</p>
          <Link href="/demo" className="text-brand-primary hover:underline font-medium text-sm">
            Explorar la demo sin registro →
          </Link>
        </div>
      </div>
    </div>
  )
}
