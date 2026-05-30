import Link from 'next/link'
import { Zap } from 'lucide-react'

export const metadata = {
  title: 'Política de privacidad — TrainerBoost',
  description: 'Política de privacidad de TrainerBoost. Cómo tratamos tus datos personales.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-slate-100">
      <nav className="border-b border-border/50 bg-background/85 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">TrainerBoost</span>
          </Link>
          <span className="text-slate-500 text-sm ml-2">/ Política de privacidad</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Política de privacidad</h1>
        <p className="text-slate-400 text-sm mb-10">Última actualización: 1 de junio de 2025</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Responsable del tratamiento</h2>
            <p>TrainerBoost (en adelante, «nosotros») es el responsable del tratamiento de los datos personales que recopilas al usar nuestra plataforma. Para cualquier consulta sobre privacidad puedes escribirnos a <a href="mailto:hola@trainerboost.es" className="text-brand-primary hover:underline">hola@trainerboost.es</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Datos que recopilamos</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-200">Datos de registro:</strong> nombre completo, dirección de correo electrónico y contraseña (almacenada en formato cifrado).</li>
              <li><strong className="text-slate-200">Datos de perfil:</strong> foto de perfil (opcional), teléfono (opcional), especialidades y biografía profesional.</li>
              <li><strong className="text-slate-200">Datos de uso:</strong> historial de rutinas, planes nutricionales, registros de progreso, citas, mensajes y fotos de progreso que los usuarios introducen voluntariamente.</li>
              <li><strong className="text-slate-200">Datos de pago:</strong> procesados íntegramente por Stripe; TrainerBoost no almacena datos de tarjetas bancarias.</li>
              <li><strong className="text-slate-200">Datos técnicos:</strong> dirección IP, tipo de navegador y datos de uso anónimos para mejorar el servicio.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Finalidad y base legal</h2>
            <p>Tratamos tus datos para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prestarte el servicio contratado (ejecución de contrato — art. 6.1.b RGPD).</li>
              <li>Enviarte notificaciones de la plataforma y recordatorios de citas (interés legítimo — art. 6.1.f RGPD).</li>
              <li>Cumplir con obligaciones legales (art. 6.1.c RGPD).</li>
              <li>Enviarte comunicaciones comerciales si nos das tu consentimiento (art. 6.1.a RGPD).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Conservación de datos</h2>
            <p>Conservamos tus datos mientras tu cuenta esté activa. Si cancelas tu cuenta, los eliminamos en un plazo máximo de 30 días, salvo que la ley nos obligue a conservarlos durante más tiempo.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Destinatarios de los datos</h2>
            <p>Compartimos datos únicamente con terceros necesarios para prestar el servicio:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-200">Supabase:</strong> almacenamiento de base de datos y autenticación (servidores en la UE).</li>
              <li><strong className="text-slate-200">Stripe:</strong> procesamiento de pagos (certificado PCI DSS).</li>
              <li><strong className="text-slate-200">Vercel:</strong> alojamiento de la aplicación.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Tus derechos</h2>
            <p>Como ciudadano de la UE/EEE tienes derecho a acceder a tus datos, rectificarlos, suprimirlos, limitar su tratamiento, oponerte a él y a la portabilidad. Ejerce estos derechos escribiendo a <a href="mailto:hola@trainerboost.es" className="text-brand-primary hover:underline">hola@trainerboost.es</a>. También puedes presentar una reclamación ante la <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">AEPD</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Cookies</h2>
            <p>Usamos cookies propias estrictamente necesarias para el funcionamiento de la plataforma (sesión de usuario) y cookies analíticas anónimas para mejorar el servicio. Puedes gestionar tus preferencias a través del banner de cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Seguridad</h2>
            <p>Aplicamos medidas técnicas y organizativas adecuadas (cifrado en tránsito mediante TLS, cifrado en reposo, acceso restringido mediante políticas RLS, auditorías de seguridad) para proteger tus datos.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Cambios en esta política</h2>
            <p>Podemos actualizar esta política. Si los cambios son significativos, te lo notificaremos por correo electrónico con al menos 30 días de antelación.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-wrap gap-4 text-sm text-slate-500">
          <Link href="/terms" className="hover:text-white transition-colors">Términos de servicio</Link>
          <Link href="/" className="hover:text-white transition-colors">Volver al inicio</Link>
        </div>
      </main>
    </div>
  )
}
