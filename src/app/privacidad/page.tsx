import type { Metadata } from 'next'
import Link from 'next/link'
import LogoFull from '@/components/logo/LogoFull'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Información sobre el tratamiento de tus datos personales en TrainerBoost, de acuerdo con el RGPD y la LOPDGDD.',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = '18 de junio de 2026'

export default function PrivacidadPage() {
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
            Legal · RGPD · LOPDGDD
          </p>
          <h1 style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.1, margin: '0 0 16px', textTransform: 'uppercase' }}>
            Política de<br />Privacidad
          </h1>
          <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', color: 'rgba(232,228,217,0.45)', letterSpacing: '0.08em' }}>
            Última actualización: {LAST_UPDATED}
          </p>
        </div>

        <LegalSection title="1. Responsable del tratamiento">
          <p>El responsable del tratamiento de tus datos personales es:</p>
          <ul>
            <li><strong>Denominación social:</strong> TrainerBoost (titular en proceso de constitución como SL)</li>
            <li><strong>NIF del titular provisional:</strong> <em>[COMPLETAR ANTES DEL LANZAMIENTO]</em></li>
            <li><strong>Domicilio:</strong> <em>[COMPLETAR ANTES DEL LANZAMIENTO]</em></li>
            <li><strong>Email de contacto:</strong>{' '}
              <a href="mailto:privacidad@trainerboost.es" style={{ color: '#8FD43A' }}>privacidad@trainerboost.es</a>
            </li>
            <li><strong>Web:</strong> https://trainerboost.es</li>
          </ul>
          <p>
            A efectos del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo
            (RGPD) y de la Ley Orgánica 3/2018, de Protección de Datos Personales y garantía
            de los derechos digitales (LOPDGDD), TrainerBoost actúa como <strong>responsable
            del tratamiento</strong> de los datos de los entrenadores que se registran en la
            plataforma, y como <strong>encargado del tratamiento</strong> de los datos que
            dichos entrenadores introducen sobre sus clientes.
          </p>
        </LegalSection>

        <LegalSection title="2. Datos que recopilamos y finalidad">
          <h3>2.1 Lista de espera (waitlist)</h3>
          <p>
            Cuando te apuntas a la lista de espera, recopilamos tu <strong>dirección de
            correo electrónico</strong>. La finalidad es informarte del lanzamiento de la
            plataforma y, si así lo solicitas, invitarte a participar en la beta privada.
          </p>
          <p>
            La base jurídica es el <strong>consentimiento explícito</strong> (Art. 6.1.a RGPD).
            Puedes revocar tu consentimiento en cualquier momento enviando un email a
            privacidad@trainerboost.es con el asunto &ldquo;Baja waitlist&rdquo;.
          </p>

          <h3>2.2 Cuenta de entrenador</h3>
          <p>
            Los entrenadores que crean una cuenta en TrainerBoost nos proporcionan:
            nombre, dirección de email, contraseña (cifrada), datos de facturación y,
            opcionalmente, fotografía de perfil. La finalidad es la prestación del servicio
            contratado.
          </p>
          <p>
            La base jurídica es la <strong>ejecución de un contrato</strong> (Art. 6.1.b RGPD)
            y el cumplimiento de obligaciones legales (Art. 6.1.c RGPD) para los datos de
            facturación.
          </p>

          <h3>2.3 Datos de clientes del entrenador</h3>
          <p>
            Los entrenadores pueden introducir en la plataforma datos de sus propios clientes:
            nombre, email, teléfono, fecha de nacimiento, mediciones corporales, registros de
            progreso y, en su caso, información de salud (historial de lesiones, condición física,
            objetivos médicamente relevantes).
          </p>
          <p>
            Respecto a estos datos, TrainerBoost actúa como <strong>encargado del
            tratamiento</strong> por cuenta del entrenador, quien es el responsable del
            tratamiento frente a sus clientes. El entrenador es responsable de obtener el
            consentimiento de sus clientes para el tratamiento de sus datos, incluida la
            posibilidad de que se aloje en los servidores de TrainerBoost.
          </p>
          <p>
            Los datos de salud son considerados categorías especiales de datos (Art. 9 RGPD)
            y únicamente se tratan cuando el entrenador ha obtenido el consentimiento explícito
            de su cliente o cuando es necesario para la prestación de servicios de salud o
            actividad física bajo la responsabilidad del entrenador.
          </p>

          <h3>2.4 Datos de uso y técnicos</h3>
          <p>
            Recopilamos automáticamente datos de navegación y uso de la plataforma (páginas
            visitadas, funciones utilizadas, tiempos de sesión), así como datos técnicos del
            dispositivo (dirección IP, tipo de navegador, sistema operativo). La finalidad es
            mejorar la plataforma, detectar errores y garantizar la seguridad.
          </p>
          <p>
            La base jurídica es el interés legítimo (Art. 6.1.f RGPD).
          </p>
        </LegalSection>

        <LegalSection title="3. Plazos de conservación">
          <ul>
            <li><strong>Lista de espera:</strong> Hasta que se revoque el consentimiento o hasta 12 meses desde la última interacción, lo que ocurra antes.</li>
            <li><strong>Datos de cuenta de entrenador:</strong> Durante la vigencia de la relación contractual y, tras la baja, durante 5 años por obligaciones fiscales y mercantiles.</li>
            <li><strong>Datos de clientes del entrenador:</strong> Durante el tiempo que el entrenador mantenga su cuenta activa. Al dar de baja la cuenta, el entrenador puede exportar sus datos. Transcurridos 30 días desde la baja, los datos se eliminan definitivamente de nuestros servidores.</li>
            <li><strong>Registros de auditoría (logs):</strong> Máximo 12 meses por motivos de seguridad.</li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Destinatarios y transferencias internacionales">
          <p>
            Los datos se alojan en servidores situados en la <strong>Unión Europea</strong>
            (región eu-west-1). No realizamos transferencias internacionales fuera del Espacio
            Económico Europeo salvo lo indicado a continuación.
          </p>
          <p>Los subencargados del tratamiento con los que trabajamos son:</p>
          <ul>
            <li><strong>Supabase Inc.</strong> (infraestructura de base de datos) — servidores EU; acuerdo de encargo del tratamiento en vigor.</li>
            <li><strong>Vercel Inc.</strong> (hosting y CDN) — servidores EU; acuerdo de encargo del tratamiento en vigor. Los logs de acceso pueden procesarse en EE.UU. bajo Cláusulas Contractuales Tipo (CCT) aprobadas por la Comisión Europea.</li>
            <li><strong>Stripe Inc.</strong> (procesamiento de pagos) — cumple con el RGPD bajo CCT; únicamente trata datos estrictamente necesarios para el cobro.</li>
            <li><strong>Resend Inc.</strong> (envío de emails transaccionales) — servidores EU; acuerdo de encargo del tratamiento en vigor.</li>
            <li><strong>Sentry Inc.</strong> (monitorización de errores) — servidores EU; acuerdo de encargo del tratamiento en vigor. No transmite datos de usuarios finales.</li>
          </ul>
          <p>
            No vendemos, cedemos ni compartimos tus datos con terceros para fines comerciales.
          </p>
        </LegalSection>

        <LegalSection title="5. Derechos de los interesados">
          <p>
            Conforme al RGPD y la LOPDGDD, puedes ejercer los siguientes derechos enviando
            un email a <a href="mailto:privacidad@trainerboost.es" style={{ color: '#8FD43A' }}>privacidad@trainerboost.es</a>:
          </p>
          <ul>
            <li><strong>Acceso (Art. 15 RGPD):</strong> Obtener confirmación de si tratamos tus datos y una copia de los mismos.</li>
            <li><strong>Rectificación (Art. 16 RGPD):</strong> Corregir datos inexactos o incompletos.</li>
            <li><strong>Supresión (&ldquo;derecho al olvido&rdquo;, Art. 17 RGPD):</strong> Solicitar la eliminación de tus datos cuando ya no sean necesarios.</li>
            <li><strong>Limitación del tratamiento (Art. 18 RGPD):</strong> Solicitar que suspendamos el tratamiento en determinadas circunstancias.</li>
            <li><strong>Portabilidad (Art. 20 RGPD):</strong> Recibir tus datos en formato estructurado, de uso común y lectura mecánica.</li>
            <li><strong>Oposición (Art. 21 RGPD):</strong> Oponerte al tratamiento basado en interés legítimo.</li>
            <li><strong>No ser objeto de decisiones automatizadas (Art. 22 RGPD):</strong> No aplicable actualmente; TrainerBoost no toma decisiones exclusivamente automatizadas con efectos jurídicos sobre los usuarios.</li>
          </ul>
          <p>
            Responderemos en el plazo máximo de <strong>30 días naturales</strong>. Si
            consideras que tus derechos no han sido atendidos adecuadamente, puedes presentar
            una reclamación ante la{' '}
            <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={{ color: '#8FD43A' }}>
              Agencia Española de Protección de Datos (AEPD)
            </a>.
          </p>
        </LegalSection>

        <LegalSection title="6. Cookies y tecnologías similares">
          <p>
            Para información completa sobre las cookies que utilizamos, consulta nuestra{' '}
            <Link href="/cookies" style={{ color: '#8FD43A' }}>Política de Cookies</Link>.
          </p>
          <h3>6.1 Cookies estrictamente necesarias</h3>
          <p>
            Utilizamos cookies de sesión para mantener tu sesión autenticada. Estas cookies
            son imprescindibles para el funcionamiento de la plataforma y no requieren
            consentimiento (Art. 22.2 LSSI-CE).
          </p>
          <h3>6.2 Cookies analíticas</h3>
          <p>
            Con tu consentimiento previo, utilizamos Plausible Analytics, que opera sin cookies
            identificadoras y recopila datos de forma agregada y anónima. No se comparte
            información con terceros para fines publicitarios.
          </p>
          <h3>6.3 Gestión del consentimiento</h3>
          <p>
            Al acceder por primera vez a trainerboost.es, te mostramos un banner de
            consentimiento. Puedes modificar tus preferencias en cualquier momento desde
            el pie de la página o en nuestra{' '}
            <Link href="/cookies" style={{ color: '#8FD43A' }}>Política de Cookies</Link>.
          </p>
          <h3>6.4 Cookies de terceros integrados</h3>
          <p>
            Stripe puede establecer cookies necesarias para la verificación antifraude
            durante el proceso de pago. Consulta la{' '}
            <a href="https://stripe.com/es/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#8FD43A' }}>
              política de privacidad de Stripe
            </a>.
          </p>
        </LegalSection>

        <LegalSection title="7. Seguridad de los datos">
          <p>
            Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos,
            entre ellas:
          </p>
          <ul>
            <li>Transmisión cifrada mediante TLS 1.3</li>
            <li>Contraseñas almacenadas con hashing bcrypt</li>
            <li>Acceso a la base de datos restringido mediante Row-Level Security (RLS)</li>
            <li>Acceso al panel de administración restringido por autenticación de dos factores</li>
            <li>Backups automáticos cifrados en infraestructura EU</li>
            <li>Monitorización de errores y alertas de seguridad en tiempo real</li>
          </ul>
          <p>
            En caso de violación de seguridad que pueda afectar a tus datos, notificaremos
            a la AEPD en el plazo de 72 horas y, si existe riesgo elevado, también te
            notificaremos directamente.
          </p>
        </LegalSection>

        <LegalSection title="8. Menores de edad">
          <p>
            TrainerBoost está dirigido exclusivamente a mayores de 18 años. No recopilamos
            conscientemente datos de menores. Si tienes conocimiento de que un menor ha
            proporcionado datos sin consentimiento parental, contacta con nosotros en
            privacidad@trainerboost.es para proceder a su eliminación inmediata.
          </p>
        </LegalSection>

        <LegalSection title="9. Encargo del tratamiento (contrato entrenador-TrainerBoost)">
          <p>
            Cuando un entrenador introduce datos de sus clientes en TrainerBoost, se establece
            automáticamente una relación de encargo del tratamiento conforme al Art. 28 RGPD.
            Los términos de dicho encargo están regulados en el{' '}
            <Link href="/terminos" style={{ color: '#8FD43A' }}>Contrato de Encargo del Tratamiento</Link>{' '}
            incluido en los Términos de Servicio.
          </p>
          <p>Garantizamos al entrenador (como responsable del tratamiento) que:</p>
          <ul>
            <li>Solo tratamos los datos de sus clientes siguiendo sus instrucciones.</li>
            <li>No utilizamos esos datos para fines propios.</li>
            <li>Implementamos las medidas de seguridad descritas en esta política.</li>
            <li>No cedemos los datos a terceros salvo a los subencargados listados en la sección 4.</li>
            <li>Asistimos al entrenador en el cumplimiento de los derechos de sus clientes.</li>
            <li>Eliminamos o devolvemos todos los datos al finalizar el servicio.</li>
          </ul>
        </LegalSection>

        <LegalSection title="10. Cambios en esta política">
          <p>
            Podemos actualizar esta política para reflejar cambios en la plataforma o
            en la legislación aplicable. Cuando los cambios sean relevantes, te avisaremos
            por email con al menos 30 días de antelación. La versión vigente estará siempre
            disponible en esta página con la fecha de última actualización.
          </p>
        </LegalSection>

        <LegalSection title="11. Contacto y reclamaciones">
          <p>Para cualquier consulta sobre privacidad o para ejercer tus derechos:</p>
          <ul>
            <li>Email: <a href="mailto:privacidad@trainerboost.es" style={{ color: '#8FD43A' }}>privacidad@trainerboost.es</a></li>
            <li>Plazo de respuesta: máximo 30 días naturales</li>
          </ul>
          <p>
            Si no estás satisfecho con nuestra respuesta, puedes reclamar ante la AEPD:{' '}
            <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={{ color: '#8FD43A' }}>
              www.aepd.es
            </a>
            {' '}— C/ Jorge Juan, 6, 28001 Madrid
          </p>
        </LegalSection>
      </main>

      <footer style={{ borderTop: '1px solid rgba(143,212,58,0.12)', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: 'rgba(232,228,217,0.3)', letterSpacing: '0.1em', margin: 0 }}>
          © 2026 TrainerBoost · España ·{' '}
          <Link href="/terminos" style={{ color: 'rgba(143,212,58,0.7)', textDecoration: 'none' }}>Términos</Link>
          {' · '}
          <Link href="/cookies" style={{ color: 'rgba(143,212,58,0.7)', textDecoration: 'none' }}>Cookies</Link>
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
