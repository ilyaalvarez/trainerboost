import Link from 'next/link'
import {
  Zap, Users, Dumbbell, UtensilsCrossed, CalendarDays,
  MessageSquare, ArrowRight, TrendingUp, CheckCircle2, Star,
  Play, Sparkles, Shield, Clock, BarChart3, ChevronRight,
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
    color: 'sky',
    title: 'Gestión de clientes',
    desc: 'Perfil completo, historial de entrenamiento y seguimiento personalizado de cada cliente.',
  },
  {
    icon: Dumbbell,
    color: 'violet',
    title: 'Rutinas personalizadas',
    desc: 'Crea, asigna y ajusta rutinas con ejercicios, series y notas de coaching.',
  },
  {
    icon: UtensilsCrossed,
    color: 'emerald',
    title: 'Planes nutricionales',
    desc: 'Diseña menús con macros, calorías y seguimiento diario desde el móvil.',
  },
  {
    icon: CalendarDays,
    color: 'amber',
    title: 'Gestión de citas',
    desc: 'Agenda presencial, online o videollamada. Recordatorios automáticos incluidos.',
  },
  {
    icon: MessageSquare,
    color: 'pink',
    title: 'Mensajería integrada',
    desc: 'Chat directo con cada cliente. Sin WhatsApp, sin correos sueltos.',
  },
  {
    icon: TrendingUp,
    color: 'teal',
    title: 'Progreso y analytics',
    desc: 'Gráficas de evolución, fotos de progreso y métricas que tus clientes verán.',
  },
]

const FEATURE_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  sky:     { bg: 'bg-sky-500/10',     text: 'text-sky-400',     border: 'border-sky-500/20',     glow: '14,165,233' },
  violet:  { bg: 'bg-violet-500/10',  text: 'text-violet-400',  border: 'border-violet-500/20',  glow: '124,58,237' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: '16,185,129' },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20',   glow: '245,158,11' },
  pink:    { bg: 'bg-pink-500/10',    text: 'text-pink-400',    border: 'border-pink-500/20',    glow: '236,72,153' },
  teal:    { bg: 'bg-teal-500/10',    text: 'text-teal-400',    border: 'border-teal-500/20',    glow: '20,184,166' },
}

const STATS = [
  { value: '500+',   label: 'Entrenadores activos', icon: Users },
  { value: '8.000+', label: 'Clientes gestionados',  icon: BarChart3 },
  { value: '4.9★',   label: 'Valoración media',      icon: Star },
]

