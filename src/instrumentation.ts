// Phase 10 — Sentry integration stub
// To activate: npm i @sentry/nextjs, then add SENTRY_DSN to env vars
// Once installed, remove the try/catch guards and uncomment the typed imports.

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.SENTRY_DSN) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Sentry = require('@sentry/nextjs')
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 0.1,
        environment: process.env.NODE_ENV,
      })
    } catch {
      // @sentry/nextjs not installed — skip
    }
  }
}

export async function onRequestError(err: unknown, request: Request, context: unknown) {
  if (process.env.SENTRY_DSN) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Sentry = require('@sentry/nextjs')
      Sentry.captureRequestError(err, request, context)
    } catch {
      // @sentry/nextjs not installed — skip
    }
  }
}
