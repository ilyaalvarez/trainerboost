import Link from 'next/link'
import { Zap } from 'lucide-react'

export const metadata = {
  title: 'Términos de servicio — TrainerBoost',
  description: 'Términos y condiciones de uso de TrainerBoost.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-slate-100">
      <nav className="border-b border-border/50 bg-background/85 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#8FD43A' }}>
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">TrainerBoost</span>
          </Link>
          <span className="text-slate-500 text-sm ml-2">/ Términos de servicio</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Términos de servicio</h1>
        <p className="text-slate-400 text-sm mb-10">Última actualización: 4 de junio de 2026</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Aceptación de los términos</h2>
            <p>Al crear una cuenta en TrainerBoost aceptas estos términos de servicio. Si no estás de acuerdo, no utilices el servicio.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Descripción del servicio</h2>
            <p>TrainerBoost es una plataforma SaaS diseñada para entrenadores personales que permite gestionar clientes, crear rutinas de entrenamiento, planes nutricionales, citas y comunicación directa. El portal del cliente permite a los clientes finales acceder a sus programas.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Cuentas de usuario</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Debes tener al menos 18 años para registrarte como entrenador.</li>
              <li>Eres responsable de mantener la confidencialidad de tu contraseña y de toda la actividad que ocurra en tu cuenta.</li>
              <li>Debes proporcionarnos información veraz y actualizada.</li>
              <li>Nos reservamos el derecho de cancelar cuentas que infrinjan estos términos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Planes y facturación</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los precios están disponibles en <Link href="/pricing" className="text-brand-primary hover:underline">trainerboost.es/pricing</Link> e incluyen IVA.</li>
              <li>La suscripción se renueva automáticamente al inicio de cada periodo de facturación.</li>
              <li>Puedes cancelar en cualquier momento desde la sección de facturación. La cancelación se aplica al final del periodo pagado.</li>
              <li>No realizamos reembolsos por periodos parciales, salvo obligación legal.</li>
              <li>Los precios pueden cambiar con un preaviso de 30 días por correo electrónico.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Uso aceptable</h2>
            <p>Queda prohibido:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usar la plataforma para actividades ilegales o que vulneren derechos de terceros.</li>
              <li>Compartir tu cuenta con terceros no autorizados.</li>
              <li>Intentar acceder a datos de otros usuarios o realizar ingeniería inversa del software.</li>
              <li>Enviar mensajes no solicitados (spam) a través del sistema de mensajería.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Responsabilidad del entrenador</h2>
            <p>Como entrenador, eres el único responsable del contenido de las rutinas, planes nutricionales y consejos que proporcionas a tus clientes. TrainerBoost es una herramienta de gestión y no asesora sobre cuestiones de salud o nutrición. Los clientes deben consultar con profesionales sanitarios antes de iniciar cualquier programa de ejercicio o dieta.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Propiedad intelectual</h2>
            <p>TrainerBoost y su contenido original (código, diseño, marca) son propiedad exclusiva de TrainerBoost. Tus datos (rutinas, planes, notas) son de tu propiedad y podemos exportarlos en formato estándar si los solicitas.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Disponibilidad del servicio</h2>
            <p>Nos comprometemos a mantener una disponibilidad del 99,5% mensual. Realizamos mantenimientos programados con aviso previo. No nos hacemos responsables de interrupciones causadas por terceros (servicios de nube, ISP, etc.).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Limitación de responsabilidad</h2>
            <p>En la máxima medida permitida por la ley, TrainerBoost no será responsable de daños indirectos, incidentales o consecuentes. Nuestra responsabilidad máxima no superará el importe pagado en los últimos 12 meses.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Legislación aplicable</h2>
            <p>Estos términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de España, sin perjuicio de los derechos reconocidos a los consumidores.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contacto</h2>
            <p>Para cualquier consulta sobre estos términos, escríbenos a <a href="mailto:hola@trainerboost.es" className="text-brand-primary hover:underline">hola@trainerboost.es</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-wrap gap-4 text-sm text-slate-500">
          <Link href="/privacy" className="hover:text-white transition-colors">Política de privacidad</Link>
          <Link href="/" className="hover:text-white transition-colors">Volver al inicio</Link>
        </div>
      </main>
    </div>
  )
}
