import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',   value: 'on' },
  { key: 'Strict-Transport-Security',value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',   value: 'nosniff' },
  { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js requires unsafe-inline + unsafe-eval for its runtime chunks
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://browser.sentry-cdn.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://fcm.googleapis.com https://*.sentry.io",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  // Sentry organization and project (fill in after creating project at sentry.io)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps when SENTRY_AUTH_TOKEN is present (CI/Vercel)
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.SENTRY_AUTH_TOKEN,

  // Disable Sentry webpack plugin entirely when auth token is absent
  // (prevents build failures in local dev without Sentry configured)
  ...(process.env.SENTRY_AUTH_TOKEN
    ? {}
    : { disableServerWebpackPlugin: true, disableClientWebpackPlugin: true }),

  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: false,
})
