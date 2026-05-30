import Link from 'next/link'
import {
  Zap, Users, Dumbbell, UtensilsCrossed, CalendarDays,
  MessageSquare, ArrowRight, TrendingUp, CheckCircle2, Star,
  Play, UserPlus,
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
    bg: 'bg-sky-500/10 border-sky-500/20',
    text: 'text-sky-400',
    glow: 'rgba(14,165,233,0.15)',
    title: 'Gestión de clientes',
    desc: 'Perfil completo, historial de entrenamiento y seguimiento personalizado de cada cliente.',
  },
  {
    icon: Dumbbell,
    bg: 'bg-violet-500/10 border-violet-500/20',
    text: 'text-violet-400',
    glow: 'rgba(124,58,237,0.15)',
    title: 'Rutinas personalizadas',
    desc: 'Crea, asigna y ajusta rutinas con ejercicios, series y notas de coaching.',
  },
  {
    icon: UtensilsCrossed,
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'rgba(16,185,129,0.15)',
    title: 'Planes nutricionales',
    desc: 'Diseña menús con macros, calorías y seguimiento diario desde el móvil.',
  },
  {
    icon: CalendarDays,
    bg: 'bg-amber-500/10 border-amber-500/20',
    text: 'text-amber-400',
    glow: 'rgba(245,158,11,0.15)',
    title: 'Gestión de citas',
    desc: 'Agenda presencial, online o videollamada. Recordatorios automáticos incluidos.',
  },
  {
    icon: MessageSquare,
    bg: 'bg-pink-500/10 border-pink-500/20',
    text: 'text-pink-400',
    glow: 'rgba(236,72,153,0.15)',
    title: 'Mensajería integrada',
    desc: 'Chat directo con cada cliente. Sin WhatsApp, sin correos sueltos.',
  },
  {
    icon: TrendingUp,
    bg: 'bg-teal-500/10 border-teal-500/20',
    text: 'text-teal-400',
    glow: 'rgba(20,184,166,0.15)',
    title: 'Progreso y analytics',
    desc: 'Gráficas de evolución, fotos de progreso y métricas que tus clientes verán.',
  },
]

const STATS = [
  { value: '500+',   label: 'Entrenadores activos' },
  { value: '8.000+', label: 'Clientes gestionados' },
  { value: '4.9★',   label: 'Valoración media' },
]

