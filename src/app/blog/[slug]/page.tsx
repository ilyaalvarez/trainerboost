import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LogoFull from '@/components/logo/LogoFull'
import { ARTICLES, getArticle, getRelatedArticles } from '@/content/blog'
import type { BlogSection } from '@/content/blog/types'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://trainerboost.es'

export async function generateStaticParams() {
  return ARTICLES.map(a => ({ slug: a.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return {}

  return {
    title: `${article.title} | TrainerBoost`,
    description: article.description,
    alternates: { canonical: `${BASE}/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${BASE}/blog/${article.slug}`,
      type: 'article',
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified,
      siteName: 'TrainerBoost',
      images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630 }],
    },
  }
}

function renderSection(section: BlogSection, idx: number) {
  switch (section.type) {
    case 'h2':
      return <h2 key={idx} style={h2Style}>{section.text}</h2>
    case 'h3':
      return <h3 key={idx} style={h3Style}>{section.text}</h3>
    case 'p':
      return <p key={idx} style={pStyle}>{section.text}</p>
    case 'ul':
      return (
        <ul key={idx} style={ulStyle}>
          {section.items?.map((item, i) => (
            <li key={i} style={liStyle}>{item}</li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol key={idx} style={{ ...ulStyle, paddingLeft: '24px' }}>
          {section.items?.map((item, i) => (
            <li key={i} style={liStyle}>{item}</li>
          ))}
        </ol>
      )
    case 'callout':
      return (
        <div key={idx} style={calloutStyle}>
          <span style={{ color: '#8FD43A', fontWeight: 700, fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            {section.variant === 'tip' ? 'Consejo' : 'Info'}
          </span>
          <p style={{ ...pStyle, margin: 0, color: 'rgba(232,228,217,0.8)' }}>{section.text}</p>
        </div>
      )
    case 'cta':
      return (
        <div key={idx} style={ctaBlockStyle}>
          <Link href="/es/#cta-final" style={ctaLinkStyle}>
            {section.text} →
          </Link>
        </div>
      )
    default:
      return null
  }
}

export default async function BlogArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  const related = getRelatedArticles(slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: { '@type': 'Organization', name: 'TrainerBoost', url: BASE },
    publisher: {
      '@type': 'Organization',
      name: 'TrainerBoost',
      logo: { '@type': 'ImageObject', url: `${BASE}/icon-192.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE}/blog/${article.slug}` },
    ...(article.faqs.length > 0 && {
      mainEntity: {
        '@type': 'FAQPage',
        mainEntity: article.faqs.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    }),
  }

  const dateLabel = new Date(article.datePublished).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ background: '#080810', minHeight: '100vh', color: '#E8E4D9', fontFamily: 'Inter, sans-serif' }}>

        {/* Nav */}
        <nav style={{ borderBottom: '1px solid rgba(143,212,58,0.12)', padding: '0 24px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" aria-label="TrainerBoost"><LogoFull height={20} /></Link>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <Link href="/blog" style={navLinkActive}>Blog</Link>
              <Link href="/pricing" style={navLink}>Precios</Link>
              <Link href="/es/#cta-final" style={ctaNavStyle}>Lista de espera</Link>
            </div>
          </div>
        </nav>

        <main style={{ maxWidth: '740px', margin: '0 auto', padding: '56px 24px 80px' }}>

          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" style={{ marginBottom: '32px' }}>
            <span style={breadcrumbStyle}>
              <Link href="/blog" style={{ color: 'rgba(232,228,217,0.4)', textDecoration: 'none' }}>Blog</Link>
              {' → '}
              <span style={{ color: 'rgba(232,228,217,0.4)' }}>{article.category}</span>
            </span>
          </nav>

          {/* Article header */}
          <header style={{ marginBottom: '48px' }}>
            <p style={eyebrow}>{article.category} · {article.readingTime} min de lectura</p>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: '#E8E4D9', lineHeight: 1.15, marginBottom: '16px' }}>
              {article.title}
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(232,228,217,0.6)', lineHeight: 1.6, marginBottom: '20px' }}>
              {article.description}
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(232,228,217,0.3)', fontFamily: 'monospace' }}>
              TrainerBoost · {dateLabel}
            </p>
          </header>

          {/* Article content */}
          <div>
            {article.sections.map((section, idx) => renderSection(section, idx))}
          </div>

          {/* FAQ */}
          {article.faqs.length > 0 && (
            <section style={{ marginTop: '64px', paddingTop: '48px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#E8E4D9', marginBottom: '32px' }}>
                Preguntas frecuentes
              </h2>
              {article.faqs.map(({ q, a }, i) => (
                <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 0' }}>
                  <p style={{ fontWeight: 600, fontSize: '15px', color: '#E8E4D9', marginBottom: '8px' }}>{q}</p>
                  <p style={{ fontSize: '14px', color: 'rgba(232,228,217,0.6)', lineHeight: 1.7, margin: 0 }}>{a}</p>
                </div>
              ))}
            </section>
          )}

          {/* Artículos relacionados */}
          {related.length > 0 && (
            <section style={{ marginTop: '64px', paddingTop: '48px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#E8E4D9', marginBottom: '24px' }}>
                También te puede interesar
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {related.map(rel => (
                  <Link key={rel.slug} href={`/blog/${rel.slug}`} style={relatedLinkStyle}>
                    <span style={{ flex: 1 }}>{rel.title}</span>
                    <span style={{ color: '#8FD43A', flexShrink: 0 }}>→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </main>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
              <Link href="/es/" style={navLink}>Inicio</Link>
              <Link href="/blog" style={navLink}>Blog</Link>
              <Link href="/pricing" style={navLink}>Precios</Link>
              <Link href="/privacidad" style={navLink}>Privacidad</Link>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(232,228,217,0.3)' }}>
              © 2026 TrainerBoost · Software para entrenadores personales en España
            </p>
          </div>
        </footer>

      </div>
    </>
  )
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const navLink: React.CSSProperties = { fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.1em', color: 'rgba(232,228,217,0.5)', textDecoration: 'none', textTransform: 'uppercase' }
const navLinkActive: React.CSSProperties = { ...navLink, color: '#8FD43A' }
const ctaNavStyle: React.CSSProperties = { background: '#8FD43A', color: '#050805', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '12px', letterSpacing: '0.05em', textDecoration: 'none' }
const eyebrow: React.CSSProperties = { fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.14em', color: '#8FD43A', textTransform: 'uppercase', marginBottom: '12px' }
const breadcrumbStyle: React.CSSProperties = { fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.08em' }

const h2Style: React.CSSProperties = { fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: '#E8E4D9', marginTop: '48px', marginBottom: '16px', lineHeight: 1.2 }
const h3Style: React.CSSProperties = { fontSize: '18px', fontWeight: 700, color: '#E8E4D9', marginTop: '32px', marginBottom: '12px' }
const pStyle: React.CSSProperties = { fontSize: '16px', color: 'rgba(232,228,217,0.75)', lineHeight: 1.75, marginBottom: '16px' }
const ulStyle: React.CSSProperties = { paddingLeft: '0', marginBottom: '20px', listStyle: 'none' }
const liStyle: React.CSSProperties = { fontSize: '15px', color: 'rgba(232,228,217,0.7)', lineHeight: 1.7, paddingLeft: '20px', position: 'relative', marginBottom: '8px', paddingTop: '0', backgroundImage: 'none' }
const calloutStyle: React.CSSProperties = { background: 'rgba(143,212,58,0.05)', border: '1px solid rgba(143,212,58,0.2)', borderRadius: '8px', padding: '20px 24px', margin: '28px 0' }
const ctaBlockStyle: React.CSSProperties = { margin: '36px 0', padding: '28px', background: 'rgba(143,212,58,0.06)', borderRadius: '8px', border: '1px solid rgba(143,212,58,0.15)', textAlign: 'center' }
const ctaLinkStyle: React.CSSProperties = { color: '#8FD43A', fontSize: '16px', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em' }
const relatedLinkStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', textDecoration: 'none', color: 'rgba(232,228,217,0.75)', fontSize: '14px', transition: 'border-color 0.15s' }
