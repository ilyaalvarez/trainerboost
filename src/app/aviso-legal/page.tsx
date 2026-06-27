import type { Metadata } from 'next'
import Link from 'next/link'
import LogoFull from '@/components/logo/LogoFull'

export const metadata: Metadata = {
  title: 'Aviso Legal',
  description: 'Información legal sobre TrainerBoost conforme al Art. 10 de la LSSI-CE.',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = '18 de junio de 2026'

export default function AvisoLegalPage() {
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
            Legal · LSSI-CE Art. 10
          </p>
          <h1 style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.1, margin: '0 0 16px', textTransform: 'uppercase' }}>
            Aviso Legal
          </h1>
          <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', color: 'rgba(232,228,217,0.45)', letterSpacing: '0.08em' }}>
            Última actualización: {LAST_UPDATED}
          </p>
        </div>

        <LegalSection title="1. Datos del titular">
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios
            de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se ponen
            a disposición de los usuarios los siguientes datos identificativos:
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginTop: '16px' }}>
            <tbody>
              {[
                ['Titular', 'TrainerBoost'],
                ['NIF/CIF', '[COMPLETAR ANTES DEL LANZAMIENTO]'],
                ['Domicilio social', '[COMPLETAR ANTES DEL LANZAMIENTO]'],
                ['Correo electrónico', 'hola@trainerboost.es'],
                ['Sitio web', 'https://trainerboost.es'],
                ['Actividad', 'Software como Servicio (SaaS) para entrenadores personales'],
              ].map(([label, value]) => (
                <tr key={label} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 16px 10px 0', color: '#8FD43A', fontWeight: 600, fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', width: '140px', verticalAlign: 'top' }}>{label}</td>
                  <td style={{ padding: '10px 0', color: 'rgba(232,228,217,0.82)', verticalAlign: 'top' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </LegalSection>

        <LegalSection title="2. Objeto y ámbito de aplicación">
          <p>
            El presente Aviso Legal regula el acceso y uso del sitio web <strong>trainerboost.es</strong>{' '}
            y de la plataforma de gestión para entrenadores personales accesible desde dicho dominio.
          </p>
          <p>
            La mera navegación por el sitio web implica la aceptación de las condiciones
            recogidas en este Aviso Legal. Si no estás de acuerdo con ellas, debes
            abstenerte de usar el sitio.
          </p>
        </LegalSection>

        <LegalSection title="3. Condiciones de uso">
          <p>
            El usuario se compromete a hacer un uso adecuado y lícito de los contenidos
            y servicios ofrecidos a través de trainerboost.es, y en particular a:
          </p>
          <ul>
            <li>No realizar actividades ilícitas o contrarias a la buena fe y al orden público.</li>
            <li>No difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico o que atenten contra la dignidad de las personas.</li>
            <li>No provocar daños en los sistemas físicos y lógicos de TrainerBoost o de terceros.</li>
            <li>No introducir o difundir virus informáticos o cualquier otro sistema físico o lógico que sea susceptible de provocar daños.</li>
            <li>No intentar acceder, utilizar o manipular los datos de otros usuarios sin autorización.</li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Propiedad intelectual e industrial">
          <p>
            Todos los contenidos del sitio web —incluyendo, sin carácter limitativo, textos,
            fotografías, gráficos, imágenes, iconos, tecnología, software, diseño gráfico
            y códigos fuente— son propiedad de TrainerBoost o de terceros que han autorizado
            su uso, y están protegidos por derechos de propiedad intelectual e industrial.
          </p>
          <p>
            Queda expresamente prohibida la reproducción, distribución, transformación o
            comunicación pública de los contenidos del sitio web sin contar con la
            autorización expresa y por escrito de TrainerBoost.
          </p>
          <p>
            El nombre comercial <strong>TrainerBoost</strong>, su logotipo y el conjunto de
            elementos de la marca que identifican el servicio son titularidad de TrainerBoost
            y no pueden ser usados sin autorización.
          </p>
        </LegalSection>

        <LegalSection title="5. Exclusión de garantías y responsabilidad">
          <p>
            TrainerBoost no garantiza la disponibilidad y continuidad del funcionamiento
            del sitio web. Cuando ello sea razonablemente posible, se advertirá previamente
            de las interrupciones en el funcionamiento.
          </p>
          <p>
            TrainerBoost no se hace responsable de los daños y perjuicios de cualquier
            naturaleza que puedan derivarse de la falta de disponibilidad o de continuidad
            del sitio web, del engaño de la utilidad que los usuarios hubieren podido
            atribuir al sitio web o a los servicios.
          </p>
          <p>
            TrainerBoost no controla ni garantiza la ausencia de virus u otros elementos
            en los contenidos que puedan producir alteraciones en los sistemas informáticos
            de los usuarios.
          </p>
        </LegalSection>

        <LegalSection title="6. Cookies y privacidad">
          <p>
            El sitio web utiliza cookies propias y de terceros necesarias para el
            funcionamiento del servicio. Para más información, consulta nuestra{' '}
            <Link href="/cookies" style={{ color: '#8FD43A' }}>Política de Cookies</Link>.
          </p>
          <p>
            El tratamiento de los datos personales de los usuarios se realiza conforme
            al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).
            Para más información, consulta nuestra{' '}
            <Link href="/privacidad" style={{ color: '#8FD43A' }}>Política de Privacidad</Link>.
          </p>
        </LegalSection>

        <LegalSection title="7. Hiperenlaces">
          <p>
            El sitio web puede contener hiperenlaces a otros sitios web. TrainerBoost no
            ejerce ningún tipo de control sobre esos sitios ni sus contenidos, y no se
            hace responsable de los posibles daños producidos por su acceso y uso.
          </p>
        </LegalSection>

        <LegalSection title="8. Legislación aplicable y jurisdicción">
          <p>
            La relación entre TrainerBoost y el usuario se rige por la legislación
            española vigente. Para la resolución de cualquier controversia se someten,
            con renuncia expresa a cualquier otro fuero, a los Juzgados y Tribunales
            competentes según lo dispuesto en la normativa aplicable.
          </p>
          <p>
            Si el usuario es un consumidor, podrá acudir también a la Plataforma de
            Resolución de Litigios en Línea de la Comisión Europea disponible en{' '}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: '#8FD43A' }}>
              ec.europa.eu/consumers/odr
            </a>.
          </p>
        </LegalSection>

        <LegalSection title="9. Modificaciones">
          <p>
            TrainerBoost se reserva el derecho de efectuar sin previo aviso las
            modificaciones que considere oportunas en el sitio web, pudiendo cambiar,
            suprimir o añadir tanto los contenidos y servicios que se presten como la
            forma en que estos aparezcan presentados o localizados en el sitio web.
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
          <Link href="/cookies" style={{ color: 'rgba(143,212,58,0.7)', textDecoration: 'none' }}>Cookies</Link>
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
