import Link from 'next/link'
import { Zap, Users, Dumbbell, UtensilsCrossed, CalendarDays, MessageSquare, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-slate-100">
      {/* Nav */}
      <nav className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-brand-primary" />
            </div>
            <span className="font-bold text-white">TrainerBoost</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Precios</Link>
            <Link href="/login"   className="btn-secondary text-sm py-1.5">Iniciar sesión</Link>
            <Link href="/register" className="btn-primary text-sm py-1.5">Empezar gratis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-6">
          <Zap className="w-3.5 h-3.5 text-brand-primary" />
          <span className="text-xs font-semibold text-brand-primary">La plataforma #1 para entrenadores personales</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
          Gestiona tu negocio de<br />
          <span className="text-brand-primary">entrenamiento</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          Rutinas, nutrición, citas, mensajería y seguimiento de progreso en una sola plataforma.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="btn-primary text-base px-8 py-3">
            <Zap className="w-5 h-5" /> Empezar gratis
          </Link>
          <Link href="/pricing" className="btn-secondary text-base px-8 py-3">
            Ver planes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <p className="text-xs text-slate-500 mt-4">Sin tarjeta. Sin compromisos. Plan gratuito disponible.</p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Todo lo que necesitas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Users,           title: 'Gestión de clientes', desc: 'Perfil completo, historial, notas y seguimiento personalizado.' },
            { icon: Dumbbell,        title: 'Rutinas',             desc: 'Crea y asigna rutinas con ejercicios detallados.' },
            { icon: UtensilsCrossed, title: 'Nutrición',           desc: 'Planes nutricionales con macros y seguimiento calórico.' },
            { icon: CalendarDays,    title: 'Citas',               desc: 'Agenda sesiones presenciales, online o llamadas.' },
            { icon: MessageSquare,   title: 'Mensajería',          desc: 'Chat en tiempo real con tus clientes.' },
            { icon: Zap,             title: 'Progreso',            desc: 'Registra medidas y genera gráficas de evolución.' },
          ].map(feat => (
            <div key={feat.title} className="card-hover p-6">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-4">
                <feat.icon className="w-5 h-5 text-brand-primary" />
              </div>
              <h3 className="font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-4">Empieza hoy mismo</h2>
          <p className="text-slate-400 mb-8">Desde 29€/mes. Cancela cuando quieras.</p>
          <Link href="/register" className="btn-primary text-base px-10 py-4">
            <Zap className="w-5 h-5" /> Crear cuenta gratis
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-primary" />
            TrainerBoost © 2025
          </div>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-white transition-colors">Precios</Link>
            <Link href="/login"   className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
