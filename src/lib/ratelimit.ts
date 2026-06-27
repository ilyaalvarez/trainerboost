import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Returns null if env vars are absent — rate limiting degrades gracefully in local dev
function makeRedis(): Redis | null {
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = process.env
  if (!url || !token) return null
  return new Redis({ url, token })
}

const redis = makeRedis()

function limiter(tokens: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`) {
  if (!redis) return null
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(tokens, window) })
}

const limiters = {
  strict:   limiter(5,  '1 h'),   // public spam-prone (contact form)
  lookup:   limiter(30, '1 m'),   // public read-only (invite code)
  account:  limiter(10, '1 h'),   // destructive/billing (checkout, delete, invite send)
  standard: limiter(60, '1 m'),   // normal authenticated API (push, portal, email)
} as const

// Ordered so more specific prefixes win (invite/send before invite/)
const ROUTE_LIMITS: Array<[string, keyof typeof limiters]> = [
  ['/api/waitlist',            'strict'],
  ['/api/contact',             'strict'],
  ['/api/invite/send',         'account'],
  ['/api/invite/',             'lookup'],
  ['/api/checkout',            'account'],
  ['/api/free-plan',           'account'],
  ['/api/account/delete',      'account'],
  ['/api/portal',              'standard'],
  ['/api/email/welcome',       'standard'],
  ['/api/push/subscribe',      'standard'],
  ['/api/push/notify-message', 'standard'],
  ['/api/push/notify-event',   'standard'],
  // /api/push/send — internal secret already protects it
  // /api/webhooks/stripe — Stripe requires reliable delivery
  // /api/cron — Vercel CRON_SECRET already protects it
]

export function getRatelimiter(path: string): Ratelimit | null {
  for (const [prefix, key] of ROUTE_LIMITS) {
    if (path.startsWith(prefix)) return limiters[key]
  }
  return null
}
