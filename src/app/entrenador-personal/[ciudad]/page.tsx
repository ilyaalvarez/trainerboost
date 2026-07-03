import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LogoFull from '@/components/logo/LogoFull'
import { CIUDADES, getCiudad } from '@/data/ciudades'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://trainerboost.es'

export async function generateStaticParams() {
  return CIUDADES.map(c => ({ ciudad: c.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ ciudad: string }> }
): Promise<Metadata> {
  const { ciudad: slug } = await params
  const ciudad = getCiudad(slug)
  if (!ciudad) return {}

  const title = `Software para entrenadores personales en ${ciudad.name} | TrainerBoost`
  const description = `Gestiona tus clientes de entrenamiento personal en ${ciudad.name} desde un solo lugar. Rutinas, pagos, seguimiento y mensajería. Únete a la lista de espera gratis.`

  return {
    title,
    description,
    alternates: { canonical: `${BASE}/entrenador-personal/${ciudad.slug}` },
    openGraph: {
      title,
      description,
      url: `${BASE}/entrenador-personal/${ciudad.slug}`,
      siteName: 'TrainerBoost',
      images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630 }],
    },
  }
}

const FEATURES = [
  {
    icon: '👥',
    title: 'Gestión de clientes',
    desc: 'Fichas completas, historial de sesiones y seguimiento de objetivos en un solo lugar.',
  },
  {
    icon: '💳',
    title: 'Cobros automáticos',
    desc: 'Mensualidades, sesiones sueltas y planes. Sin facturas manuales, sin impagos olvidados.',
  },
  {
    icon: '📋',
    title: 'Rutinas y planes',
    desc: 'Crea y asigna programas de entrenamiento personalizados en minutos.',
  },
  {
    icon: '📊',
    title: 'Seguimiento de progreso',
    desc: 'Métricas de cada cliente: peso, rendimiento, asistencia y adherencia al plan.',
  },
  {
    icon: '💬',
    title: 'Mensajería integrada',
    desc: 'Comunícate con todos tus clientes desde la misma plataforma. Sin WhatsApp, sin correo.',
  },
  {
    icon: '🔗',
    title: 'Perfil público compartible',
    desc: 'Tu página profesional en trainerboost.es/tu-nombre. Perfecta para el link de Instagram.',
  },
]

const FAQS = (ciudad: string) => [
  {
    q: `¿Funciona TrainerBoost para entrenadores en ${ciudad}?`,
    a: `Sí. TrainerBoost está diseñado para entrenadores personales en toda España, incluida ${ciudad}. Funciona 100% online — no necesitas instalar nada ni que tus clientes descarguen una app.`,
  },
  {
    q: '¿Cuánto cuesta TrainerBoost?',
    a: 'Hay un plan gratuito para empezar con hasta 5 clientes. Los planes de pago arrancan en 19€/mes. Actualmente estamos en lista de espera cerrada — puedes apuntarte gratis y entrar antes que nadie.',
  },
  {
    q: '¿Necesito que mis clientes descarguen algo?',
    a: 'No. Tus clientes acceden desde el navegador del móvil con un simple enlace. Sin apps que descargar, sin cuentas adicionales que crear.',
  },
  {
    q: `¿Puedo gestionar clientes online desde ${ciudad}?`,
    a: `Claro. TrainerBoost está pensado para entrenadores que trabajan tanto presencialmente como en remoto. Muchos entrenadores de ${ciudad} ya gestionan clientes de toda España desde la plataforma.`,
  },
]

