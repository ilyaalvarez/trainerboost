import Link from 'next/link'
import {
  Zap, Users, Dumbbell, UtensilsCrossed, CalendarDays,
  MessageSquare, ArrowRight, TrendingUp, CheckCircle2,
} from 'lucide-react'

const FEATURES = [
  { icon: Users,           bg: 'bg-sky-500/10 border-sky-500/20',     text: 'text-sky-400',
    title: 'Gestión de clientes',   desc: 'Perfil completo, historial y seguimiento personalizado.' },
  { icon: Dumbbell,        bg: 'bg-violet-500/10 border-violet-500/20', text: 'text-violet-400',
    title: 'Rutinas',               desc: 'Crea y asigna rutinas con ejercicios y seguimiento en tiempo real.' },
  { icon: UtensilsCrossed, bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400',
    title: 'Nutrición',             desc: 'Planes nutricionales con macros y seguimiento calórico personalizado.' },
  { icon: CalendarDays,    bg: 'bg-amber-500/10 border-amber-500/20',   text: 'text-amber-400',
    title: 'Citas',                 desc: 'Agenda sesiones presenciales, online o por llamada.' },
  { icon: MessageSquare,   bg: 'bg-pink-500/10 border-pink-500/20',     text: 'text-pink-400',
    title: 'Mensajería',            desc: 'Chat en tiempo real. Mantén a tus clientes motivados.' },
  { icon: TrendingUp,      bg: 'bg-teal-500/10 border-teal-500/20',     text: 'text-teal-400',
    title: 'Progreso',              desc: 'Visualiza la evolución con gráficas y fotos de progreso.' },
]

const STATS = [
  { value: '500+',   label: 'Entrenadores activos' },
  { value: '8.000+', label: 'Clientes gestionados' },
  { value: '4.9★',   label: 'Valoración media' },
]

const STEPS = [
  { n: '1', title: 'Regístrate gratis',       desc: 'Crea tu cuenta en 2 minutos. Sin tarjeta de crédito.' },
  { n: '2', title: 'Añade tus clientes',      desc: 'Invítalos por email o enlace y configura sus rutinas.' },
  { n: '3', title: 'Gestiona todo en uno',    desc: 'Citas, nutrición, mensajes y progreso desde un solo panel.' },
]

