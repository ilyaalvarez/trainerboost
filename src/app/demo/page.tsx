import Link from 'next/link'
import {
  Zap, Users, ArrowRight, ArrowLeft,
  LayoutDashboard, Dumbbell, UtensilsCrossed, CalendarDays,
  MessageSquare, BarChart2, TrendingUp, CheckCircle2,
} from 'lucide-react'
import DemoWaitlistCTA from '@/components/demo/DemoWaitlistCTA'

const TRAINER_FEATURES = [
  { icon: LayoutDashboard, text: 'Dashboard con KPIs en tiempo real' },
  { icon: Users,           text: 'Gestión completa de clientes' },
  { icon: Dumbbell,        text: 'Rutinas con ejercicios y series' },
  { icon: UtensilsCrossed, text: 'Planes nutricionales con macros' },
  { icon: CalendarDays,    text: 'Agenda de citas y sesiones' },
  { icon: BarChart2,       text: 'Analytics de ingresos y retención' },
]

const CLIENT_FEATURES = [
  { icon: TrendingUp,      text: 'Progreso y medidas corporales' },
  { icon: Dumbbell,        text: 'Rutina del día con timer de descanso' },
  { icon: UtensilsCrossed, text: 'Plan nutricional y seguimiento de agua' },
  { icon: CalendarDays,    text: 'Citas próximas con tu entrenador' },
  { icon: MessageSquare,   text: 'Chat directo en tiempo real' },
  { icon: CheckCircle2,    text: 'Logros y hitos desbloqueables' },
]

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px]"
             style={{ background: 'radial-gradient(ellipse, rgba(14,165,233,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px]"
             style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/85 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                 style={{ background: '#8FD43A' }}>
              <Zap className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">TrainerBoost</span>
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 px-3 py-1.5 rounded-lg hover:bg-surface/70">
            Volver al inicio
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-16 pb-24">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-12 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" /> Volver al inicio
        </Link>

        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="chip mb-5 mx-auto w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse inline-block" />
            Sin registro · Sin tarjeta · 100% funcional
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight text-balance">
            Prueba TrainerBoost<br />
            <span className="gradient-text">como si fuera tuyo</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Datos reales de demostración. Todas las funcionalidades activas.<br />
            Elige tu perspectiva y explora.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">

          {/* Trainer */}
          <Link href="/demo/trainer" className="group block animate-fade-in-up delay-100">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:-translate-y-2 hover:border-brand-primary/50 hover:shadow-card-hover"
                 style={{ '--hover-glow': 'rgba(14,165,233,0.15)' } as React.CSSProperties}>

              {/* Top accent bar */}
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #0EA5E9, #7C3AED)' }} />

              {/* Glow overlay on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                   style={{ boxShadow: 'inset 0 0 60px rgba(14,165,233,0.06)' }} />

              {/* App mockup */}
              <div className="relative bg-background/60 border-b border-border/60 overflow-hidden"
                   style={{ height: '160px' }}>
                <div className="absolute inset-0"
                     style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(14,165,233,0.08) 0%, transparent 70%)' }} />
                <div className="flex h-full">
                  {/* Mini sidebar */}
                  <div className="w-24 border-r border-border/50 p-2 flex flex-col gap-0.5 shrink-0">
                    {['Panel', 'Clientes', 'Rutinas', 'Citas', 'Mensajes'].map((item, i) => (
                      <div key={item}
                           className={`text-[8px] px-1.5 py-1 rounded ${i === 0 ? 'text-sky-400 font-semibold' : 'text-slate-600'}`}
                           style={i === 0 ? { background: 'rgba(14,165,233,0.1)' } : {}}>
                        {item}
                      </div>
                    ))}
                  </div>
                  {/* Mini content */}
                  <div className="flex-1 p-2.5 space-y-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { l: 'Clientes', v: '24', c: 'border-sky-500/25' },
                        { l: 'Citas hoy', v: '6', c: 'border-violet-500/25' },
                        { l: 'Mensajes', v: '8', c: 'border-emerald-500/25' },
                        { l: 'Este mes', v: '2.8k€', c: 'border-amber-500/25' },
                      ].map(s => (
                        <div key={s.l} className={`rounded border p-1.5 bg-surface/50 ${s.c}`}>
                          <div className="text-[7px] text-slate-500">{s.l}</div>
                          <div className="text-[10px] font-bold text-white font-mono">{s.v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded bg-surface/50 border border-border/50 p-1.5">
                      <div className="text-[7px] text-slate-500 mb-1">Próximas citas</div>
                      {['09:00 · Ana García · Online', '11:30 · Pedro López · Presencial'].map(t => (
                        <div key={t} className="text-[7px] text-slate-400">{t}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 h-8 pointer-events-none"
                     style={{ background: 'linear-gradient(to top, #1E293B, transparent)' }} />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-glow-sm shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-primary"
                       style={{ background: '#8FD43A' }}>
                    <Zap className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">Panel Entrenador</div>
                    <div className="text-xs text-slate-400">Vista completa de tu negocio</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-5">
                  {TRAINER_FEATURES.map(f => (
                    <div key={f.text} className="flex items-center gap-2">
                      <f.icon className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span className="text-xs text-slate-400">{f.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                  Explorar panel del entrenador
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </Link>

          {/* Client */}
          <Link href="/demo/client" className="group block animate-fade-in-up delay-200">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:-translate-y-2 hover:border-brand-accent/50 hover:shadow-card-hover">

              {/* Top accent bar */}
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #10B981, #0EA5E9)' }} />

              {/* Glow overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                   style={{ boxShadow: 'inset 0 0 60px rgba(16,185,129,0.05)' }} />

              {/* App mockup */}
              <div className="relative bg-background/60 border-b border-border/60 overflow-hidden"
                   style={{ height: '160px' }}>
                <div className="absolute inset-0"
                     style={{ background: 'radial-gradient(ellipse at 40% 40%, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
                <div className="p-3">
                  {/* Tabs */}
                  <div className="flex gap-1.5 mb-2.5 pb-2 border-b border-border/50">
                    {['Progreso', 'Rutina', 'Nutrición', 'Citas', 'Chat'].map((t, i) => (
                      <div key={t}
                           className={`text-[8px] px-2 py-0.5 rounded ${i === 1 ? 'bg-brand-primary/15 text-brand-primary font-semibold' : 'text-slate-600'}`}>
                        {t}
                      </div>
                    ))}
                  </div>
                  <div className="text-[9px] font-semibold text-white mb-2">Fuerza + Hipertrofia · Hoy</div>
                  <div className="space-y-1.5">
                    {[
                      { n: 'Press banca', s: '4×10', done: true },
                      { n: 'Sentadilla',  s: '4×8',  done: true },
                      { n: 'Peso muerto', s: '3×6',  done: false },
                      { n: 'Remo barra',  s: '3×12', done: false },
                    ].map(ex => (
                      <div key={ex.n} className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[6px] shrink-0 ${ex.done ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'border-border/60 text-slate-600'}`}>
                          {ex.done ? '✓' : ''}
                        </div>
                        <span className={`text-[8px] flex-1 ${ex.done ? 'line-through text-slate-600' : 'text-slate-300'}`}>{ex.n}</span>
                        <span className="text-[8px] text-slate-500">{ex.s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 h-8 pointer-events-none"
                     style={{ background: 'linear-gradient(to top, #1E293B, transparent)' }} />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-glow-sm shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-accent"
                       style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)' }}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">Portal del Cliente</div>
                    <div className="text-xs text-slate-400">Lo que ven tus clientes cada día</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-5">
                  {CLIENT_FEATURES.map(f => (
                    <div key={f.text} className="flex items-center gap-2">
                      <f.icon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-xs text-slate-400">{f.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-brand-accent font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                  Explorar portal del cliente
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Bottom CTA — waitlist */}
        <div className="animate-fade-in-up delay-300 rounded-2xl border border-border bg-surface p-8 text-center">
          <DemoWaitlistCTA
            title="¿Te convence lo que ves?"
            subtitle="Apúntate a la lista de espera. Te avisamos el día que abramos, antes que nadie."
          />
          <p className="text-xs text-slate-500 mt-5">Sin tarjeta · Gratis para siempre hasta 5 clientes</p>
        </div>
      </div>
    </div>
  )
}
