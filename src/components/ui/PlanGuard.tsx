'use client'

import Link from 'next/link'
import { Lock, ArrowUpRight } from 'lucide-react'
import type { SubscriptionPlan } from '@/types/database'

const PLAN_HIERARCHY: Record<SubscriptionPlan, number> = {
  starter: 1,
  pro: 2,
  unlimited: 3,
}

interface PlanGuardProps {
  /** Minimum plan required to see children */
  requiredPlan: SubscriptionPlan
  /** Current user's plan (null = free / inactive) */
  currentPlan: SubscriptionPlan | null
  /** If true, renders a blurred overlay instead of replacing content */
  overlay?: boolean
  children: React.ReactNode
}

export default function PlanGuard({
  requiredPlan,
  currentPlan,
  overlay = false,
  children,
}: PlanGuardProps) {
  const currentLevel  = currentPlan ? (PLAN_HIERARCHY[currentPlan] ?? 0) : 0
  const requiredLevel = PLAN_HIERARCHY[requiredPlan]
  const hasAccess     = currentLevel >= requiredLevel

  if (hasAccess) return <>{children}</>

  const planLabel = requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)

  const gate = (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
        <Lock className="w-6 h-6 text-brand-primary" />
      </div>
      <div>
        <h3 className="font-bold text-white mb-1">Función {planLabel}</h3>
        <p className="text-slate-400 text-sm max-w-xs">
          Actualiza tu plan para acceder a esta funcionalidad y escalar tu negocio.
        </p>
      </div>
      <Link href="/pricing" className="btn-primary">
        <ArrowUpRight className="w-4 h-4" />
        Actualizar a {planLabel}
      </Link>
    </div>
  )

  if (!overlay) return <div className="card">{gate}</div>

  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="pointer-events-none select-none blur-sm opacity-40">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
        {gate}
      </div>
    </div>
  )
}
