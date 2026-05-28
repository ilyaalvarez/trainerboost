import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder')

export const PLANS = {
  starter: {
    name: 'Pro',
    price: 19,
    priceId: process.env.STRIPE_PRICE_ID_STARTER!,
    maxClients: 10,
    features: [
      'Hasta 10 clientes',
      'Rutinas ilimitadas',
      'Planes nutricionales',
      'Mensajería con clientes',
      'Gestión de citas',
      'Registro de progreso',
    ],
  },
  pro: {
    name: 'Business',
    price: 39,
    priceId: process.env.STRIPE_PRICE_ID_PRO!,
    maxClients: 30,
    features: [
      'Hasta 30 clientes',
      'Todo de Pro',
      'Analytics avanzados',
      'Exportar datos a PDF',
      'Soporte prioritario',
      'Invitaciones por email',
    ],
  },
  unlimited: {
    name: 'Enterprise',
    price: 79,
    priceId: process.env.STRIPE_PRICE_ID_UNLIMITED!,
    maxClients: 999999,
    features: [
      'Clientes ilimitados',
      'Todo de Business',
      'API access',
      'Integraciones premium',
      'Onboarding dedicado',
      'SLA garantizado',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS
