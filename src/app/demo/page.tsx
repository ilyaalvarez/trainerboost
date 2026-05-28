import Link from 'next/link'
import { Zap, Users, ArrowRight, ArrowLeft, Eye } from 'lucide-react'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">TrainerBoost</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login"    className="text-sm text-slate-400 hover:text-white transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="btn-primary text-sm py-1.5 px-4">Empezar gratis</Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-10 transition-colors self-start max-w-2xl w-full">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="text-center mb-12 max-w-2xl">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-primary"
               style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
            <Eye className="w-7 h-7 text-white" />
          </div>
          <div className="chip mb-4 mx-auto w-fit">Sin registro · Sin tarjeta</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Explora TrainerBoost<br />
            <span className="gradient-text">antes de registrarte</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Elige qué experiencia quieres ver. Los datos son de demostración — exactamente como se verá tu cuenta real.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Trainer */}
          <Link href="/demo/trainer" className="card-hover p-8 group block">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-glow-sm transition-transform duration-200 group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}
            >
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Soy entrenador</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Ve el panel completo: clientes, rutinas, citas de hoy, mensajes y analytics.
            </p>
            <ul className="space-y-1.5 mb-6 text-xs text-slate-400">
              {['Dashboard con métricas reales', 'Lista de clientes activos', 'Citas del día', 'Mensajes recientes'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm group-hover:gap-3 transition-all">
              Ver panel del entrenador <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Client */}
          <Link href="/demo/client" className="card-hover p-8 group block">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-glow-sm transition-transform duration-200 group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)' }}
            >
              <Users className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Soy cliente</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Mira lo que recibirá cada uno de tus clientes: rutinas, nutrición, progreso y mensajes.
            </p>
            <ul className="space-y-1.5 mb-6 text-xs text-slate-400">
              {['Rutina del día con ejercicios', 'Seguimiento de progreso', 'Plan nutricional', 'Chat con el entrenador'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-brand-accent font-semibold text-sm group-hover:gap-3 transition-all">
              Ver portal del cliente <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        <p className="text-center text-sm text-slate-500 mt-10">
          ¿Convencido?{' '}
          <Link href="/register" className="text-brand-primary hover:underline font-medium">
            Crear cuenta gratis →
          </Link>
        </p>
      </div>
    </div>
  )
}
