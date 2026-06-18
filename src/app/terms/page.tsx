import type { Metadata } from 'next'
import Link from 'next/link'
import LogoFull from '@/components/logo/LogoFull'

export const metadata: Metadata = {
  title: 'Términos de Servicio',
  description: 'Condiciones generales de uso y contratación de TrainerBoost, plataforma SaaS para entrenadores personales.',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = '18 de junio de 2026'

export default function TermsPage() {
  return (
    <div style={{ background: '#080810', minHeight: '100vh', color: '#E8E4D9' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(212,137,42,0.12)', padding: '0 24px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" aria-label="Volver a TrainerBoost"><LogoFull height={20} /></Link>
          <Link href="/" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', letterSpacing: '0.1em', color: 'rgba(232,228,217,0.5)', textDecoration: 'none', textTransform: 'uppercase' }}>
            ← Volver
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: '780px', margin: '0 auto', padding: '64px 24px 120px' }}>
        <div style={{ marginBottom: '48px' }}>
          <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', letterSpacing: '0.12em', color: '#D4892A', textTransform: 'uppercase', marginBottom: '12px' }}>
            Legal · Condiciones · Contrato de servicio
          </p>
          <h1 style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.1, margin: '0 0 16px', textTransform: 'uppercase' }}>
            Términos de<br />Servicio
          </h1>
          <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', color: 'rgba(232,228,217,0.45)', letterSpacing: '0.08em' }}>
            Última actualización: {LAST_UPDATED}
          </p>
        </div>

        <LegalSection title="1. Aceptación de los términos">
          <p>
            El acceso y uso de TrainerBoost (en adelante, &ldquo;la Plataforma&rdquo; o &ldquo;el Servicio&rdquo;)
            implica la aceptación plena y sin reservas de los presentes Términos de Servicio
            (&ldquo;Términos&rdquo;). Si no estás de acuerdo con alguna de estas condiciones, debes
            abstenerte de utilizar la Plataforma.
          </p>
          <p>
            Estos Términos son un contrato legalmente vinculante entre tú (&ldquo;Usuario&rdquo;,
            &ldquo;Entrenador&rdquo; o &ldquo;Cliente&rdquo;, según corresponda) y TrainerBoost, cuyo titular opera
            bajo legislación española.
          </p>
          <p>
            Estos Términos se rigen por el Derecho español y, en particular, por el Real
            Decreto Legislativo 1/2007 (TRLGDCU), la Ley 34/2002 de Servicios de la Sociedad
            de la Información (LSSI), el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica
            3/2018 (LOPDGDD).
          </p>
        </LegalSection>

        <LegalSection title="2. Descripción del servicio">
          <p>
            TrainerBoost es una plataforma SaaS (Software as a Service) dirigida a
            entrenadores personales en España que permite:
          </p>
          <ul>
            <li>Gestionar clientes, rutinas de entrenamiento y planes nutricionales.</li>
            <li>Ofrecer a los clientes un portal web personal para visualizar su progreso.</li>
            <li>Gestionar citas y comunicaciones con los clientes.</li>
            <li>Procesar pagos mediante Stripe.</li>
            <li>Llevar un seguimiento de logros, hábitos y check-ins semanales.</li>
          </ul>

          <h3>2.1 Estado del servicio — Beta privada</h3>
          <p>
            A la fecha de estos Términos, TrainerBoost se encuentra en fase de <strong>beta
            privada</strong>. Esto significa que el Servicio puede presentar funcionalidades
            incompletas, errores o interrupciones. Trabajamos activamente para mejorar la
            estabilidad y completar el conjunto de funcionalidades antes del lanzamiento público.
          </p>
          <p>
            Durante la beta, TrainerBoost no garantiza la disponibilidad continua del
            Servicio ni que todas las funcionalidades anunciadas estén disponibles desde el
            primer día. Te informaremos de las interrupciones planificadas con la mayor
            antelación posible.
          </p>

          <h3>2.2 Aviso sobre consejo de salud</h3>
          <p>
            <strong>TrainerBoost es una herramienta de gestión y no presta servicios médicos,
            de fisioterapia ni de nutrición clínica.</strong> Los planes de entrenamiento
            y nutricionales introducidos en la plataforma son responsabilidad del entrenador
            que los crea. TrainerBoost no revisa, valida ni garantiza la adecuación
            médica de dichos planes. Ante cualquier duda de salud, consulta con un
            profesional sanitario cualificado.
          </p>
        </LegalSection>

        <LegalSection title="3. Registro y cuenta">
          <p>
            Para acceder a las funcionalidades de la Plataforma debes crear una cuenta
            proporcionando información veraz, completa y actualizada. Eres responsable de:
          </p>
          <ul>
            <li>Mantener la confidencialidad de tus credenciales de acceso.</li>
            <li>Notificarnos de inmediato cualquier acceso no autorizado a tu cuenta.</li>
            <li>Toda actividad que se produzca bajo tu cuenta.</li>
          </ul>
          <p>
            Está prohibido compartir credenciales entre múltiples personas o crear cuentas
            bajo identidades falsas. Nos reservamos el derecho a suspender cuentas que
            incumplan estas condiciones.
          </p>
          <p>
            El registro en TrainerBoost está restringido a personas mayores de 18 años con
            capacidad legal para contratar.
          </p>
        </LegalSection>

        <LegalSection title="4. Planes, precios y facturación">
          <h3>4.1 Planes disponibles</h3>
          <p>
            TrainerBoost ofrece los siguientes planes de suscripción (precios en euros,
            IVA incluido):
          </p>
          <ul>
            <li><strong>Gratis:</strong> Hasta 3 clientes activos. Sin coste.</li>
            <li><strong>Starter:</strong> 19€/mes — hasta 10 clientes activos.</li>
            <li><strong>Pro:</strong> 39€/mes — hasta 30 clientes activos.</li>
            <li><strong>Unlimited:</strong> 79€/mes — clientes ilimitados.</li>
          </ul>
          <p>
            Los precios pueden actualizarse. En caso de subida de precio, notificaremos a
            los usuarios con al menos 30 días de antelación. Los usuarios existentes
            mantienen su precio actual hasta la siguiente renovación tras la notificación.
          </p>

          <h3>4.2 Facturación y renovación</h3>
          <p>
            Las suscripciones se facturan mensualmente de forma anticipada mediante Stripe.
            La suscripción se renueva automáticamente al inicio de cada período salvo que
            la canceles antes de la fecha de renovación.
          </p>

          <h3>4.3 Reembolsos</h3>
          <p>
            Dado que los servicios digitales están excluidos del derecho de desistimiento
            de 14 días cuando el servicio ya se ha prestado (Art. 103.a TRLGDCU), no
            emitimos reembolsos por períodos ya facturados. Sí emitiremos reembolso íntegro
            cuando el Servicio haya estado completamente inoperativo durante más del 10% del
            período facturado por causas imputables a TrainerBoost.
          </p>

          <h3>4.4 Cobros directos entrenador-cliente (Stripe Connect)</h3>
          <p>
            La función de cobros directos permite al entrenador generar enlaces de pago para
            sus clientes a través de Stripe Connect. TrainerBoost aplica una comisión de
            servicio del <strong>5%</strong> sobre cada cobro procesado mediante esta
            funcionalidad. Esta comisión está sujeta a cambios con 30 días de aviso previo.
          </p>
        </LegalSection>

        <LegalSection title="5. Uso aceptable">
          <p>El Usuario se compromete a no utilizar la Plataforma para:</p>
          <ul>
            <li>Actividades ilegales o que vulneren derechos de terceros.</li>
            <li>Introducir datos de clientes sin haber obtenido su consentimiento informado.</li>
            <li>Distribuir malware, spam o contenido fraudulento.</li>
            <li>Intentar acceder a datos de otros entrenadores o clientes.</li>
            <li>Realizar ingeniería inversa, descompilar o copiar el código fuente de la Plataforma.</li>
            <li>Sobrecargar la infraestructura mediante ataques automatizados o de denegación de servicio.</li>
            <li>Revender o sublicenciar el acceso a la Plataforma a terceros sin autorización escrita.</li>
          </ul>
          <p>
            El incumplimiento de estas normas puede resultar en la suspensión o cancelación
            inmediata de la cuenta, sin derecho a reembolso.
          </p>
        </LegalSection>

        <LegalSection title="6. Propiedad intelectual">
          <h3>6.1 Titularidad de TrainerBoost</h3>
          <p>
            Todos los derechos de propiedad intelectual sobre la Plataforma, su código,
            diseño, marcas, logotipos y documentación son titularidad exclusiva de TrainerBoost.
            No se concede ningún derecho sobre ellos más allá del uso del Servicio según
            estos Términos.
          </p>

          <h3>6.2 Contenido del entrenador</h3>
          <p>
            El entrenador conserva todos los derechos sobre el contenido que introduce en
            la Plataforma (rutinas, planes, materiales). Nos concede una licencia limitada,
            no exclusiva, para alojar y mostrar dicho contenido únicamente con el fin de
            prestar el Servicio.
          </p>
        </LegalSection>

        <LegalSection title="7. Protección de datos y encargo del tratamiento">
          <p>
            En el marco de la prestación del Servicio, TrainerBoost actúa como encargado
            del tratamiento de los datos personales que el entrenador introduce en la
            Plataforma sobre sus clientes, conforme al Art. 28 RGPD.
          </p>
          <p>
            El entrenador, como responsable del tratamiento, garantiza que:
          </p>
          <ul>
            <li>Ha informado a sus clientes del tratamiento de sus datos y ha obtenido los consentimientos necesarios.</li>
            <li>Ha cumplido con las obligaciones del RGPD y la LOPDGDD aplicables a su actividad.</li>
            <li>Los datos introducidos en la Plataforma no contienen información cuyo tratamiento esté prohibido o sea ilegal.</li>
          </ul>
          <p>
            Las condiciones detalladas del encargo del tratamiento se rigen por la{' '}
            <Link href="/privacy" style={{ color: '#D4892A' }}>Política de Privacidad</Link> de
            TrainerBoost, que forma parte integrante de estos Términos.
          </p>
        </LegalSection>

        <LegalSection title="8. Limitación de responsabilidad">
          <p>
            En la máxima medida permitida por la legislación aplicable:
          </p>
          <ul>
            <li>TrainerBoost no garantiza que el Servicio sea ininterrumpido, libre de errores o completamente seguro.</li>
            <li>TrainerBoost no es responsable de pérdidas de datos debidas a causas de fuerza mayor o errores del usuario.</li>
            <li>TrainerBoost no es responsable de los contenidos, planes de entrenamiento o consejos nutricionales introducidos por los entrenadores.</li>
            <li>En ningún caso la responsabilidad total de TrainerBoost frente al entrenador superará el importe abonado en los últimos 12 meses de suscripción.</li>
          </ul>
          <p>
            Nada de lo anterior limita la responsabilidad de TrainerBoost por fallecimiento
            o daños personales causados por negligencia, fraude o cualquier responsabilidad
            que no pueda excluirse legalmente.
          </p>
        </LegalSection>

        <LegalSection title="9. Disponibilidad y mantenimiento">
          <p>
            Nos comprometemos a mantener la Plataforma disponible en al menos el 99% del
            tiempo mensual (excluyendo mantenimientos programados). Notificaremos los
            mantenimientos programados con al menos 24 horas de antelación a través del
            email registrado.
          </p>
          <p>
            En caso de interrupciones no planificadas, informaremos del incidente y el
            tiempo estimado de resolución tan pronto como sea posible.
          </p>
        </LegalSection>

        <LegalSection title="10. Cancelación y baja">
          <h3>10.1 Por parte del entrenador</h3>
          <p>
            Puedes cancelar tu suscripción en cualquier momento desde la sección de facturación
            de tu cuenta. La cancelación tiene efecto al final del período facturado en curso.
            Antes de eliminar tu cuenta, puedes exportar todos tus datos en formato CSV/JSON
            desde el panel de configuración.
          </p>

          <h3>10.2 Por parte de TrainerBoost</h3>
          <p>
            Nos reservamos el derecho a suspender o cancelar cuentas que incumplan estos
            Términos, previa notificación con al menos 15 días de antelación salvo en casos
            de uso fraudulento o ilegal, en cuyo caso la suspensión puede ser inmediata.
          </p>

          <h3>10.3 Efecto de la cancelación sobre los datos</h3>
          <p>
            Tras la cancelación, el entrenador dispone de 30 días para exportar sus datos.
            Transcurrido ese plazo, todos los datos asociados a la cuenta serán eliminados
            permanentemente de nuestros servidores, salvo los que debamos conservar por
            obligación legal.
          </p>
        </LegalSection>

        <LegalSection title="11. Modificaciones de los términos">
          <p>
            Podemos modificar estos Términos para adaptarlos a cambios en el Servicio o en
            la legislación. En caso de cambios materiales, notificaremos a los usuarios
            por email con al menos 30 días de antelación. Si continúas usando la Plataforma
            tras la entrada en vigor de los nuevos Términos, se entenderá que los aceptas.
          </p>
        </LegalSection>

        <LegalSection title="12. Legislación y jurisdicción">
          <p>
            Estos Términos se rigen por el Derecho español. Para cualquier controversia
            derivada de su interpretación o ejecución, las partes se someten a los Juzgados
            y Tribunales competentes conforme a la legislación española, sin perjuicio de
            los fueros imperativos que correspondan a los consumidores.
          </p>
          <p>
            Si eres consumidor conforme a la normativa española (Art. 3 TRLGDCU), puedes
            también acceder a la plataforma europea de resolución de litigios en línea
            (ODR):{' '}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: '#D4892A' }}>
              ec.europa.eu/consumers/odr
            </a>.
          </p>
        </LegalSection>

        <LegalSection title="13. Contacto">
          <p>
            Para cualquier consulta sobre estos Términos:
          </p>
          <ul>
            <li>Email: <a href="mailto:legal@trainerboost.es" style={{ color: '#D4892A' }}>legal@trainerboost.es</a></li>
            <li>Web: <a href="https://trainerboost.es" style={{ color: '#D4892A' }}>trainerboost.es</a></li>
          </ul>
        </LegalSection>

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(212,137,42,0.12)', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: 'rgba(232,228,217,0.3)', letterSpacing: '0.1em', margin: 0 }}>
          © 2026 TrainerBoost · España ·{' '}
          <Link href="/privacy" style={{ color: 'rgba(212,137,42,0.7)', textDecoration: 'none' }}>Privacidad</Link>
        </p>
      </footer>
    </div>
  )
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '48px', paddingTop: '48px', borderTop: '1px solid rgba(212,137,42,0.08)' }}>
      <h2 style={{
        fontFamily: 'var(--font-display, sans-serif)',
        fontSize: '18px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
        color: '#D4892A', marginBottom: '20px',
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
