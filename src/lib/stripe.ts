import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder')

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 29,
    priceId: process.env.STRIPE_PRICE_ID_STARTER!,
    maxClients: 5,
    features: [
      'Hasta 5 clientes',
      'Rutinas ilimitadas',
      'Planes nutricionales',
      'Mensajería con clientes',
      'Gestión de citas',
      'Registro de progreso',
    ],
  },
  pro: {
    name: 'Pro',
    price: 59,
    priceId: process.env.STRIPE_PRICE_ID_PRO!,
    maxClients: 20,
    features: [
      'Hasta 20 clientes',
      'Todo de Starter',
      'Analytics de progreso',
      'Exportar datos',
      'Soporte prioritario',
      'Personalización de marca',
    ],
  },
  unlimited: {
    name: 'Unlimited',
    price: 99,
    priceId: process.env.STRIPE_PRICE_ID_UNLIMITED!,
    maxClients: 999999,
    features: [
      'Clientes ilimitados',
      'Todo de Pro',
      'API access',
      'Integraciones premium',
      'Onboarding dedicado',
      'SLA garantizado',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS
