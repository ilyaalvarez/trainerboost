import Link from 'next/link'
import {
  Zap, Users, Dumbbell, UtensilsCrossed, CalendarDays,
  MessageSquare, ArrowRight, TrendingUp, CheckCircle2, Star,
  Play, Shield, Clock, BarChart3, ChevronRight,
  Smartphone, X,
} from 'lucide-react'
import { PLAN_CONFIG } from '@/lib/plans'

const PRICING_TIERS = [
  { key: 'starter' as const,   highlight: false },
  { key: 'pro' as const,       highlight: true  },
  { key: 'unlimited' as const, highlight: false },
]

const FAQS = [
  {
    q: '¿Necesito tarjeta de crédito para empezar?',
    a: 'No. Puedes registrarte gratis y gestionar hasta 3 clientes sin introducir ningún dato de pago. Solo pagas cuando decides crecer.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. Cancelas desde tu panel en un clic y mantienes el acceso hasta el final del periodo ya pagado. Sin permanencia ni penalizaciones.',
  },
  {
    q: '¿Mis datos y los de mis clientes están seguros?',
    a: 'Totalmente. Ciframos la información, alojamos los datos en servidores europeos y cumplimos el RGPD. Cada entrenador solo accede a sus propios clientes.',
  },
  {
    q: '¿Mis clientes necesitan pagar algo?',
    a: 'No. Tus clientes acceden gratis a su portal (rutinas, nutrición, progreso y mensajes). La suscripción la pagas únicamente tú como entrenador.',
  },
  {
    q: '¿Puedo cambiar de plan más adelante?',
    a: 'Cuando quieras. Subes o bajas de plan desde el portal de facturación y el cambio se aplica al instante, con prorrateo automático.',
  },
]

const FEATURES = [
  {
    icon: Users,
    title: 'Gestión de clientes',
    desc: 'Perfil completo, historial de entrenamiento y seguimiento personalizado de cada cliente.',
  },
  {
    icon: Dumbbell,
    title: 'Rutinas personalizadas',
    desc: 'Crea, asigna y ajusta rutinas con ejercicios, series y notas de coaching.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Planes nutricionales',
    desc: 'Diseña menús con macros, calorías y seguimiento diario desde el móvil.',
  },
  {
    icon: CalendarDays,
    title: 'Gestión de citas',
    desc: 'Agenda presencial, online o videollamada. Recordatorios automáticos incluidos.',
  },
  {
    icon: MessageSquare,
    title: 'Mensajería integrada',
    desc: 'Chat directo con cada cliente. Sin WhatsApp, sin correos sueltos.',
  },
  {
    icon: TrendingUp,
    title: 'Progreso y analytics',
    desc: 'Gráficas de evolución, fotos de progreso y métricas que tus clientes verán.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Carlos Mendoza',
    role: 'Entrenador personal · Madrid · 16 clientes',
    initials: 'CM',
    text: 'Antes me pasaba los domingos enteros preparando PDFs para mis clientes y mandándolos por WhatsApp. Con TrainerBoost lo hago en 20 minutos. Y lo mejor: mis clientes me empezaron a decir que la app estaba muy bien. Eso no tiene precio.',
    rating: '4.9',
  },
  {
    name: 'Laura Sánchez',
    role: 'Entrenadora online · Sevilla · 23 clientes',
    initials: 'LS',
    text: 'Tuve una cliente que llevaba 3 meses conmigo y que casi lo deja porque decía que no veía su progreso. Desde que usa el portal de TrainerBoost, con sus gráficas y rachas, lleva 8 meses y no se plantea dejarlo. La retención de clientes es lo que más me ha cambiado.',
    rating: '5.0',
  },
  {
    name: 'Marcos Jiménez',
    role: 'Coach de fuerza · Valencia · 11 clientes',
    initials: 'MJ',
    text: 'Cobrar era mi mayor dolor de cabeza. Perseguía a los clientes por Bizum y siempre había alguno que "se olvidaba". Con el cobro automático de Stripe llevo 4 meses sin tener que perseguir a nadie. Eso solo ya justifica los 19€ al mes.',
    rating: '4.8',
  },
]

const TRUST = ['Sin tarjeta de crédito', 'Soporte incluido', 'Cancela cuando quieras']

const PAIN_POINTS = [
  'Capturas de WhatsApp para enviar rutinas',
  'PDFs en email que los clientes no abren',
  'Hojas de Excel sin sincronización',
  'Pagos gestionados por Bizum/transferencia',
  'Sin forma de ver el progreso del cliente',
]

const SOLUTION_POINTS = [
  'Rutinas asignadas con un clic, visibles al momento',
  'Portal web y móvil que tus clientes usan cada día',
  'Dashboard en tiempo real con todos los datos',
  'Cobro automático con Stripe, sin gestionar nada',
  'Gráficas de evolución, fotos y métricas en un lugar',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-slate-100 overflow-x-hidden">

      {/* ── Announcement bar ────────────────────────────────────────────── */}
      <div className="border-b border-border/60 bg-surface/40">
        <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-center gap-3 text-center">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
          <span className="text-xs text-slate-400">
            <span className="font-semibold text-white">Nuevo:</span>{' '}
            Mensajería en tiempo real + notificaciones push en todos los planes
          </span>
          <Link href="/register" className="text-xs text-brand-primary font-semibold hover:underline flex items-center gap-0.5 shrink-0">
            Probar gratis <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="border-b border-border/50 bg-background/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: '#8FD43A' }}
            >
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">TrainerBoost</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/pricing" className="text-sm text-slate-500 hover:text-white transition-colors duration-150 hidden md:block px-3 py-2 rounded-lg hover:bg-surface">Precios</Link>
            <Link href="/demo"    className="text-sm text-slate-500 hover:text-white transition-colors duration-150 hidden sm:block px-3 py-2 rounded-lg hover:bg-surface">Demo</Link>
            <Link href="/contact" className="text-sm text-slate-500 hover:text-white transition-colors duration-150 hidden md:block px-3 py-2 rounded-lg hover:bg-surface">Contacto</Link>
            <div className="w-px h-4 bg-border mx-2 hidden sm:block" />
            <Link href="/login"   className="text-sm text-slate-500 hover:text-white transition-colors duration-150 px-3 py-2 rounded-lg hover:bg-surface hidden sm:block">Entrar</Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4 ml-1">Probar gratis</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          {/* Left: copy */}
          <div>
            <div className="flex items-center gap-2 mb-6 animate-fade-in-up">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
              <span className="text-xs text-slate-400 font-medium">Gratis para empezar · Sin tarjeta</span>
            </div>

            <h1 className="text-5xl md:text-[3.5rem] font-bold text-white leading-[1.05] mb-5 text-balance tracking-tight animate-fade-in-up delay-75">
              Deja de gestionar clientes por WhatsApp
            </h1>

            <p className="text-lg text-slate-400 mb-7 leading-relaxed max-w-lg animate-fade-in-up delay-150">
              TrainerBoost centraliza rutinas, nutrición, citas y pagos en un solo lugar.
              Tus clientes lo usan cada día. En español, desde <strong className="text-white font-semibold">19€/mes</strong>.
            </p>

            {/* Social proof inline */}
            <div className="flex items-center gap-3 mb-7 animate-fade-in-up delay-200">
              <div className="flex -space-x-2">
                {['CM', 'SL', 'JR', 'MP', 'AR'].map((initials, i) => (
                  <div key={initials}
                       className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold"
                       style={{ background: ['#0EA5E9','#7C3AED','#10B981','#F59E0B','#EC4899'][i] + '25',
                                color: ['#38BDF8','#A78BFA','#34D399','#FCD34D','#F9A8D4'][i],
                                borderColor: '#0A0A0A' }}>
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Primeros entrenadores en beta · Únete gratis
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-7 animate-fade-in-up delay-200">
              <Link href="/register" className="btn-primary text-base px-7 py-3">
                <Zap className="w-4 h-4" /> Probar 14 días gratis
              </Link>
              <Link href="/demo/trainer" className="btn-secondary flex items-center gap-2 py-3 px-6 text-base">
                <Play className="w-4 h-4" /> Ver demo en vivo
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 animate-fade-in-up delay-300">
              {TRUST.map(t => (
                <div key={t} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right: App preview */}
          <div className="relative hidden lg:block animate-slide-right delay-200">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-card-elevated"
                 style={{ background: '#111111' }}>
              {/* Browser chrome */}
              <div className="bg-surface-2 border-b border-border px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border-bright" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border-bright" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border-bright" />
                </div>
                <div className="flex-1 mx-4 bg-background/60 rounded-md h-5 flex items-center px-2.5">
                  <span className="text-[10px] text-slate-600">app.trainerboost.es/dashboard</span>
                </div>
              </div>

              {/* App content */}
              <div className="flex" style={{ height: '380px' }}>
                {/* Sidebar */}
                <div className="w-36 bg-background border-r border-border p-2.5 flex flex-col gap-0.5 shrink-0">
                  <div className="flex items-center gap-1.5 px-2 py-2 mb-2">
                    <div className="w-5 h-5 rounded-md shrink-0 flex items-center justify-center"
                         style={{ background: '#8FD43A' }}>
                      <Zap className="w-3 h-3 text-black" />
                    </div>
                    <span className="text-[9px] font-bold text-white">TrainerBoost</span>
                  </div>
                  {[
                    { label: 'Panel',     active: true  },
                    { label: 'Clientes',  active: false },
                    { label: 'Rutinas',   active: false },
                    { label: 'Nutrición', active: false },
                    { label: 'Citas',     active: false },
                    { label: 'Mensajes',  active: false },
                  ].map(item => (
                    <div key={item.label}
                         className={`text-[9px] px-2 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${item.active ? 'text-brand-primary font-semibold bg-brand-primary/8' : 'text-slate-600'}`}>
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ background: item.active ? '#8FD43A' : '#2C2C2C' }} />
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Main */}
                <div className="flex-1 p-3.5 space-y-2.5 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-white">Panel principal</div>
                      <div className="text-[9px] text-slate-600">Jueves, 29 Mayo 2025</div>
                    </div>
                    <div className="h-5 w-16 rounded-md text-[8px] flex items-center justify-center text-black font-semibold"
                         style={{ background: '#8FD43A' }}>
                      + Añadir
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: 'Clientes activos', value: '24', color: '143,212,58' },
                      { label: 'Citas hoy',         value: '6',  color: '16,185,129' },
                      { label: 'Mensajes nuevos',   value: '8',  color: '124,58,237' },
                      { label: 'Este mes',          value: '2.8k€', color: '245,158,11' },
                    ].map(s => (
                      <div key={s.label} className="rounded-lg border p-2"
                           style={{ background: `rgba(${s.color},0.05)`, borderColor: `rgba(${s.color},0.15)` }}>
                        <div className="text-[8px] text-slate-600 mb-0.5">{s.label}</div>
                        <div className="text-[12px] font-bold text-white font-mono">{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Appointments */}
                  <div className="rounded-lg border border-border p-2 bg-surface/50">
                    <div className="text-[8px] font-semibold text-white mb-1.5 flex items-center justify-between">
                      Próximas citas
                      <span className="text-brand-primary font-normal">Ver todas →</span>
                    </div>
                    {[
                      { time: '09:00', name: 'Ana García',      type: 'Online' },
                      { time: '11:30', name: 'Pedro López',     type: 'Presencial' },
                      { time: '16:00', name: 'María Fernández', type: 'Online' },
                    ].map(a => (
                      <div key={a.name} className="flex items-center gap-2 py-0.5">
                        <span className="text-[8px] text-slate-600 font-mono w-8 shrink-0">{a.time}</span>
                        <span className="w-1 h-1 rounded-full shrink-0 bg-border-bright" />
                        <span className="text-[8px] text-slate-300 flex-1 truncate">{a.name}</span>
                        <span className="text-[7px] text-slate-600 shrink-0">{a.type}</span>
                      </div>
                    ))}
                  </div>

                  {/* Progress */}
                  <div className="rounded-lg border border-border p-2 bg-surface/50">
                    <div className="text-[8px] font-semibold text-white mb-2">Progreso semanal</div>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Rutinas completadas', pct: 75 },
                        { label: 'Planes nutricionales', pct: 60 },
                        { label: 'Seguimiento activo',  pct: 90 },
                      ].map(p => (
                        <div key={p.label}>
                          <div className="flex justify-between mb-0.5">
                            <span className="text-[7px] text-slate-500">{p.label}</span>
                            <span className="text-[7px] text-brand-primary font-semibold">{p.pct}%</span>
                          </div>
                          <div className="h-1 bg-border rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-brand-primary" style={{ width: `${p.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
                   style={{ background: 'linear-gradient(to top, #111111, transparent)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div className="border-y border-border/50 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: '19€',  label: 'Desde 19€/mes' },
              { value: '100%', label: 'Hecho en España' },
              { value: '0€',   label: 'Gratis para empezar' },
            ].map((stat, i) => (
              <div key={stat.value}
                   className={`${i > 0 ? 'border-l border-border/50' : ''}`}>
                <div className="text-3xl md:text-4xl font-bold font-mono text-brand-primary mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Problem / Solution ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            ¿Sigues gestionando tu negocio así?
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            Cada entrenador empieza igual. Pero llega un punto en que esto ya no escala.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Before */}
          <div className="card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-red-500/40" />
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-red-400" />
              </div>
              <span className="text-sm font-semibold text-red-400">Antes de TrainerBoost</span>
            </div>
            <ul className="space-y-3">
              {PAIN_POINTS.map(p => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-slate-500">
                  <div className="w-4 h-4 rounded-full bg-red-500/8 border border-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-2.5 h-2.5 text-red-400" />
                  </div>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="card p-6 relative overflow-hidden border-brand-primary/15">
            <div className="absolute top-0 left-0 right-0 h-px bg-brand-primary/50" />
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-brand-primary/8 border border-brand-primary/15 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
              </div>
              <span className="text-sm font-semibold text-brand-primary">Con TrainerBoost</span>
            </div>
            <ul className="space-y-3">
              {SOLUTION_POINTS.map(p => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ────────────────────────────────────────────────── */}
      <section className="border-t border-border/50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Empieza en 3 pasos</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Sin configuraciones complejas. En minutos ya tienes tu panel listo.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: '01', title: 'Regístrate en 2 minutos', desc: 'Crea tu cuenta gratis. Sin tarjeta, sin configuraciones complejas.' },
              { n: '02', title: 'Añade tus clientes', desc: 'Invítalos por email o enlace. Configura rutinas y planes desde el primer día.' },
              { n: '03', title: 'Gestiona todo en uno', desc: 'Citas, nutrición, mensajes y seguimiento desde un solo panel.' },
            ].map((step, i) => (
              <div key={step.n} className={`card p-7 text-center flex flex-col items-center hover:-translate-y-0.5 transition-transform duration-300 ${i === 1 ? 'border-brand-primary/15' : ''}`}>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5 font-bold text-lg font-mono relative z-10 text-black"
                  style={{ background: '#8FD43A' }}
                >
                  {step.n}
                </div>
                <h3 className="font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Todo lo que necesitas para gestionar y hacer crecer tu negocio
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">Desde la primera sesión hasta el seguimiento a largo plazo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {FEATURES.map((feat) => (
            <div key={feat.title} className="card-hover p-6 group">
              <div className="w-9 h-9 rounded-lg bg-brand-primary/8 border border-brand-primary/15 flex items-center justify-center mb-4">
                <feat.icon className="w-4 h-4 text-brand-primary" />
              </div>
              <h3 className="font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mobile preview ───────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">
                Tus clientes lo llevan en el bolsillo
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Cada cliente tiene su propio portal web y móvil donde puede ver sus rutinas,
                registrar el progreso, consultar su plan nutricional y hablar contigo.
                Sin apps adicionales, funciona desde el navegador.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  { icon: Dumbbell,         label: 'Rutinas del día con vídeos de ejercicios' },
                  { icon: TrendingUp,       label: 'Historial de progreso y fotos de evolución' },
                  { icon: UtensilsCrossed,  label: 'Plan nutricional con macros diarios' },
                  { icon: MessageSquare,    label: 'Chat directo con el entrenador' },
                  { icon: Smartphone,       label: 'Notificaciones push de nuevas rutinas o citas' },
                ].map(item => (
                  <li key={item.label} className="flex items-center gap-3 text-sm text-slate-400">
                    <item.icon className="w-4 h-4 text-brand-primary shrink-0" />
                    {item.label}
                  </li>
                ))}
              </ul>
              <Link href="/demo/client" className="btn-secondary inline-flex items-center gap-2">
                Ver portal del cliente <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile mockup */}
            <div className="flex justify-center">
              <div className="relative" style={{ width: '260px' }}>
                <div className="rounded-[2rem] overflow-hidden border border-border-bright shadow-card-elevated"
                     style={{ background: '#0A0A0A' }}>
                  {/* Status bar */}
                  <div className="bg-surface px-5 pt-3 pb-2 flex justify-between items-center">
                    <span className="text-[10px] text-slate-600 font-medium">9:41</span>
                    <div className="flex gap-1">
                      <span className="text-[10px] text-slate-600">▮▮▮▮</span>
                    </div>
                  </div>
                  {/* App header */}
                  <div className="px-4 pb-3 border-b border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-[12px] font-bold text-white">Hola, Ana</div>
                        <div className="text-[9px] text-slate-600">Lunes · Día de pecho</div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-brand-primary/15 flex items-center justify-center text-[9px] font-bold text-brand-primary">AG</div>
                    </div>
                    {/* Tabs */}
                    <div className="flex gap-1 overflow-hidden">
                      {['Hoy', 'Rutinas', 'Nutrición', 'Progreso', 'Chat'].map((tab, i) => (
                        <div key={tab}
                             className={`text-[8px] px-2 py-1 rounded-full whitespace-nowrap ${i === 0 ? 'font-semibold bg-brand-primary/10 text-brand-primary' : 'text-slate-600'}`}>
                          {tab}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-3 space-y-2" style={{ minHeight: '320px' }}>
                    <div className="text-[9px] font-semibold text-white mb-1">Fuerza · Pecho y tríceps</div>
                    {[
                      { name: 'Press banca',     sets: '4×10 · 70kg', done: true },
                      { name: 'Press inclinado', sets: '3×10 · 55kg', done: true },
                      { name: 'Aperturas cable', sets: '3×15',        done: false },
                      { name: 'Fondos',          sets: '3×12',        done: false },
                      { name: 'Extensión tríceps',sets: '4×15',       done: false },
                    ].map(ex => (
                      <div key={ex.name} className="flex items-center gap-2 p-2 rounded-lg border"
                           style={{ background: ex.done ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)', borderColor: ex.done ? 'rgba(16,185,129,0.15)' : '#1E1E1E' }}>
                        <div className="w-4 h-4 rounded-md flex items-center justify-center text-[8px] shrink-0 border"
                             style={{ background: ex.done ? 'rgba(16,185,129,0.15)' : 'transparent', borderColor: ex.done ? 'rgba(16,185,129,0.25)' : '#2C2C2C', color: '#34D399' }}>
                          {ex.done ? '✓' : ''}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[8px] truncate ${ex.done ? 'line-through text-slate-600' : 'text-slate-300'}`}>{ex.name}</div>
                          <div className="text-[7px] text-slate-600">{ex.sets}</div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-3 p-2 rounded-lg border border-brand-primary/15 bg-brand-primary/5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-brand-primary shrink-0"
                           style={{ background: 'conic-gradient(#8FD43A 40%, rgba(143,212,58,0.1) 40%)' }}>
                        2/5
                      </div>
                      <div>
                        <div className="text-[8px] font-semibold text-white">40% completado</div>
                        <div className="text-[7px] text-slate-600">3 ejercicios más</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Lo que dicen los entrenadores</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Primeros entrenadores ya en beta. Únete gratis y sé de los primeros.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name}
                   className={`card p-6 flex flex-col gap-5 animate-fade-in-up ${i === 1 ? 'delay-150' : i === 2 ? 'delay-300' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <div className="text-xs text-slate-600 font-mono">{t.rating}</div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                  <div className="w-8 h-8 rounded-full bg-surface-3 border border-border-bright flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-slate-600">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo preview ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Explora antes de registrarte
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            Mira el panel del entrenador y el portal del cliente. Sin cuenta ni tarjeta.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/demo/trainer" className="card-hover p-6 group block">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-brand-primary/8 border border-brand-primary/15">
                <Zap className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <div className="font-semibold text-white">Panel Entrenador</div>
                <div className="text-xs text-slate-500">Clientes, rutinas, citas y analytics</div>
              </div>
            </div>
            <div className="rounded-xl bg-background border border-border overflow-hidden mb-5">
              <div className="bg-surface-2 px-3 py-2 border-b border-border flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-border-bright" />
                <div className="w-2 h-2 rounded-full bg-border-bright" />
                <div className="w-2 h-2 rounded-full bg-border-bright" />
                <div className="flex-1 mx-3 bg-surface rounded-md h-4 flex items-center justify-center">
                  <span className="text-[9px] text-slate-600">app.trainerboost.es/demo/trainer</span>
                </div>
              </div>
              <div className="flex" style={{ height: '130px' }}>
                <div className="w-28 bg-background border-r border-border p-2 space-y-1 shrink-0">
                  {['Panel', 'Clientes', 'Rutinas', 'Nutrición', 'Citas', 'Mensajes'].map((item, i) => (
                    <div key={item}
                         className={`text-[9px] px-2 py-1 rounded ${i === 0 ? 'text-brand-primary font-semibold bg-brand-primary/8' : 'text-slate-600'}`}>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="h-10 rounded bg-surface border border-border p-2">
                      <div className="text-[8px] text-slate-600">Clientes</div>
                      <div className="text-xs font-bold text-white font-mono">24</div>
                    </div>
                    <div className="h-10 rounded bg-surface border border-border p-2">
                      <div className="text-[8px] text-slate-600">Citas hoy</div>
                      <div className="text-xs font-bold text-white font-mono">6</div>
                    </div>
                  </div>
                  <div className="h-14 rounded bg-surface border border-border p-2">
                    <div className="text-[8px] text-slate-600 mb-1">Citas de hoy</div>
                    <div className="text-[9px] text-slate-400">09:00 · Ana García</div>
                    <div className="text-[9px] text-slate-400">11:30 · Pedro López</div>
                    <div className="text-[9px] text-slate-400">16:00 · María Fdez.</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-brand-primary font-medium text-sm group-hover:gap-3 transition-all duration-200">
              Ver panel del entrenador <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link href="/demo/client" className="card-hover p-6 group block">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-brand-accent/8 border border-brand-accent/15">
                <Users className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <div className="font-semibold text-white">Portal Cliente</div>
                <div className="text-xs text-slate-500">Rutinas, progreso y mensajes</div>
              </div>
            </div>
            <div className="rounded-xl bg-background border border-border overflow-hidden mb-5">
              <div className="bg-surface-2 px-3 py-2 border-b border-border flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-border-bright" />
                <div className="w-2 h-2 rounded-full bg-border-bright" />
                <div className="w-2 h-2 rounded-full bg-border-bright" />
                <div className="flex-1 mx-3 bg-surface rounded-md h-4 flex items-center justify-center">
                  <span className="text-[9px] text-slate-600">app.trainerboost.es/demo/client</span>
                </div>
              </div>
              <div className="p-3" style={{ height: '130px' }}>
                <div className="flex gap-2 pb-2 mb-2 border-b border-border overflow-hidden">
                  {['Progreso', 'Mi Rutina', 'Nutrición', 'Citas', 'Mensajes'].map((item, i) => (
                    <div key={item}
                         className={`text-[9px] px-2 py-0.5 rounded whitespace-nowrap ${i === 1 ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'text-slate-600'}`}>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="text-[9px] font-semibold text-white mb-2">Fuerza + Hipertrofia · Hoy</div>
                <div className="space-y-1.5">
                  {[
                    { name: 'Press banca',    sets: '4×10', done: true },
                    { name: 'Sentadilla',     sets: '4×8',  done: true },
                    { name: 'Remo con barra', sets: '3×12', done: false },
                    { name: 'Press militar',  sets: '3×10', done: false },
                  ].map(ex => (
                    <div key={ex.name} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center text-[8px] shrink-0 ${ex.done ? 'bg-brand-primary/15 border-brand-primary/25 text-brand-primary' : 'border-border text-slate-600'}`}>
                        {ex.done ? '✓' : ''}
                      </div>
                      <span className={`text-[9px] flex-1 ${ex.done ? 'line-through text-slate-600' : 'text-slate-400'}`}>{ex.name}</span>
                      <span className="text-[9px] text-slate-600">{ex.sets}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-brand-accent font-medium text-sm group-hover:gap-3 transition-all duration-200">
              Ver portal del cliente <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* ── Trust signals ────────────────────────────────────────────────── */}
      <section className="py-12 border-t border-border/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield,    label: 'RGPD compliant',     sublabel: 'Datos en servidores EU' },
              { icon: Clock,     label: 'Soporte en español', sublabel: 'Respuesta en 24h' },
              { icon: Zap,       label: 'Uptime 99.9%',       sublabel: 'SLA garantizado' },
              { icon: BarChart3, label: 'Datos cifrados',     sublabel: 'SSL + backups diarios' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-sm font-medium text-slate-300">{item.label}</div>
                <div className="text-xs text-slate-600">{item.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="precios" className="max-w-6xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Planes simples y transparentes</h2>
          <p className="text-slate-500 max-w-lg mx-auto">Empieza gratis con 3 clientes. Crece cuando lo necesites. Sin permanencia.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 items-stretch">
          {PRICING_TIERS.map(({ key, highlight }, i) => {
            const plan = PLAN_CONFIG[key]
            return (
              <div
                key={key}
                className={`relative card p-7 flex flex-col ${
                  highlight
                    ? 'border-brand-primary/25 bg-brand-primary/3'
                    : ''
                } transition-all duration-200 hover:-translate-y-0.5`}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold px-3 py-1 rounded-full bg-brand-primary text-black whitespace-nowrap">
                    Más popular
                  </div>
                )}
                <div className="font-semibold text-white">{plan.name}</div>
                <div className="flex items-end gap-1 mt-3 mb-5">
                  <span className="text-4xl font-bold text-white font-mono">{plan.price}€</span>
                  <span className="text-sm text-slate-500 mb-1">/mes</span>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`w-full justify-center ${highlight ? 'btn-primary' : 'btn-secondary'}`}>
                  Empezar ahora
                </Link>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">
          ¿Solo quieres probar?{' '}
          <Link href="/register" className="text-brand-primary hover:underline">Crea una cuenta gratis</Link>{' '}
          y gestiona hasta 3 clientes sin tarjeta.
        </p>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Preguntas frecuentes</h2>
        </div>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <details
              key={faq.q}
              className="group card p-0 overflow-hidden"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 text-sm font-medium text-white hover:text-slate-200 transition-colors">
                {faq.q}
                <ArrowRight className="w-4 h-4 text-slate-600 shrink-0 transition-transform duration-300 group-open:rotate-90" />
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-border/40 pt-3">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-28 border-t border-border/50">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 text-balance tracking-tight">
            Tu negocio merece las mejores herramientas
          </h2>
          <p className="text-slate-500 mb-10 text-lg leading-relaxed">
            Empieza gratis con hasta 3 clientes.<br />
            Escala a medida que crece tu negocio.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link href="/register" className="btn-primary text-base px-10 py-3.5">
              <Zap className="w-5 h-5" /> Probar 14 días gratis
            </Link>
            <Link href="/demo" className="btn-secondary text-base px-6 py-3.5">
              Ver demo primero →
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {TRUST.map(t => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center"
                   style={{ background: '#8FD43A' }}>
                <Zap className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="font-bold text-white text-sm">TrainerBoost</span>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-600">
              <Link href="/pricing" className="hover:text-slate-300 transition-colors">Precios</Link>
              <Link href="/demo/trainer" className="hover:text-slate-300 transition-colors">Demo</Link>
              <Link href="/contact" className="hover:text-slate-300 transition-colors">Contacto</Link>
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">Política de privacidad</Link>
              <Link href="/terms" className="hover:text-slate-300 transition-colors">Términos de servicio</Link>
            </nav>
          </div>
          <p className="text-center text-xs text-slate-700">
            © 2025 TrainerBoost · Para entrenadores personales · España
          </p>
        </div>
      </footer>
    </div>
  )
}
