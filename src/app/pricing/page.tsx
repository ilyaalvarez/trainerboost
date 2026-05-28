'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Check, Zap, Loader2, ArrowLeft, Sparkles } from 'lucide-react'
import { PLANS, type PlanKey } from '@/lib/stripe'
import { cn } from '@/lib/utils'

const PLAN_ORDER: PlanKey[] = ['starter', 'pro', 'unlimited']

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
      {/* Ambient top glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 py-16">
        {/* Back */}
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
            Elige el plan perfecto<br />
            <span className="gradient-text">para tu negocio</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Cancela cuando quieras. Sin permanencias. Sin sorpresas.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLAN_ORDER.map((key) => {
            const plan = PLANS[key]
            const isPopular = key === 'pro'

            return (
              <div
                key={key}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-8 transition-all duration-200',
                  isPopular
                    ? 'border-brand-primary/50 scale-[1.02] shadow-glow-primary'
                    : 'border-border bg-surface hover:border-border-bright'
                )}
                style={isPopular ? {
                  background: 'linear-gradient(180deg, rgba(14,165,233,0.05) 0%, #1E293B 40%)',
                } : undefined}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-glow-sm"
                      style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}
                    >
                      <Sparkles className="w-3 h-3" />
                      Más popular
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-bold font-mono text-white">{plan.price}€</span>
                    <span className="text-slate-400 text-sm">/mes</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    {key === 'unlimited' ? 'Clientes ilimitados' : `Hasta ${plan.maxClients} clientes`}
                  </p>
                </div>

                {/* Divider */}
                <div className="divider mb-6" />

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map(feat => (
                    <li key={feat} className="flex items-start gap-3 text-sm">
                      <div className="w-4 h-4 rounded-full bg-brand-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-brand-accent" />
                      </div>
                      <span className="text-slate-300">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleCheckout(key)}
                  disabled={!!loadingPlan}
                  className={cn(
                    'w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
                    isPopular
                      ? 'btn-gradient'
                      : 'bg-surface-2 border border-border hover:border-border-bright text-white hover:bg-surface-3'
                  )}
                >
                  {loadingPlan === key ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                  ) : (
                    `Empezar con ${plan.name}`
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-14 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-400">
            {['Pago seguro con Stripe', 'Sin cargos ocultos', 'Factura incluida'].map(t => (
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
          </p>
        </div>
      </div>
    </div>
  )
}
