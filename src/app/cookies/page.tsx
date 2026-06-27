import type { Metadata } from 'next'
import Link from 'next/link'
import LogoFull from '@/components/logo/LogoFull'

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: 'Información sobre el uso de cookies en TrainerBoost, conforme a la LSSI-CE y el RGPD.',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = '18 de junio de 2026'

export default function CookiesPage() {
  return (
    <div style={{ background: '#080810', minHeight: '100vh', color: '#E8E4D9' }}>

      <nav style={{ borderBottom: '1px solid rgba(143,212,58,0.12)', padding: '0 24px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" aria-label="Volver a TrainerBoost"><LogoFull height={20} /></Link>
          <Link href="/" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', letterSpacing: '0.1em', color: 'rgba(232,228,217,0.5)', textDecoration: 'none', textTransform: 'uppercase' }}>
            ← Volver
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: '780px', margin: '0 auto', padding: '64px 24px 120px' }}>
        <div style={{ marginBottom: '48px' }}>
          <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', letterSpacing: '0.12em', color: '#8FD43A', textTransform: 'uppercase', marginBottom: '12px' }}>
            Legal · LSSI-CE · RGPD
          </p>
          <h1 style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.1, margin: '0 0 16px', textTransform: 'uppercase' }}>
            Política de<br />Cookies
          </h1>
          <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', color: 'rgba(232,228,217,0.45)', letterSpacing: '0.08em' }}>
            Última actualización: {LAST_UPDATED}
          </p>
        </div>

        <LegalSection title="1. ¿Qué son las cookies?">
          <p>
            Las cookies son pequeños ficheros de texto que los sitios web almacenan en tu
            navegador cuando los visitas. Permiten que el sitio recuerde información sobre
            tu visita (como tu idioma preferido o tu sesión iniciada), lo que facilita tu
            próxima visita y hace que el sitio sea más útil para ti.
          </p>
          <p>
            Esta política explica qué cookies utiliza trainerboost.es, con qué finalidad
            y cómo puedes gestionarlas, de conformidad con el Art. 22.2 de la Ley 34/2002
            de Servicios de la Sociedad de la Información (LSSI-CE) y el Reglamento (UE)
            2016/679 (RGPD).
          </p>
        </LegalSection>

        <LegalSection title="2. Cookies que utilizamos">
          <p>
            TrainerBoost utiliza únicamente las cookies estrictamente necesarias para el
            funcionamiento de la plataforma. No utilizamos cookies de publicidad ni de
            seguimiento de terceros con fines comerciales.
          </p>

          <h3>2.1 Cookies estrictamente necesarias</h3>
          <p>
            Estas cookies son imprescindibles para que puedas navegar por la plataforma y
            utilizar sus funcionalidades. Sin ellas, el servicio no puede prestarse.
            No requieren tu consentimiento (Art. 22.2 LSSI-CE).
          </p>

          <div style={{ overflowX: 'auto', margin: '20px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(143,212,58,0.2)' }}>
                  {['Nombre', 'Proveedor', 'Finalidad', 'Duración'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#8FD43A', fontWeight: 600, letterSpacing: '0.06em', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['sb-access-token', 'Supabase (propia)', 'Token de sesión autenticada', 'Sesión'],
                  ['sb-refresh-token', 'Supabase (propia)', 'Renovación automática del token de sesión', '60 días'],
                  ['tb_cookie_consent', 'TrainerBoost (propia)', 'Recordar preferencias de consentimiento de cookies', '12 meses'],
                ].map(([name, provider, purpose, duration], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '12px', color: 'rgba(232,228,217,0.9)' }}>{name}</td>
                    <td style={{ padding: '10px 12px', color: 'rgba(232,228,217,0.7)' }}>{provider}</td>
                    <td style={{ padding: '10px 12px', color: 'rgba(232,228,217,0.7)' }}>{purpose}</td>
                    <td style={{ padding: '10px 12px', color: 'rgba(232,228,217,0.7)', whiteSpace: 'nowrap' }}>{duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>2.2 Cookies de terceros durante el pago</h3>
          <p>
            Cuando realizas un pago a través de Stripe, este proveedor puede establecer
            cookies propias necesarias para la verificación antifraude y la seguridad
            de la transacción. Estas cookies están fuera del control de TrainerBoost y
            se rigen por la{' '}
            <a href="https://stripe.com/es/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#8FD43A' }}>
              política de privacidad de Stripe
            </a>.
          </p>

          <div style={{ overflowX: 'auto', margin: '20px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(143,212,58,0.2)' }}>
                  {['Nombre', 'Proveedor', 'Finalidad', 'Duración'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#8FD43A', fontWeight: 600, letterSpacing: '0.06em', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['__stripe_mid', 'Stripe (tercero)', 'Prevención de fraude en pagos', '1 año'],
                  ['__stripe_sid', 'Stripe (tercero)', 'Prevención de fraude en pagos', 'Sesión'],
                ].map(([name, provider, purpose, duration], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '12px', color: 'rgba(232,228,217,0.9)' }}>{name}</td>
                    <td style={{ padding: '10px 12px', color: 'rgba(232,228,217,0.7)' }}>{provider}</td>
                    <td style={{ padding: '10px 12px', color: 'rgba(232,228,217,0.7)' }}>{purpose}</td>
                    <td style={{ padding: '10px 12px', color: 'rgba(232,228,217,0.7)', whiteSpace: 'nowrap' }}>{duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>2.3 Analítica sin cookies</h3>
          <p>
            TrainerBoost utiliza <strong>Plausible Analytics</strong>, que <strong>no
            establece ninguna cookie</strong> en tu navegador y no recopila datos personales
            identificadores. Plausible mide el uso del sitio de forma agregada y anónima,
            sin rastrear usuarios individuales entre sesiones ni entre sitios web. Es
            conforme con el RGPD sin necesidad de consentimiento.
          </p>
        </LegalSection>

        <LegalSection title="3. Cómo gestionar las cookies">
          <p>
            Puedes configurar tu navegador para rechazar, bloquear o eliminar cookies.
            Ten en cuenta que si bloqueas las cookies estrictamente necesarias, algunas
            funcionalidades de la plataforma dejarán de funcionar correctamente.
          </p>
          <p>Instrucciones para los navegadores más habituales:</p>
          <ul>
            <li>
              <strong>Google Chrome:</strong>{' '}
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style={{ color: '#8FD43A' }}>
                Gestionar cookies en Chrome
              </a>
            </li>
            <li>
              <strong>Mozilla Firefox:</strong>{' '}
              <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" style={{ color: '#8FD43A' }}>
                Gestionar cookies en Firefox
              </a>
            </li>
            <li>
              <strong>Safari:</strong>{' '}
              <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" style={{ color: '#8FD43A' }}>
                Gestionar cookies en Safari
              </a>
            </li>
            <li>
              <strong>Microsoft Edge:</strong>{' '}
              <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" style={{ color: '#8FD43A' }}>
                Gestionar cookies en Edge
              </a>
            </li>
          </ul>
          <p>
            También puedes gestionar tus preferencias de consentimiento en cualquier
            momento haciendo clic en el enlace de configuración de cookies en el pie
            de página de nuestra web.
          </p>
        </LegalSection>

        <LegalSection title="4. Actualizaciones de esta política">
          <p>
            Podemos actualizar esta política cuando cambie la tecnología que utilizamos
            o la legislación aplicable. La fecha de &ldquo;última actualización&rdquo; en la parte
            superior refleja siempre la versión vigente. Te recomendamos revisarla
            periódicamente.
          </p>
        </LegalSection>

        <LegalSection title="5. Contacto">
          <p>
            Para cualquier pregunta sobre nuestra política de cookies o sobre el
            tratamiento de tus datos personales:
          </p>
          <ul>
            <li>Email: <a href="mailto:privacidad@trainerboost.es" style={{ color: '#8FD43A' }}>privacidad@trainerboost.es</a></li>
          </ul>
          <p>
            Consulta también nuestra{' '}
            <Link href="/privacidad" style={{ color: '#8FD43A' }}>Política de Privacidad</Link>{' '}
            para información completa sobre el tratamiento de tus datos.
          </p>
        </LegalSection>
      </main>

      <footer style={{ borderTop: '1px solid rgba(143,212,58,0.12)', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: 'rgba(232,228,217,0.3)', letterSpacing: '0.1em', margin: 0 }}>
          © 2026 TrainerBoost · España ·{' '}
          <Link href="/privacidad" style={{ color: 'rgba(143,212,58,0.7)', textDecoration: 'none' }}>Privacidad</Link>
          {' · '}
          <Link href="/terminos" style={{ color: 'rgba(143,212,58,0.7)', textDecoration: 'none' }}>Términos</Link>
          {' · '}
          <Link href="/aviso-legal" style={{ color: 'rgba(143,212,58,0.7)', textDecoration: 'none' }}>Aviso Legal</Link>
        </p>
      </footer>
    </div>
  )
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '48px', paddingTop: '48px', borderTop: '1px solid rgba(143,212,58,0.08)' }}>
      <h2 style={{
        fontFamily: 'var(--font-display, sans-serif)',
        fontSize: '18px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
        color: '#8FD43A', marginBottom: '20px',
      }}>
        {title}
      </h2>
      <div style={{
        fontFamily: 'var(--font-sans, sans-serif)',
        fontSize: '15px', lineHeight: 1.75, color: 'rgba(232,228,217,0.82)',
      }}>
        {children}
      </div>
    </section>
  )
}
