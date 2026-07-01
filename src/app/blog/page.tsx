import type { Metadata } from 'next'
import Link from 'next/link'
import LogoFull from '@/components/logo/LogoFull'
import { ARTICLES } from '@/content/blog'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://trainerboost.es'

export const metadata: Metadata = {
  title: 'Blog para entrenadores personales | TrainerBoost',
  description: 'Guías, consejos y estrategias para entrenadores personales en España. Gestión de clientes, cobros, herramientas y cómo hacer crecer tu negocio.',
  alternates: { canonical: `${BASE}/blog` },
  openGraph: {
    title: 'Blog TrainerBoost — Recursos para entrenadores personales',
    description: 'Guías prácticas para entrenadores personales: gestión de clientes, cobros, herramientas y negocio.',
    url: `${BASE}/blog`,
    siteName: 'TrainerBoost',
    images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630 }],
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  'Gestión':     'rgba(143,212,58,0.15)',
  'Negocio':     'rgba(99,160,255,0.15)',
  'Herramientas':'rgba(255,170,99,0.15)',
}

export default function BlogPage() {
  return (
    <div style={{ background: '#080810', minHeight: '100vh', color: '#E8E4D9', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(143,212,58,0.12)', padding: '0 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" aria-label="TrainerBoost"><LogoFull height={20} /></Link>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link href="/blog" style={navLinkActive}>Blog</Link>
            <Link href="/pricing" style={navLink}>Precios</Link>
            <Link href="/es/#cta-final" style={ctaStyle}>Lista de espera</Link>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px 100px' }}>

        {/* Header */}
        <div style={{ marginBottom: '64px' }}>
          <p style={eyebrow}>Recursos · Entrenadores personales</p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, color: '#E8E4D9', lineHeight: 1.1, marginBottom: '16px' }}>
            Blog para entrenadores personales
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(232,228,217,0.6)', lineHeight: 1.6, maxWidth: '560px' }}>
            Guías prácticas sobre gestión de clientes, cobros, herramientas y cómo hacer crecer tu negocio de entrenamiento personal en España.
          </p>
        </div>

        {/* Artículos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {ARTICLES.map(article => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <article style={articleRowStyle}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{
                    ...categoryBadge,
                    background: CATEGORY_COLORS[article.category] ?? 'rgba(255,255,255,0.06)',
                  }}>
                    {article.category}
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgba(232,228,217,0.35)', alignSelf: 'center' }}>
                    {article.readingTime} min de lectura
                  </span>
                </div>
                <h2 style={{ fontSize: 'clamp(17px, 2.5vw, 22px)', fontWeight: 700, color: '#E8E4D9', margin: '12px 0 8px', lineHeight: 1.3 }}>
                  {article.title}
                </h2>
                <p style={{ fontSize: '14px', color: 'rgba(232,228,217,0.55)', lineHeight: 1.65, margin: 0 }}>
                  {article.description}
                </p>
                <p style={{ fontSize: '12px', color: '#8FD43A', marginTop: '14px', fontWeight: 600, letterSpacing: '0.05em' }}>
                  Leer artículo →
                </p>
              </article>
            </Link>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
            <Link href="/es/" style={navLink}>Inicio</Link>
            <Link href="/pricing" style={navLink}>Precios</Link>
            <Link href="/privacidad" style={navLink}>Privacidad</Link>
            <Link href="/terminos" style={navLink}>Términos</Link>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(232,228,217,0.3)' }}>
            © 2026 TrainerBoost · Software para entrenadores personales en España
          </p>
        </div>
      </footer>
    </div>
  )
}

const navLink: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '11px',
  letterSpacing: '0.1em',
  color: 'rgba(232,228,217,0.5)',
  textDecoration: 'none',
  textTransform: 'uppercase',
}

const navLinkActive: React.CSSProperties = {
  ...navLink,
  color: '#8FD43A',
}

const ctaStyle: React.CSSProperties = {
  background: '#8FD43A',
  color: '#050805',
  padding: '8px 16px',
  borderRadius: '6px',
  fontWeight: 700,
  fontSize: '12px',
  letterSpacing: '0.05em',
  textDecoration: 'none',
}

const eyebrow: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '11px',
  letterSpacing: '0.14em',
  color: '#8FD43A',
  textTransform: 'uppercase',
  marginBottom: '16px',
}

const articleRowStyle: React.CSSProperties = {
  padding: '32px 0',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  cursor: 'pointer',
  transition: 'opacity 0.15s',
}

const categoryBadge: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.08em',
  padding: '4px 10px',
  borderRadius: '4px',
  color: 'rgba(232,228,217,0.7)',
  textTransform: 'uppercase',
}
