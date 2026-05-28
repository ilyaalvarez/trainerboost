'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Check, Zap, Loader2, ArrowLeft, Sparkles } from 'lucide-react'
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
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        {/* Header */}
        <div className="text-center mb-14">
          <div className="chip mb-4 mx-auto w-fit">
            <Zap className="w-3 h-3" />
            Planes y precios
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Empieza gratis,<br />
            <span className="gradient-text">crece cuando quieras</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Sin tarjeta de crédito. Cancela cuando quieras. Sin sorpresas.
          </p>
        </div>

        {/* Plans grid — Free + 3 paid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">

          {/* ── FREE ── */}
          <div className="relative flex flex-col rounded-2xl border border-border bg-surface p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-white mb-1">Gratis</h2>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-3xl font-bold font-mono text-white">0€</span>
                <span className="text-slate-400 text-sm">/mes</span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Para probar sin compromiso</p>
            </div>

            <div className="divider mb-5" />

            <ul className="space-y-2.5 flex-1 mb-6">
              {FREE_FEATURES.map(feat => (
                <li key={feat} className="flex items-start gap-2.5 text-xs">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${feat.startsWith('Sin') ? 'bg-slate-700' : 'bg-brand-accent/20'}`}>
                    <Check className={`w-2 h-2 ${feat.startsWith('Sin') ? 'text-slate-500' : 'text-brand-accent'}`} />
                  </div>
                  <span className={feat.startsWith('Sin') ? 'text-slate-500' : 'text-slate-300'}>{feat}</span>
                </li>
              ))}
            </ul>

            <Link href="/register"
                  className="w-full py-2.5 rounded-xl font-semibold text-sm text-center transition-all bg-surface-2 border border-border hover:border-border-bright text-white block">
              Empezar gratis
            </Link>
          </div>

          {/* ── Paid plans ── */}
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
                  background: 'linear-gradient(180deg, rgba(14,165,233,0.05) 0%, #1E293B 40%)',
                } : undefined}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      Más popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h2 className="text-lg font-bold text-white mb-1">{plan.name}</h2>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-3xl font-bold font-mono text-white">{plan.price}€</span>
                    <span className="text-slate-400 text-sm">/mes</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
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
                  {loadingPlan === key ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...</>
                  ) : (
                    `Empezar con ${plan.name}`
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Trust + FAQ */}
        <div className="text-center mt-12 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-400">
            {['Pago seguro con Stripe', 'Sin cargos ocultos', 'Factura incluida', 'Cancela en 1 clic'].map(t => (
              <div key={t} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-brand-accent" />
                {t}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500">
            ¿Tienes dudas?{' '}
            <a href="mailto:hola@trainerboost.app" className="text-brand-primary hover:underline">
              Contáctanos
            </a>
            {' · '}
            <Link href="/demo" className="text-brand-primary hover:underline">
              Ver demo primero
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
