import Stripe from 'stripe'
import { PLAN_CONFIG, type PlanKey } from './plans'

const secretKey = process.env.STRIPE_SECRET_KEY
if (!secretKey) {
  throw new Error('STRIPE_SECRET_KEY no está configurada')
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2026-05-27.dahlia',
})

const PRICE_IDS: Record<PlanKey, string | undefined> = {
  starter:   process.env.STRIPE_PRICE_ID_STARTER,
  pro:       process.env.STRIPE_PRICE_ID_PRO,
  unlimited: process.env.STRIPE_PRICE_ID_UNLIMITED,
}

/** Plan catalogue including the Stripe priceId for each tier. */
export const PLANS = {
  starter:   { ...PLAN_CONFIG.starter,   priceId: PRICE_IDS.starter! },
  pro:       { ...PLAN_CONFIG.pro,       priceId: PRICE_IDS.pro! },
  unlimited: { ...PLAN_CONFIG.unlimited, priceId: PRICE_IDS.unlimited! },
} as const

/**
 * Resolve a plan key from the Stripe priceId actually paid. This is the
 * trustworthy source of truth — never rely on mutable subscription metadata.
 */
export function planFromPriceId(priceId: string | null | undefined): PlanKey | null {
  if (!priceId) return null
  const entry = (Object.keys(PRICE_IDS) as PlanKey[]).find(k => PRICE_IDS[k] === priceId)
  return entry ?? null
}

export type { PlanKey }
