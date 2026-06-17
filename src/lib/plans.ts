// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for plan pricing, limits, names and features.
// This module is pure (no Stripe SDK) so it can be safely imported from both
// client and server components. `lib/stripe.ts` layers the Stripe priceIds on
// top of this, and `types/database.ts` re-derives PLAN_PRICES / PLAN_LIMITS.
// ─────────────────────────────────────────────────────────────────────────────

export type PlanKey = 'starter' | 'pro' | 'unlimited'

export interface PlanConfig {
  /** Commercial display name */
  name: string
  /** Monthly price in EUR */
  price: number
  /** Max active clients allowed on this plan */
  maxClients: number
  features: string[]
}

/** Clients allowed on the free tier (no active paid subscription). */
export const FREE_MAX_CLIENTS = 3

export const PLAN_CONFIG: Record<PlanKey, PlanConfig> = {
  starter: {
    name: 'Independiente',
    price: 19,
    maxClients: 10,
    features: [
      'Hasta 10 clientes',
      'Rutinas y plantillas ilimitadas',
      'Planes nutricionales',
      'Mensajería con clientes',
      'Gestión de citas',
      'Registro de progreso',
    ],
  },
  pro: {
    name: 'Profesional',
    price: 39,
    maxClients: 30,
    features: [
      'Hasta 30 clientes',
      'Todo de Independiente',
      'Analytics avanzados',
      'Exportar datos a PDF',
      'Soporte prioritario',
      'Invitaciones por email',
    ],
  },
  unlimited: {
    name: 'Equipo',
    price: 79,
    maxClients: 999999,
    features: [
      'Clientes ilimitados',
      'Todo de Profesional',
      'Hasta 5 entrenadores en un panel',
      'Vista global del centro',
      'Gestión de retos grupales',
      'Onboarding dedicado',
      'SLA garantizado',
    ],
  },
}
