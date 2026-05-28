'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Check, Zap, Loader2, ArrowLeft } from 'lucide-react'
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
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-4">
            <Zap className="w-3.5 h-3.5 text-brand-primary" />
            <span className="text-xs font-semibold text-brand-primary">Planes y precios</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Elige el plan perfecto para tu negocio
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Cancela cuando quieras. Sin permanencias. Sin sorpresas.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLAN_ORDER.map((key, i) => {
            const plan = PLANS[key]
            const isPopular = key === 'pro'

            return (
              <div
                key={key}
                className={cn(
                  'relative card p-8 flex flex-col transition-all duration-200',
                  isPopular
                    ? 'border-brand-primary/50 shadow-glow-primary scale-105'
                    : 'hover:border-border-bright'
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full text-xs font-bold bg-brand-primary text-white">
                      Más popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-4xl font-bold font-mono text-white">{plan.price}€</span>
                    <span className="text-slate-400 text-sm">/mes</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    {key === 'unlimited' ? 'Clientes ilimitados' : `Hasta ${plan.maxClients} clientes`}
                  </p>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map(feat => (
                    <li key={feat} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
                      <span className="text-slate-300">{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(key)}
                  disabled={!!loadingPlan}
                  className={cn(
                    'w-full py-3 rounded-xl font-semibold text-sm transition-all',
                    isPopular
                      ? 'bg-brand-primary hover:bg-sky-400 text-white'
                      : 'bg-surface-2 border border-border hover:border-border-bright text-white'
                  )}
                >
                  {loadingPlan === key
                    ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Procesando...</>
                    : `Empezar con ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-400 text-sm space-y-2">
          <p>✓ Pago seguro con Stripe · ✓ Sin cargos ocultos · ✓ Factura incluida</p>
          <p>
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