const TESTIMONIALS = [
  {
    name: 'Carlos Martínez',
    role: 'Entrenador personal · Madrid',
    initials: 'CM',
    color: 'bg-sky-500/20 text-sky-300',
    text: 'Pasé de gestionar todo con Excel a tener todo centralizado. Mis clientes lo usan a diario y el feedback es increíble.',
    stars: 5,
  },
  {
    name: 'Sara López',
    role: 'Nutricionista y PT · Barcelona',
    initials: 'SL',
    color: 'bg-violet-500/20 text-violet-300',
    text: 'Los planes nutricionales que puedo crear son ahora mucho más profesionales. Mis clientes ven todo claro desde el móvil.',
    stars: 5,
  },
  {
    name: 'Javier Ruiz',
    role: 'Coach online · Valencia',
    initials: 'JR',
    color: 'bg-emerald-500/20 text-emerald-300',
    text: 'En 2 semanas tenía todo configurado. La mensajería integrada me ahorra horas cada semana. 100% recomendado.',
    stars: 5,
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
      <div className="relative overflow-hidden"
           style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.15) 0%, rgba(124,58,237,0.15) 50%, rgba(14,165,233,0.15) 100%)' }}>
        <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-center gap-2 text-center">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-xs text-slate-300">
            <span className="font-semibold text-white">Nuevo:</span>{' '}
            Mensajería en tiempo real + notificaciones push en todos los planes
          </span>
          <Link href="/register" className="text-xs text-sky-400 font-semibold hover:text-sky-300 flex items-center gap-0.5 shrink-0">
            Probar gratis <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="border-b border-border/50 bg-background/85 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-glow-sm"
              style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight gradient-text">TrainerBoost</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 hidden md:block px-3 py-2 rounded-lg hover:bg-surface/70">Precios</Link>
            <Link href="/demo"    className="text-sm text-slate-400 hover:text-white transition-colors duration-150 hidden sm:block px-3 py-2 rounded-lg hover:bg-surface/70">Demo</Link>
            <Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 hidden md:block px-3 py-2 rounded-lg hover:bg-surface/70">Contacto</Link>
            <div className="w-px h-4 bg-border mx-2 hidden sm:block" />
            <Link href="/login"   className="text-sm text-slate-400 hover:text-white transition-colors duration-150 px-3 py-2 rounded-lg hover:bg-surface/70 hidden sm:block">Entrar</Link>
            <Link href="/register" className="btn-gradient text-sm py-2 px-4 ml-1">Probar gratis</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-16">
        {/* Ambient glows */}
        <div className="absolute top-0 left-0 w-[800px] h-[600px] pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at 15% 35%, rgba(14,165,233,0.1) 0%, transparent 60%)' }} />
        <div className="absolute top-0 right-0 w-[600px] h-[500px] pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at 85% 20%, rgba(124,58,237,0.08) 0%, transparent 55%)' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(16,185,129,0.04) 0%, transparent 60%)' }} />

        <div className="relative grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          {/* Left: copy */}
          <div>
            <div className="chip mb-6 w-fit animate-fade-in-up">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse inline-block" />
              Gratis para empezar · Sin tarjeta
            </div>

            <h1 className="text-5xl md:text-[3.75rem] font-bold text-white leading-[1.05] mb-5 text-balance tracking-tight animate-fade-in-up delay-75">
              Deja de gestionar<br />
              <span className="gradient-text">clientes por</span><br />
              WhatsApp
            </h1>

            <p className="text-lg text-slate-400 mb-7 leading-relaxed max-w-lg animate-fade-in-up delay-150">
              TrainerBoost centraliza rutinas, nutrición, citas y pagos en un solo lugar.
              Tus clientes lo usan cada día. En español, desde <strong className="text-white">19€/mes</strong>.
            </p>

            {/* Social proof inline */}
            <div className="flex items-center gap-3 mb-7 animate-fade-in-up delay-200">
              <div className="flex -space-x-2">
                {['CM', 'SL', 'JR', 'MP', 'AR'].map((initials, i) => (
                  <div key={initials}
                       className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold"
                       style={{ background: ['#0EA5E9','#7C3AED','#10B981','#F59E0B','#EC4899'][i] + '33',
                                color: ['#38BDF8','#A78BFA','#34D399','#FCD34D','#F9A8D4'][i],
                                borderColor: '#0F172A' }}>
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  <span className="text-white font-semibold">500+ entrenadores</span> ya confían en nosotros
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-7 animate-fade-in-up delay-250">
              <Link href="/register" className="btn-gradient text-base px-8 py-3">
                <Zap className="w-4 h-4" /> Probar 14 días gratis
              </Link>
              <Link href="/demo/trainer" className="btn-secondary flex items-center gap-2 py-3 px-6 text-base">
                <Play className="w-4 h-4" /> Ver demo en vivo
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 animate-fade-in-up delay-300">
              {TRUST.map(t => (
                <div key={t} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right: App preview */}
          <div className="relative hidden lg:block animate-slide-right delay-200">
            <div className="absolute inset-0 blur-3xl pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(14,165,233,0.18) 0%, rgba(124,58,237,0.1) 50%, transparent 70%)' }} />
            <div className="relative rounded-2xl overflow-hidden border border-border/80 shadow-card-elevated"
                 style={{ background: '#1E293B' }}>
              {/* Browser chrome */}
              <div className="bg-surface-2 border-b border-border px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex-1 mx-4 bg-background/60 rounded-md h-5 flex items-center px-2.5">
                  <span className="text-[10px] text-slate-500">app.trainerboost.es/dashboard</span>
                </div>
              </div>

              {/* App content */}
              <div className="flex" style={{ height: '380px' }}>
                {/* Sidebar */}
                <div className="w-36 bg-surface/60 border-r border-border/60 p-2.5 flex flex-col gap-0.5 shrink-0">
                  <div className="flex items-center gap-1.5 px-2 py-2 mb-2">
                    <div className="w-5 h-5 rounded-md shrink-0"
                         style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }} />
                    <span className="text-[9px] font-bold text-white">TrainerBoost</span>
                  </div>
                  {[
                    { label: 'Panel',     active: true,  icon: '⊞' },
                    { label: 'Clientes',  active: false, icon: '◎' },
                    { label: 'Rutinas',   active: false, icon: '⬡' },
                    { label: 'Nutrición', active: false, icon: '◈' },
                    { label: 'Citas',     active: false, icon: '⊕' },
                    { label: 'Mensajes',  active: false, icon: '◉' },
                  ].map(item => (
                    <div key={item.label}
                         className={`text-[9px] px-2 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${item.active ? 'text-sky-400 font-semibold' : 'text-slate-500'}`}
                         style={item.active ? { background: 'linear-gradient(90deg, rgba(14,165,233,0.15), transparent)' } : {}}>
                      <span className="opacity-60">{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Main */}
                <div className="flex-1 p-3.5 space-y-2.5 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-white">Panel principal</div>
                      <div className="text-[9px] text-slate-500">Jueves, 29 Mayo 2025</div>
                    </div>
                    <div className="h-5 w-16 rounded-md text-[8px] flex items-center justify-center text-sky-400 font-semibold"
                         style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.25)' }}>
                      + Añadir
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: 'Clientes activos', value: '24', delta: '+2', color: '14,165,233' },
                      { label: 'Citas hoy',         value: '6',  delta: '+1', color: '124,58,237' },
                      { label: 'Mensajes nuevos',   value: '8',  delta: '+3', color: '16,185,129' },
                      { label: 'Este mes',           value: '2.8k€', delta: '+12%', color: '245,158,11' },
                    ].map(s => (
                      <div key={s.label} className="rounded-lg border p-2"
                           style={{ background: `rgba(${s.color},0.06)`, borderColor: `rgba(${s.color},0.2)` }}>
                        <div className="text-[8px] text-slate-500 mb-0.5">{s.label}</div>
                        <div className="flex items-end justify-between">
                          <div className="text-[12px] font-bold text-white font-mono">{s.value}</div>
                          <div className="text-[8px] font-semibold" style={{ color: `rgb(${s.color})` }}>{s.delta}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Appointments */}
                  <div className="rounded-lg bg-surface/50 border border-border/60 p-2">
                    <div className="text-[8px] font-semibold text-white mb-1.5 flex items-center justify-between">
                      Próximas citas
                      <span className="text-sky-400 font-normal">Ver todas →</span>
                    </div>
                    {[
                      { time: '09:00', name: 'Ana García',      type: 'Online',    dot: '#0EA5E9' },
                      { time: '11:30', name: 'Pedro López',     type: 'Presencial', dot: '#7C3AED' },
                      { time: '16:00', name: 'María Fernández', type: 'Online',    dot: '#0EA5E9' },
                    ].map(a => (
                      <div key={a.name} className="flex items-center gap-2 py-0.5">
                        <span className="text-[8px] text-slate-500 font-mono w-8 shrink-0">{a.time}</span>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: a.dot }} />
                        <span className="text-[8px] text-slate-300 flex-1 truncate">{a.name}</span>
                        <span className="text-[7px] shrink-0" style={{ color: a.dot }}>{a.type}</span>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="rounded-lg bg-surface/50 border border-border/60 p-2">
                    <div className="text-[8px] font-semibold text-white mb-2">Progreso semanal</div>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Rutinas completadas', pct: 75, color: '#0EA5E9' },
                        { label: 'Planes nutricionales', pct: 60, color: '#10B981' },
                        { label: 'Seguimiento activo',  pct: 90, color: '#7C3AED' },
                      ].map(p => (
                        <div key={p.label}>
                          <div className="flex justify-between mb-0.5">
                            <span className="text-[7px] text-slate-400">{p.label}</span>
                            <span className="text-[7px] font-semibold" style={{ color: p.color }}>{p.pct}%</span>
                          </div>
                          <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                   style={{ background: 'linear-gradient(to top, #1E293B, transparent)' }} />
            </div>

            {/* Floating badges */}
            <div className="absolute -left-8 top-12 rounded-xl px-3 py-2.5 shadow-card-elevated flex items-center gap-2.5 animate-float"
                 style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                   style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <div className="text-[9px] font-semibold text-white">Cita confirmada</div>
                <div className="text-[8px] text-slate-400">Ana · 09:00 Online</div>
              </div>
            </div>

            <div className="absolute -right-6 top-28 rounded-xl px-3 py-2.5 shadow-card-elevated animate-float"
                 style={{ animationDelay: '1s', background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-[8px] text-slate-400 mb-0.5">Ingresos del mes</div>
              <div className="text-[15px] font-bold text-white font-mono">2.840€ <span className="text-emerald-400 text-[9px]">↑12%</span></div>
            </div>

            <div className="absolute -right-4 bottom-16 rounded-xl px-3 py-2.5 shadow-card-elevated animate-float"
                 style={{ animationDelay: '2s', background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-violet-300">JR</span>
                </div>
                <div>
                  <div className="text-[8px] text-slate-300">Nuevo mensaje</div>
                  <div className="text-[7px] text-slate-500">hace 2 min</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div className="border-y border-border/50 py-10 bg-surface/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {STATS.map((stat, i) => (
              <div key={stat.value}
                   className={`${i > 0 ? 'border-l border-border/50' : ''}`}>
                <div className="text-3xl md:text-4xl font-bold font-mono gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Problem / Solution ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14 animate-fade-in-up">
          <div className="chip mb-4 mx-auto w-fit">El problema</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            ¿Sigues gestionando tu negocio<br />
            <span className="gradient-text-warm">así?</span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Cada entrenador empieza igual. Pero llega un punto en que esto ya no escala.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="card p-6 border-red-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500/30" />
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-red-400" />
              </div>
              <span className="text-sm font-bold text-red-400">Antes de TrainerBoost</span>
            </div>
            <ul className="space-y-3">
              {PAIN_POINTS.map(p => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-slate-400">
                  <div className="w-4 h-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-2.5 h-2.5 text-red-400" />
                  </div>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="card p-6 border-emerald-500/25 relative overflow-hidden"
               style={{ background: 'linear-gradient(160deg, rgba(16,185,129,0.06) 0%, #1E293B 60%)' }}>
            <div className="absolute top-0 left-0 right-0 h-0.5"
                 style={{ background: 'linear-gradient(90deg, #10B981, #0EA5E9)' }} />
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-sm font-bold text-emerald-400">Con TrainerBoost</span>
            </div>
            <ul className="space-y-3">
              {SOLUTION_POINTS.map(p => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ────────────────────────────────────────────────── */}
      <section className="border-t border-border/50 py-24"
               style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.04) 0%, transparent 60%)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="chip-accent mb-4 mx-auto w-fit">Proceso simple</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Empieza en 3 pasos</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Sin configuraciones complejas. En minutos ya tienes tu panel listo.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="absolute top-[3.5rem] left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px hidden md:block"
                 style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.35), rgba(124,58,237,0.35))' }} />

            {[
              { n: '01', title: 'Regístrate en 2 minutos', desc: 'Crea tu cuenta gratis. Sin tarjeta, sin configuraciones complejas.', gradient: '#0EA5E9, #7C3AED' },
              { n: '02', title: 'Añade tus clientes', desc: 'Invítalos por email o enlace. Configura rutinas y planes desde el primer día.', gradient: '#7C3AED, #10B981' },
              { n: '03', title: 'Gestiona todo en uno', desc: 'Citas, nutrición, mensajes y seguimiento desde un solo panel.', gradient: '#10B981, #0EA5E9' },
            ].map((step, i) => (
              <div key={step.n} className={`relative animate-fade-in-up ${i === 1 ? 'delay-150' : i === 2 ? 'delay-300' : ''}`}>
                <div className="card p-8 text-center h-full flex flex-col items-center hover:-translate-y-1 transition-transform duration-300">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white font-bold text-xl font-mono relative z-10 shadow-glow-sm"
                    style={{ background: `linear-gradient(135deg, ${step.gradient})` }}
                  >
                    {step.n}
                  </div>
                  <h3 className="font-bold text-white mb-3 text-lg">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="chip mb-4 mx-auto w-fit">Funcionalidades</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Todo lo que necesitas para<br />
            <span className="gradient-text">gestionar y hacer crecer</span> tu negocio
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">Desde la primera sesión hasta el seguimiento a largo plazo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {FEATURES.map((feat) => {
            const c = FEATURE_COLORS[feat.color]
            return (
              <div key={feat.title} className="card-hover p-6 group">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${c.bg} ${c.border}`}
                     style={{ ['--hover-shadow' as string]: `0 0 20px rgba(${c.glow},0.25)` }}>
                  <feat.icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <h3 className="font-semibold text-white mb-2 group-hover:text-slate-50 transition-colors">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{feat.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Mobile preview ───────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border/50"
               style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(124,58,237,0.05) 0%, transparent 60%)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <div className="chip-purple mb-5 w-fit">Portal del cliente</div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">
                Tus clientes lo llevan<br />
                <span className="gradient-text">en el bolsillo</span>
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Cada cliente tiene su propio portal web y móvil donde puede ver sus rutinas,
                registrar el progreso, consultar su plan nutricional y hablar contigo.
                Sin apps adicionales, funciona desde el navegador.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Dumbbell,      label: 'Rutinas del día con vídeos de ejercicios' },
                  { icon: TrendingUp,    label: 'Historial de progreso y fotos de evolución' },
                  { icon: UtensilsCrossed, label: 'Plan nutricional con macros diarios' },
                  { icon: MessageSquare, label: 'Chat directo con el entrenador' },
                  { icon: Smartphone,   label: 'Notificaciones push de nuevas rutinas o citas' },
                ].map(item => (
                  <li key={item.label} className="flex items-center gap-3 text-sm text-slate-300">
                    <item.icon className="w-4 h-4 text-violet-400 shrink-0" />
                    {item.label}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex gap-3">
                <Link href="/demo/client" className="btn-secondary flex items-center gap-2">
                  Ver portal del cliente <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Mobile mockup */}
            <div className="relative flex justify-center animate-slide-right delay-150">
              <div className="relative" style={{ width: '260px' }}>
                {/* Phone frame */}
                <div className="rounded-[2rem] overflow-hidden border-2 border-slate-700 shadow-2xl"
                     style={{ background: '#0F172A', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)' }}>
                  {/* Status bar */}
                  <div className="bg-surface px-5 pt-3 pb-2 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-medium">9:41</span>
                    <div className="flex gap-1">
                      <span className="text-[10px] text-slate-400">▮▮▮▮</span>
                    </div>
                  </div>
                  {/* App header */}
                  <div className="px-4 pb-3 border-b border-border"
                       style={{ background: 'linear-gradient(180deg, #1E293B, #1E293B)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-[12px] font-bold text-white">Hola, Ana 👋</div>
                        <div className="text-[9px] text-slate-400">Lunes · Día de pecho</div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-sky-500/25 flex items-center justify-center text-[9px] font-bold text-sky-300">AG</div>
                    </div>
                    {/* Tabs */}
                    <div className="flex gap-1 overflow-hidden">
                      {['Hoy', 'Rutinas', 'Nutrición', 'Progreso', 'Chat'].map((tab, i) => (
                        <div key={tab}
                             className={`text-[8px] px-2 py-1 rounded-full whitespace-nowrap ${i === 0 ? 'font-semibold' : 'text-slate-500'}`}
                             style={i === 0 ? { background: 'rgba(14,165,233,0.2)', color: '#38BDF8' } : {}}>
                          {tab}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-3 space-y-2" style={{ minHeight: '320px' }}>
                    <div className="text-[9px] font-semibold text-white mb-1">Fuerza · Pecho y tríceps</div>
                    {[
                      { name: 'Press banca', sets: '4×10 · 70kg', done: true },
                      { name: 'Press inclinado', sets: '3×10 · 55kg', done: true },
                      { name: 'Aperturas cable', sets: '3×15', done: false },
                      { name: 'Fondos', sets: '3×12', done: false },
                      { name: 'Extensión tríceps', sets: '4×15', done: false },
                    ].map(ex => (
                      <div key={ex.name} className="flex items-center gap-2 p-2 rounded-lg border"
                           style={{ background: ex.done ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)', borderColor: ex.done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)' }}>
                        <div className="w-4 h-4 rounded-md flex items-center justify-center text-[8px] shrink-0"
                             style={{ background: ex.done ? 'rgba(16,185,129,0.2)' : 'transparent', border: `1px solid ${ex.done ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`, color: '#34D399' }}>
                          {ex.done ? '✓' : ''}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[8px] truncate ${ex.done ? 'line-through text-slate-500' : 'text-slate-300'}`}>{ex.name}</div>
                          <div className="text-[7px] text-slate-500">{ex.sets}</div>
                        </div>
                      </div>
                    ))}
                    {/* Progress ring */}
                    <div className="mt-3 p-2 rounded-lg flex items-center gap-3"
                         style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-sky-400"
                           style={{ background: 'conic-gradient(#0EA5E9 40%, rgba(14,165,233,0.1) 40%)', boxShadow: '0 0 10px rgba(14,165,233,0.2)' }}>
                        2/5
                      </div>
                      <div>
                        <div className="text-[8px] font-semibold text-white">40% completado</div>
                        <div className="text-[7px] text-slate-400">3 ejercicios más</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Glow beneath phone */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-12 blur-2xl pointer-events-none"
                     style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.4), transparent)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border/50"
               style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(14,165,233,0.03) 0%, transparent 70%)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 animate-fade-in-up">
            <div className="chip mb-4 mx-auto w-fit">Testimonios</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Lo que dicen los entrenadores</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Más de 500 entrenadores ya gestionan su negocio con TrainerBoost.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name}
                   className={`card p-6 flex flex-col gap-5 hover:-translate-y-1 hover:border-border-bright transition-all duration-300 animate-fade-in-up ${
                     i === 0 ? '' : i === 1 ? 'delay-150' : 'delay-300'
                   }`}>
                <div className="flex items-center justify-between">
                  <div className="flex">
                    {Array.from({ length: t.stars }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">★ 5.0</div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-border/60">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${t.color}`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo preview ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="text-center mb-14 animate-fade-in-up">
          <div className="chip mb-4 mx-auto w-fit">Demo interactiva</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Explora antes de registrarte
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Mira el panel del entrenador y el portal del cliente. Sin cuenta ni tarjeta.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/demo/trainer" className="card-hover p-6 group block animate-fade-in-up delay-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-glow-sm shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-primary"
                   style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white group-hover:text-sky-300 transition-colors">Panel Entrenador</div>
                <div className="text-xs text-slate-400">Clientes, rutinas, citas y analytics</div>
              </div>
            </div>
            <div className="rounded-xl bg-background border border-border/70 overflow-hidden mb-5 group-hover:border-border-bright transition-colors duration-300">
              <div className="bg-surface-2 px-3 py-2 border-b border-border flex items-center gap-1.5">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                </div>
                <div className="flex-1 mx-3 bg-surface rounded-md h-4 flex items-center justify-center">
                  <span className="text-[9px] text-slate-500">app.trainerboost.es/demo/trainer</span>
                </div>
              </div>
              <div className="flex" style={{ height: '130px' }}>
                <div className="w-28 bg-surface border-r border-border p-2 space-y-1 shrink-0">
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
                      <div className="text-[8px] text-slate-500">Clientes</div>
                      <div className="text-xs font-bold text-white">24</div>
                    </div>
                    <div className="h-10 rounded bg-surface border border-border p-2">
                      <div className="text-[8px] text-slate-500">Citas hoy</div>
                      <div className="text-xs font-bold text-white">6</div>
                    </div>
                  </div>
                  <div className="h-14 rounded bg-surface border border-border p-2">
                    <div className="text-[8px] text-slate-500 mb-1">Citas de hoy</div>
                    <div className="text-[9px] text-slate-300">09:00 · Ana García · Online</div>
                    <div className="text-[9px] text-slate-300">11:30 · Pedro López · Presencial</div>
                    <div className="text-[9px] text-slate-300">16:00 · María Fdez. · Online</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm group-hover:gap-3 transition-all duration-200">
              Ver panel del entrenador <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link href="/demo/client" className="card-hover p-6 group block animate-fade-in-up delay-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-glow-sm shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-accent"
                   style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)' }}>
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">Portal Cliente</div>
                <div className="text-xs text-slate-400">Rutinas, progreso y mensajes</div>
              </div>
            </div>
            <div className="rounded-xl bg-background border border-border/70 overflow-hidden mb-5 group-hover:border-border-bright transition-colors duration-300">
              <div className="bg-surface-2 px-3 py-2 border-b border-border flex items-center gap-1.5">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                </div>
                <div className="flex-1 mx-3 bg-surface rounded-md h-4 flex items-center justify-center">
                  <span className="text-[9px] text-slate-500">app.trainerboost.es/demo/client</span>
                </div>
              </div>
              <div className="p-3" style={{ height: '130px' }}>
                <div className="flex gap-2 pb-2 mb-2 border-b border-border overflow-hidden">
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
                    { name: 'Press banca',    sets: '4×10', done: true },
                    { name: 'Sentadilla',     sets: '4×8',  done: true },
                    { name: 'Remo con barra', sets: '3×12', done: false },
                    { name: 'Press militar',  sets: '3×10', done: false },
                  ].map(ex => (
                    <div key={ex.name} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center text-[8px] shrink-0 ${ex.done ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'border-border text-slate-500'}`}>
                        {ex.done ? '✓' : ''}
                      </div>
                      <span className={`text-[9px] flex-1 ${ex.done ? 'line-through text-slate-500' : 'text-slate-300'}`}>{ex.name}</span>
                      <span className="text-[9px] text-slate-500">{ex.sets}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-brand-accent font-semibold text-sm group-hover:gap-3 transition-all duration-200">
              Ver portal del cliente <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* ── Trust signals ────────────────────────────────────────────────── */}
      <section className="py-12 border-t border-border/50 bg-surface/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield,     label: 'RGPD compliant',           sublabel: 'Datos en servidores EU' },
              { icon: Clock,      label: 'Soporte en español',       sublabel: 'Respuesta en 24h' },
              { icon: Zap,        label: 'Uptime 99.9%',             sublabel: 'SLA garantizado' },
              { icon: BarChart3,  label: 'Datos cifrados',           sublabel: 'SSL + backups diarios' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-sm font-semibold text-white">{item.label}</div>
                <div className="text-xs text-slate-500">{item.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="precios" className="max-w-6xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="text-center mb-14 animate-fade-in-up">
          <div className="chip mb-4 mx-auto w-fit">Precios</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Planes simples y transparentes</h2>
          <p className="text-slate-400 max-w-lg mx-auto">Empieza gratis con 3 clientes. Crece cuando lo necesites. Sin permanencia.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {PRICING_TIERS.map(({ key, highlight }, i) => {
            const plan = PLAN_CONFIG[key]
            return (
              <div
                key={key}
                className={`relative card p-7 flex flex-col animate-fade-in-up ${i === 0 ? '' : i === 1 ? 'delay-150' : 'delay-300'} ${
                  highlight ? 'border-brand-primary/40' : 'hover:border-border-bright'
                } transition-all duration-300 hover:-translate-y-1`}
                style={highlight ? { background: 'linear-gradient(160deg, rgba(14,165,233,0.09) 0%, #1E293B 55%)', boxShadow: '0 20px 50px -20px rgba(14,165,233,0.4)' } : undefined}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full text-white whitespace-nowrap"
                       style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
                    Más popular
                  </div>
                )}
                <div className="font-bold text-white text-lg">{plan.name}</div>
                <div className="flex items-end gap-1 mt-3 mb-5">
                  <span className="text-4xl font-bold text-white font-mono">{plan.price}€</span>
                  <span className="text-sm text-slate-400 mb-1">/mes</span>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`w-full justify-center ${highlight ? 'btn-gradient' : 'btn-secondary'}`}>
                  Empezar ahora
                </Link>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-slate-500 mt-8">
          ¿Solo quieres probar?{' '}
          <Link href="/register" className="text-brand-primary hover:underline">Crea una cuenta gratis</Link>{' '}
          y gestiona hasta 3 clientes sin tarjeta.
        </p>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="chip mb-4 mx-auto w-fit">Preguntas frecuentes</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">¿Tienes dudas?</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <details
              key={faq.q}
              className="group card p-0 overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 text-sm font-semibold text-white hover:text-sky-300 transition-colors">
                {faq.q}
                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 transition-transform duration-300 group-open:rotate-90" />
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden border-t border-border/50">
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.12) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at 80% 100%, rgba(124,58,237,0.07) 0%, transparent 50%)' }} />

        <div className="relative max-w-2xl mx-auto px-6 text-center animate-fade-in-up">
          <div className="chip mb-6 mx-auto w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse inline-block" />
            Gratis para siempre · Sin tarjeta
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 text-balance tracking-tight">
            Tu negocio merece<br />
            <span className="gradient-text">las mejores herramientas</span>
          </h2>
          <p className="text-slate-400 mb-10 text-lg leading-relaxed">
            Empieza gratis con hasta 3 clientes.<br />
            Escala a medida que crece tu negocio.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link href="/register" className="btn-gradient text-base px-10 py-3.5 text-lg">
              <Zap className="w-5 h-5" /> Probar 14 días gratis
            </Link>
            <Link href="/demo" className="btn-secondary text-base px-6 py-3.5">
              Ver demo primero →
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {TRUST.map(t => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
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
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white">TrainerBoost</span>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
              <Link href="/pricing" className="hover:text-slate-300 transition-colors">Precios</Link>
              <Link href="/demo/trainer" className="hover:text-slate-300 transition-colors">Demo</Link>
              <Link href="/contact" className="hover:text-slate-300 transition-colors">Contacto</Link>
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">Política de privacidad</Link>
              <Link href="/terms" className="hover:text-slate-300 transition-colors">Términos de servicio</Link>
            </nav>
          </div>
          <p className="text-center text-xs text-slate-600">
            © 2025 TrainerBoost · Hecho con ❤️ para entrenadores personales · Spain 🇪🇸
          </p>
        </div>
      </footer>
    </div>
  )
}