const STEPS = [
  {
    n: '01',
    title: 'Regístrate en 2 minutos',
    desc: 'Crea tu cuenta gratis. Sin tarjeta de crédito, sin configuraciones complejas.',
    gradient: '#0EA5E9, #7C3AED',
  },
  {
    n: '02',
    title: 'Añade tus clientes',
    desc: 'Invítalos por email o enlace. Configura rutinas y planes desde el primer día.',
    gradient: '#7C3AED, #10B981',
  },
  {
    n: '03',
    title: 'Gestiona todo en uno',
    desc: 'Citas, nutrición, mensajes y seguimiento de progreso desde un solo panel.',
    gradient: '#10B981, #0EA5E9',
  },
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-slate-100 overflow-x-hidden">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="border-b border-border/50 bg-background/85 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 animate-fade-in">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-glow-sm"
              style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight gradient-text">TrainerBoost</span>
          </div>
          <div className="flex items-center gap-1 animate-fade-in">
            <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 hidden md:block px-3 py-2 rounded-lg hover:bg-surface/70">Precios</Link>
            <Link href="/demo"    className="text-sm text-slate-400 hover:text-white transition-colors duration-150 hidden sm:block px-3 py-2 rounded-lg hover:bg-surface/70">Demo</Link>
            <div className="w-px h-4 bg-border mx-2 hidden sm:block" />
            <Link href="/login"   className="text-sm text-slate-400 hover:text-white transition-colors duration-150 px-3 py-2 rounded-lg hover:bg-surface/70 hidden sm:block">Entrar</Link>
            <Link href="/register" className="btn-gradient text-sm py-2 px-4 ml-1">Probar 14 días gratis</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20">
        {/* Ambient glows */}
        <div className="absolute top-0 left-0 w-[700px] h-[500px] pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at 20% 40%, rgba(14,165,233,0.09) 0%, transparent 65%)' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[400px] pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.07) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(16,185,129,0.04) 0%, transparent 60%)' }} />

        <div className="relative grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            <div className="chip mb-6 w-fit animate-fade-in-up">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse inline-block" />
              Gratis para empezar · Sin tarjeta
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.08] mb-6 text-balance tracking-tight animate-fade-in-up delay-75">
              Deja de gestionar<br />
              clientes por<br />
              <span className="gradient-text">WhatsApp</span>
            </h1>

            <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-lg animate-fade-in-up delay-150">
              TrainerBoost centraliza rutinas, nutrición, citas y pagos de tus clientes en un solo lugar. En español, desde 19€/mes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-in-up delay-200">
              <Link href="/register" className="btn-gradient text-base px-8 py-3">
                <Zap className="w-4 h-4" /> Probar 14 días gratis
              </Link>
              <a href="/demo/trainer" className="btn-secondary flex items-center gap-2 py-3 px-6 text-base">
                <Play className="w-4 h-4" /> Ver demo en vivo
              </a>
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
                 style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(14,165,233,0.15) 0%, rgba(124,58,237,0.08) 50%, transparent 70%)' }} />
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
              <div className="flex" style={{ height: '360px' }}>
                {/* Sidebar */}
                <div className="w-36 bg-surface/60 border-r border-border/60 p-2.5 flex flex-col gap-0.5 shrink-0">
                  <div className="flex items-center gap-1.5 px-2 py-2 mb-1">
                    <div className="w-5 h-5 rounded-md shrink-0"
                         style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }} />
                    <span className="text-[9px] font-bold text-white">TrainerBoost</span>
                  </div>
                  {[
                    { label: 'Panel',     active: true },
                    { label: 'Clientes',  active: false },
                    { label: 'Rutinas',   active: false },
                    { label: 'Nutrición', active: false },
                    { label: 'Citas',     active: false },
                    { label: 'Mensajes',  active: false },
                  ].map(item => (
                    <div key={item.label}
                         className={`text-[9px] px-2 py-1.5 rounded-md transition-colors ${item.active ? 'text-sky-400 font-semibold' : 'text-slate-500'}`}
                         style={item.active ? { background: 'linear-gradient(90deg, rgba(14,165,233,0.15), transparent)' } : {}}>
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
                    <div className="h-5 w-16 rounded-md text-[8px] bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-semibold">
                      + Añadir
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: 'Clientes', value: '24', accent: 'border-sky-500/25 bg-sky-500/8' },
                      { label: 'Citas hoy', value: '6',  accent: 'border-violet-500/25 bg-violet-500/8' },
                      { label: 'Mensajes',  value: '8',  accent: 'border-emerald-500/25 bg-emerald-500/8' },
                      { label: 'Este mes',  value: '2.8k€', accent: 'border-amber-500/25 bg-amber-500/8' },
                    ].map(s => (
                      <div key={s.label} className={`rounded-lg border p-2 transition-colors ${s.accent}`}>
                        <div className="text-[8px] text-slate-500 mb-0.5">{s.label}</div>
                        <div className="text-[12px] font-bold text-white font-mono">{s.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg bg-surface/50 border border-border/60 p-2">
                    <div className="text-[8px] font-semibold text-white mb-1.5">Próximas citas</div>
                    {[
                      { time: '09:00', name: 'Ana García',      type: 'Online' },
                      { time: '11:30', name: 'Pedro López',     type: 'Presencial' },
                      { time: '16:00', name: 'María Fernández', type: 'Online' },
                    ].map(a => (
                      <div key={a.name} className="flex items-center gap-2 py-0.5">
                        <span className="text-[8px] text-slate-500 font-mono w-8 shrink-0">{a.time}</span>
                        <span className="text-[8px] text-slate-300 flex-1 truncate">{a.name}</span>
                        <span className="text-[7px] text-sky-400 shrink-0">{a.type}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg bg-surface/50 border border-border/60 p-2">
                    <div className="text-[8px] font-semibold text-white mb-1.5">Clientes activos</div>
                    {[
                      { i: 'AG', name: 'Ana García',  c: 'bg-sky-500/25 text-sky-300' },
                      { i: 'PL', name: 'Pedro López', c: 'bg-violet-500/25 text-violet-300' },
                      { i: 'MF', name: 'María Fdez.', c: 'bg-emerald-500/25 text-emerald-300' },
                    ].map(c => (
                      <div key={c.name} className="flex items-center gap-1.5 py-0.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 ${c.c}`}>{c.i}</div>
                        <span className="text-[8px] text-slate-300 flex-1">{c.name}</span>
                        <span className="text-[7px] text-emerald-400">Activo</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                   style={{ background: 'linear-gradient(to top, #0F172A, transparent)' }} />
            </div>

            {/* Floating badges — animated */}
            <div className="absolute -left-6 top-16 bg-surface border border-border rounded-xl px-3 py-2 shadow-card-elevated flex items-center gap-2 animate-float">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
              <div>
                <div className="text-[9px] font-semibold text-white">Cita confirmada</div>
                <div className="text-[8px] text-slate-400">Ana · 09:00 Online</div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-20 bg-surface border border-border rounded-xl px-3 py-2 shadow-card-elevated animate-float"
                 style={{ animationDelay: '1.5s' }}>
              <div className="text-[8px] text-slate-400 mb-0.5">Nuevos clientes</div>
              <div className="text-[14px] font-bold text-white font-mono">+12 <span className="text-emerald-400 text-[9px]">este mes</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div className="border-y border-border/50 py-12 bg-surface/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {STATS.map((stat, i) => (
              <div key={stat.value}
                   className={`animate-fade-in-up ${i === 1 ? 'delay-100' : i === 2 ? 'delay-200' : ''} ${i > 0 ? 'border-l border-border/50' : ''}`}>
                <div className="text-3xl md:text-4xl font-bold font-mono gradient-text mb-1.5">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cómo funciona ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="chip-accent mb-4 mx-auto w-fit">Proceso simple</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Empieza en 3 pasos</h2>
          <p className="text-slate-400 max-w-lg mx-auto">Sin configuraciones complejas. En minutos ya tienes tu panel de control listo.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="absolute top-[3.25rem] left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px hidden md:block"
               style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.4), rgba(124,58,237,0.4))' }} />

          {STEPS.map((step, i) => (
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
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="chip mb-4 mx-auto w-fit">Funcionalidades</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Todo lo que necesitas para crecer</h2>
          <p className="text-slate-400 max-w-lg mx-auto">Desde la primera sesión hasta el seguimiento a largo plazo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="card-hover p-6 group"
            >
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${feat.bg}`}
                   style={{ ['--hover-shadow' as string]: `0 0 20px ${feat.glow}` }}>
                <feat.icon className={`w-5 h-5 ${feat.text} transition-transform duration-300 group-hover:scale-110`} />
              </div>
              <h3 className="font-semibold text-white mb-2 group-hover:text-slate-50 transition-colors">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3 pasos para empezar ─────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Empieza en 3 minutos</h2>
          <p className="text-slate-400">Sin tarjeta de crédito. Sin contrato.</p>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Crea tu cuenta', desc: 'Regístrate gratis y configura tu perfil de entrenador en 2 minutos.', icon: UserPlus },
            { step: '2', title: 'Invita a tus clientes', desc: 'Envía un enlace de invitación. Tus clientes acceden al instante.', icon: Users },
            { step: '3', title: 'Gestiona todo', desc: 'Rutinas, nutrición, citas y mensajes en un solo lugar.', icon: Zap },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-black text-slate-700 mb-2">{s.step}</div>
              <h3 className="text-base font-semibold text-white mb-1">{s.title}</h3>
              <p className="text-sm text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-24 border-y border-border/50"
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
                <div className="flex">
                  {Array.from({ length: t.stars }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-border/60">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${t.color}`}>
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
      <section className="max-w-6xl mx-auto px-6 py-24">
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
          {/* Trainer demo */}
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

          {/* Client demo */}
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
                    { name: 'Press banca',   sets: '4×10', done: true },
                    { name: 'Sentadilla',    sets: '4×8',  done: true },
                    { name: 'Remo con barra',sets: '3×12', done: false },
                    { name: 'Press militar', sets: '3×10', done: false },
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
                style={highlight ? { background: 'linear-gradient(160deg, rgba(14,165,233,0.08) 0%, #1E293B 55%)', boxShadow: '0 20px 50px -20px rgba(14,165,233,0.4)' } : undefined}
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
                <Link
                  href="/register"
                  className={`w-full justify-center ${highlight ? 'btn-gradient' : 'btn-secondary'}`}
                >
                  Empezar ahora
                </Link>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-slate-500 mt-8">
          ¿Solo quieres probar? <Link href="/register" className="text-brand-primary hover:underline">Crea una cuenta gratis</Link> y gestiona hasta 3 clientes sin tarjeta.
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
             style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.1) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at 80% 100%, rgba(124,58,237,0.06) 0%, transparent 50%)' }} />

        <div className="relative max-w-2xl mx-auto px-6 text-center animate-fade-in-up">
          <div className="chip mb-6 mx-auto w-fit">Gratis para siempre</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 text-balance tracking-tight">
            Tu negocio merece<br />
            <span className="gradient-text">las mejores herramientas</span>
          </h2>
          <p className="text-slate-400 mb-10 text-lg leading-relaxed">
            Empieza gratis con hasta 3 clientes.<br />Escala a medida que crece tu negocio.
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
              <Zap className="w-5 h-5 text-sky-400" />
              <span className="font-bold text-white">TrainerBoost</span>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
              <a href="/pricing" className="hover:text-slate-300 transition-colors">Precios</a>
              <a href="/demo/trainer" className="hover:text-slate-300 transition-colors">Demo</a>
              <a href="mailto:hola@trainerboost.es" className="hover:text-slate-300 transition-colors">Contacto</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Política de privacidad</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Términos de servicio</a>
            </nav>
          </div>
          <p className="text-center text-xs text-slate-600">© 2025 TrainerBoost · Hecho con ❤️ para entrenadores personales · Spain 🇪🇸</p>
        </div>
      </footer>
    </div>
  )
}