export default async function CiudadPage(
  { params }: { params: Promise<{ ciudad: string }> }
) {
  const { ciudad: slug } = await params
  const ciudad = getCiudad(slug)
  if (!ciudad) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'TrainerBoost',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: BASE,
    description: `Software para entrenadores personales en ${ciudad.name}`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    areaServed: { '@type': 'City', name: ciudad.name, containedInPlace: { '@type': 'State', name: ciudad.region } },
    audience: { '@type': 'Audience', audienceType: 'Entrenadores personales' },
    faqPage: {
      '@type': 'FAQPage',
      mainEntity: FAQS(ciudad.name).map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  }

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
              <Link href="/blog" style={linkStyle}>Blog</Link>
              <Link href="/pricing" style={linkStyle}>Precios</Link>
              <Link href="/es/#cta-final" style={ctaStyle}>Lista de espera</Link>
            </div>
          </div>
        </nav>

        <main>
          {/* Hero */}
          <section style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}>
            <p style={eyebrowStyle}>
              {ciudad.region} · Entrenadores personales
            </p>
            <h1 style={h1Style}>
              Software para entrenadores personales en {ciudad.name}
            </h1>
            <p style={subtitleStyle}>
              Gestiona tus clientes {ciudad.gentilicio ? `— y los de toda España —` : ''} desde un solo lugar.
              Rutinas, pagos automáticos, seguimiento y mensajería. Sin app que descargar.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
              <Link href="/es/#cta-final" style={primaryCta}>
                Únete a la lista de espera — gratis
              </Link>
              <Link href="/pricing" style={secondaryCta}>
                Ver precios
              </Link>
            </div>
          </section>

          {/* Features */}
          <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' }}>
            <h2 style={sectionTitleStyle}>
              Todo lo que necesitas para gestionar tu negocio en {ciudad.name}
            </h2>
            <div style={gridStyle}>
              {FEATURES.map(f => (
                <div key={f.title} style={cardStyle}>
                  <span style={{ fontSize: '28px', display: 'block', marginBottom: '12px' }}>{f.icon}</span>
                  <h3 style={cardTitleStyle}>{f.title}</h3>
                  <p style={cardDescStyle}>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Value prop */}
          <section style={{ background: 'rgba(143,212,58,0.04)', borderTop: '1px solid rgba(143,212,58,0.1)', borderBottom: '1px solid rgba(143,212,58,0.1)', padding: '64px 24px' }}>
            <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ ...sectionTitleStyle, marginBottom: '16px' }}>
                Deja de gestionar en Excel y WhatsApp
              </h2>
              <p style={{ ...subtitleStyle, marginBottom: '40px' }}>
                Los entrenadores personales en {ciudad.name} pierden de media 6 horas semanales en tareas administrativas.
                TrainerBoost las automatiza para que puedas centrarte en entrenar.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'center' }}>
                {[
                  { stat: '6h', label: 'semanales recuperadas' },
                  { stat: '+40%', label: 'más retención de clientes' },
                  { stat: '0€', label: 'comisiones en pagos' },
                ].map(({ stat, label }) => (
                  <div key={stat}>
                    <p style={{ fontSize: '36px', fontWeight: 800, color: '#8FD43A', lineHeight: 1, marginBottom: '6px' }}>{stat}</p>
                    <p style={{ fontSize: '13px', color: 'rgba(232,228,217,0.5)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 24px' }}>
            <h2 style={{ ...sectionTitleStyle, textAlign: 'left', marginBottom: '32px' }}>
              Preguntas frecuentes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {FAQS(ciudad.name).map(({ q, a }, i) => (
                <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '24px 0' }}>
                  <p style={{ fontWeight: 600, fontSize: '16px', color: '#E8E4D9', marginBottom: '10px' }}>{q}</p>
                  <p style={{ fontSize: '14px', color: 'rgba(232,228,217,0.6)', lineHeight: 1.7 }}>{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA final */}
          <section style={{ maxWidth: '640px', margin: '0 auto', padding: '0 24px 100px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#E8E4D9', marginBottom: '12px' }}>
              Únete a los entrenadores de {ciudad.name} en lista de espera
            </h2>
            <p style={{ ...subtitleStyle, marginBottom: '32px' }}>
              Acceso anticipado. Sin coste. Sin compromisos.
            </p>
            <Link href="/es/#cta-final" style={{ ...primaryCta, display: 'inline-block' }}>
              Apuntarme ahora — es gratis
            </Link>
          </section>
        </main>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
              <Link href="/es/" style={linkStyle}>Inicio</Link>
              <Link href="/blog" style={linkStyle}>Blog</Link>
              <Link href="/pricing" style={linkStyle}>Precios</Link>
              <Link href="/privacidad" style={linkStyle}>Privacidad</Link>
              <Link href="/terminos" style={linkStyle}>Términos</Link>
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

// ── Estilos inline ────────────────────────────────────────────────────────────

const linkStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '11px',
  letterSpacing: '0.1em',
  color: 'rgba(232,228,217,0.5)',
  textDecoration: 'none',
  textTransform: 'uppercase',
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

const eyebrowStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '11px',
  letterSpacing: '0.14em',
  color: '#8FD43A',
  textTransform: 'uppercase',
  marginBottom: '16px',
}

const h1Style: React.CSSProperties = {
  fontSize: 'clamp(28px, 5vw, 52px)',
  fontWeight: 800,
  lineHeight: 1.1,
  color: '#E8E4D9',
  marginBottom: '20px',
}

const subtitleStyle: React.CSSProperties = {
  fontSize: '18px',
  color: 'rgba(232,228,217,0.6)',
  lineHeight: 1.65,
  maxWidth: '600px',
  margin: '0 auto',
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 'clamp(22px, 3vw, 32px)',
  fontWeight: 800,
  color: '#E8E4D9',
  textAlign: 'center',
  marginBottom: '40px',
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px',
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '8px',
  padding: '28px',
}

const cardTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#E8E4D9',
  marginBottom: '8px',
}

const cardDescStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'rgba(232,228,217,0.55)',
  lineHeight: 1.65,
}

const primaryCta: React.CSSProperties = {
  background: '#8FD43A',
  color: '#050805',
  padding: '14px 28px',
  borderRadius: '8px',
  fontWeight: 700,
  fontSize: '15px',
  textDecoration: 'none',
  display: 'inline-block',
}

const secondaryCta: React.CSSProperties = {
  background: 'transparent',
  color: '#E8E4D9',
  padding: '14px 28px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '15px',
  textDecoration: 'none',
  border: '1px solid rgba(255,255,255,0.15)',
  display: 'inline-block',
}