const TRUST = ['Sin tarjeta de crédito', 'Soporte incluido', 'Cancela cuando quieras']

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-slate-100 overflow-x-hidden">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-glow-sm"
              style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base tracking-tight">TrainerBoost</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block px-3 py-1.5">Precios</Link>
            <Link href="/demo"    className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block px-3 py-1.5">Ver demo</Link>
            <Link href="/login"   className="btn-ghost text-sm py-1.5 px-3">Iniciar sesión</Link>
            <Link href="/register" className="btn-primary text-sm py-1.5 px-4">Empezar gratis</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-glow"
             style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)' }} />
        <div className="absolute top-16 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)' }} />

        <div className="relative">
          <div className="chip mb-6 mx-auto w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse inline-block" />
            Gratis para empezar · Sin tarjeta de crédito
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6 text-balance">
            Gestiona tu negocio de<br />
            <span className="gradient-text">entrenamiento</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 text-balance leading-relaxed">
            Rutinas, nutrición, citas, mensajería y progreso de clientes.
            Todo en una plataforma diseñada para entrenadores personales.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Link href="/register" className="btn-gradient text-base px-8 py-3">
              <Zap className="w-4 h-4" /> Empezar gratis
            </Link>
            <Link href="/demo" className="btn-secondary text-base px-8 py-3">
              Ver demo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-xs text-slate-500">Sin tarjeta · Plan gratuito disponible · Cancela cuando quieras</p>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────────────────── */}
      <div className="border-y border-border/50 py-8 bg-surface/20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 text-center">
            {STATS.map((stat, i) => (
              <div key={stat.value} className={i > 0 ? 'border-l border-border/50' : ''}>
                <div className="text-3xl font-bold font-mono gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cómo funciona ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <div className="chip-accent mb-4 mx-auto w-fit">Proceso simple</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Empieza en 3 pasos</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Sin configuraciones complejas. En minutos ya tienes tu panel listo.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map(step => (
            <div key={step.n} className="card p-8 text-center relative">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5 text-white font-bold text-xl shadow-glow-sm"
                style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}
              >
                {step.n}
              </div>
              <h3 className="font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="text-center mb-14">
          <div className="chip mb-4 mx-auto w-fit">Funcionalidades</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Todo lo que necesitas para crecer</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Desde la primera sesión hasta el seguimiento a largo plazo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(feat => (
            <div key={feat.title} className="card-hover p-6 group">
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110 ${feat.bg}`}>
                <feat.icon className={`w-5 h-5 ${feat.text}`} />
              </div>
              <h3 className="font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo preview ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="text-center mb-14">
          <div className="chip mb-4 mx-auto w-fit">Demo interactiva</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Descubre lo que te espera
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Explora el panel antes de registrarte. Sin cuenta, sin tarjeta.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Trainer demo */}
          <Link href="/demo/trainer" className="card-hover p-6 group block">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-glow-sm shrink-0"
                   style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white">Panel Entrenador</div>
                <div className="text-xs text-slate-400">Clientes, rutinas, citas y analytics</div>
              </div>
            </div>

            {/* Browser mockup */}
            <div className="rounded-xl bg-background border border-border overflow-hidden mb-5">
              <div className="bg-surface-2 px-3 py-2 border-b border-border flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/40" />
                <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                <div className="flex-1 mx-3 bg-surface rounded-md h-4 flex items-center justify-center">
                  <span className="text-[9px] text-slate-500">trainerboost.es/demo/trainer</span>
                </div>
              </div>
              <div className="flex">
                <div className="w-28 bg-surface border-r border-border p-2 space-y-1">
                  {['Panel', 'Clientes', 'Rutinas', 'Nutrición', 'Citas', 'Mensajes'].map((item, i) => (
                    <div key={item}
                         className={`text-[9px] px-2 py-1 rounded ${i === 0 ? 'text-sky-400 font-semibold' : 'text-slate-500'}`}
                         style={i === 0 ? { background: 'linear-gradient(90deg, rgba(14,165,233,0.12), transparent)' } : {}}>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="h-10 rounded bg-surface border border-border p-2">
                      <div className="text-[8px] text-slate-500">Clientes activos</div>
                      <div className="text-xs font-bold text-white">4</div>
                    </div>
                    <div className="h-10 rounded bg-surface border border-border p-2">
                      <div className="text-[8px] text-slate-500">Citas hoy</div>
                      <div className="text-xs font-bold text-white">2</div>
                    </div>
                  </div>
                  <div className="h-14 rounded bg-surface border border-border p-2">
                    <div className="text-[8px] text-slate-500 mb-1">Citas de hoy</div>
                    <div className="text-[9px] text-slate-300">09:00 · Ana García · Online</div>
                    <div className="text-[9px] text-slate-300">11:30 · Pedro López · Presencial</div>
                  </div>
                  <div className="h-10 rounded bg-surface border border-border p-2 space-y-0.5">
                    <div className="text-[9px] text-slate-300 flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-sky-500/20 shrink-0" />Ana García
                    </div>
                    <div className="text-[9px] text-slate-300 flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-violet-500/20 shrink-0" />Pedro López
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm group-hover:gap-3 transition-all">
              Ver demo del entrenador <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Client demo */}
          <Link href="/demo/client" className="card-hover p-6 group block">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-glow-sm shrink-0"
                   style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)' }}>
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white">Portal Cliente</div>
                <div className="text-xs text-slate-400">Rutinas, progreso y mensajes</div>
              </div>
            </div>

            {/* Browser mockup */}
            <div className="rounded-xl bg-background border border-border overflow-hidden mb-5">
              <div className="bg-surface-2 px-3 py-2 border-b border-border flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/40" />
                <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                <div className="flex-1 mx-3 bg-surface rounded-md h-4 flex items-center justify-center">
                  <span className="text-[9px] text-slate-500">trainerboost.es/demo/client</span>
                </div>
              </div>
              <div className="p-3">
                <div className="flex gap-2 pb-2 mb-3 border-b border-border overflow-hidden">
                  {['Progreso', 'Mi Rutina', 'Nutrición', 'Citas', 'Mensajes'].map((item, i) => (
                    <div key={item}
                         className={`text-[9px] px-2 py-0.5 rounded whitespace-nowrap ${i === 1 ? 'bg-brand-primary/15 text-brand-primary font-semibold' : 'text-slate-500'}`}>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="text-[9px] font-semibold text-white mb-2">Fuerza + Hipertrofia · Hoy</div>
                <div className="space-y-1.5">
                  {[
                    { name: 'Press banca', sets: '4×10', done: true },
                    { name: 'Sentadilla', sets: '4×8', done: true },
                    { name: 'Remo con barra', sets: '3×12', done: false },
                    { name: 'Press militar', sets: '3×10', done: false },
                  ].map(ex => (
                    <div key={ex.name} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center text-[8px] ${ex.done ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'border-border text-slate-500'}`}>
                        {ex.done ? '✓' : ''}
                      </div>
                      <span className={`text-[9px] flex-1 ${ex.done ? 'line-through text-slate-500' : 'text-slate-300'}`}>{ex.name}</span>
                      <span className="text-[9px] text-slate-500">{ex.sets}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-brand-accent font-semibold text-sm group-hover:gap-3 transition-all">
              Ver demo del cliente <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.06) 0%, transparent 65%)' }} />
        <div className="absolute inset-0 border-y border-border/50 pointer-events-none" />

        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <div className="chip mb-6 mx-auto w-fit">Gratis para siempre</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
            Tu negocio merece<br />
            <span className="gradient-text">las mejores herramientas</span>
          </h2>
          <p className="text-slate-400 mb-10 text-lg">Empieza gratis. Escala cuando lo necesites.</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link href="/register" className="btn-gradient text-base px-10 py-3.5">
              <Zap className="w-4 h-4" /> Crear cuenta gratis
            </Link>
            <Link href="/demo" className="btn-secondary text-base px-6 py-3.5">
              Ver demo primero →
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {TRUST.map(t => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white text-sm">TrainerBoost</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                La plataforma todo-en-uno para entrenadores personales.
              </p>
            </div>
            <div className="flex gap-8 text-sm">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Producto</div>
                <Link href="/pricing"      className="block text-slate-400 hover:text-white transition-colors">Precios</Link>
                <Link href="/demo"         className="block text-slate-400 hover:text-white transition-colors">Demo</Link>
                <Link href="/login"        className="block text-slate-400 hover:text-white transition-colors">Iniciar sesión</Link>
                <Link href="/register"     className="block text-slate-400 hover:text-white transition-colors">Registrarse</Link>
              </div>
            </div>
          </div>

          <div className="divider mt-10 mb-6" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>© 2025 TrainerBoost. Todos los derechos reservados.</span>
            <span>Hecho con ♥ para entrenadores que se toman en serio su negocio</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
