import Link from 'next/link'
import {
  ArrowRight,
  LayoutDashboard, Dumbbell, UtensilsCrossed, CalendarDays,
  MessageSquare, BarChart2, TrendingUp, CheckCircle2, Users, Zap,
} from 'lucide-react'
import LogoFull from '@/components/logo/LogoFull'
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
  { icon: TrendingUp,   text: 'Progreso y medidas corporales' },
  { icon: Dumbbell,     text: 'Rutina del día con timer de descanso' },
  { icon: UtensilsCrossed, text: 'Plan nutricional y seguimiento de agua' },
  { icon: CalendarDays, text: 'Citas próximas con tu entrenador' },
  { icon: MessageSquare,text: 'Chat directo en tiempo real' },
  { icon: CheckCircle2, text: 'Logros y hitos desbloqueables' },
]

export default function DemoPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#05050A' }}>

      {/* Atmospheric background — brand green top-left, subtle */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[700px] h-[600px]"
             style={{ background: 'radial-gradient(ellipse, rgba(143,212,58,0.07) 0%, transparent 65%)' }} />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px]"
             style={{ background: 'radial-gradient(ellipse, rgba(143,212,58,0.03) 0%, transparent 70%)' }} />
        {/* Horizontal scan line */}
        <div className="absolute top-0 left-0 right-0 h-px"
             style={{ background: 'linear-gradient(90deg, transparent, rgba(143,212,58,0.15), transparent)' }} />
      </div>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(143,212,58,0.08)', background: 'rgba(5,5,10,0.9)', backdropFilter: 'blur(20px)' }}
           className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Inicio">
            <LogoFull height={26} />
          </Link>
          <Link href="/"
                className="text-sm transition-colors duration-150"
                style={{ color: 'rgba(232,228,217,0.4)', fontFamily: 'monospace', letterSpacing: '0.06em', fontSize: '11px', textTransform: 'uppercase' }}>
            ← Inicio
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-28">

        {/* Header */}
        <div className="text-center mb-20">

          {/* Eyebrow chip */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-medium"
               style={{ border: '1px solid rgba(143,212,58,0.2)', background: 'rgba(143,212,58,0.06)', color: 'rgba(232,228,217,0.6)', letterSpacing: '0.08em' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#8FD43A' }} />
            Sin registro · 100% funcional
          </div>

          <h1 style={{ fontFamily: 'inherit', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#F0EDE6' }}
              className="text-4xl md:text-6xl mb-6 text-balance">
            Explora TrainerBoost<br />
            <span style={{ color: '#8FD43A' }}>como si fuera el tuyo</span>
          </h1>

          <p className="text-lg max-w-lg mx-auto leading-relaxed mb-4"
             style={{ color: 'rgba(232,228,217,0.5)' }}>
            Navega por el panel, crea rutinas, revisa citas, explora el chat.
            Todo interactivo. Sin registro.
          </p>

          {/* Disclaimer — cinematic, honest */}
          <p className="text-sm max-w-md mx-auto"
             style={{ color: 'rgba(143,212,58,0.7)', letterSpacing: '0.01em' }}>
            Esto es solo el escaparate. La app real, con tus clientes y tu negocio dentro, es otra dimensión.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-5 mb-16">

          {/* Trainer */}
          <Link href="/demo/trainer" className="group block">
            <div className="relative overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1"
                 style={{
                   border: '1px solid rgba(255,255,255,0.07)',
                   background: 'rgba(255,255,255,0.03)',
                 }}>

              {/* Top accent bar */}
              <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, #8FD43A, #0EA5E9)' }} />

              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-xl"
                   style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(143,212,58,0.05) 0%, transparent 60%)' }} />

              {/* App mockup */}
              <div className="relative overflow-hidden" style={{ height: '168px', background: 'rgba(0,0,0,0.3)' }}>
                <div className="absolute inset-0"
                     style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(143,212,58,0.06) 0%, transparent 70%)' }} />
                <div className="flex h-full">
                  {/* Mini sidebar */}
                  <div className="w-24 p-2 flex flex-col gap-0.5 shrink-0"
                       style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                    {['Panel', 'Clientes', 'Rutinas', 'Citas', 'Mensajes'].map((item, i) => (
                      <div key={item}
                           className="text-[8px] px-1.5 py-1 rounded"
                           style={i === 0
                             ? { background: 'rgba(143,212,58,0.12)', color: '#8FD43A', fontWeight: 600 }
                             : { color: 'rgba(255,255,255,0.25)' }}>
                        {item}
                      </div>
                    ))}
                  </div>
                  {/* Mini content */}
                  <div className="flex-1 p-2.5 space-y-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { l: 'Clientes', v: '24', c: 'rgba(143,212,58,0.15)' },
                        { l: 'Citas hoy', v: '6',  c: 'rgba(14,165,233,0.15)' },
                        { l: 'Mensajes', v: '8',  c: 'rgba(16,185,129,0.15)' },
                        { l: 'Este mes', v: '2.8k€', c: 'rgba(251,191,36,0.12)' },
                      ].map(s => (
                        <div key={s.l} className="rounded p-1.5"
                             style={{ background: s.c, border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div className="text-[7px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.l}</div>
                          <div className="text-[10px] font-bold font-mono" style={{ color: '#F0EDE6' }}>{s.v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded p-1.5"
                         style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-[7px] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Próximas citas</div>
                      {['09:00 · Ana García · Online', '11:30 · Pedro López · Presencial'].map(t => (
                        <div key={t} className="text-[7px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{t}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 h-10 pointer-events-none"
                     style={{ background: 'linear-gradient(to top, rgba(5,5,10,0.9), transparent)' }} />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                       style={{ background: '#8FD43A' }}>
                    <Zap className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <div className="text-base font-bold" style={{ color: '#F0EDE6' }}>Panel Entrenador</div>
                    <div className="text-xs" style={{ color: 'rgba(232,228,217,0.4)' }}>Vista completa de tu negocio</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 mb-5">
                  {TRAINER_FEATURES.map(f => (
                    <div key={f.text} className="flex items-center gap-2">
                      <f.icon className="w-3 h-3 shrink-0" style={{ color: '#8FD43A' }} />
                      <span className="text-xs" style={{ color: 'rgba(232,228,217,0.5)' }}>{f.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold transition-all duration-200 group-hover:gap-3"
                     style={{ color: '#8FD43A' }}>
                  Explorar panel del entrenador
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </Link>

          {/* Client */}
          <Link href="/demo/client" className="group block">
            <div className="relative overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1"
                 style={{
                   border: '1px solid rgba(255,255,255,0.07)',
                   background: 'rgba(255,255,255,0.03)',
                 }}>

              {/* Top accent bar */}
              <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, #10B981, #8FD43A)' }} />

              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-xl"
                   style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.05) 0%, transparent 60%)' }} />

              {/* App mockup */}
              <div className="relative overflow-hidden" style={{ height: '168px', background: 'rgba(0,0,0,0.3)' }}>
                <div className="absolute inset-0"
                     style={{ background: 'radial-gradient(ellipse at 40% 40%, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />
                <div className="p-3">
                  {/* Tabs */}
                  <div className="flex gap-1.5 mb-2.5 pb-2"
                       style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['Progreso', 'Rutina', 'Nutrición', 'Citas', 'Chat'].map((t, i) => (
                      <div key={t}
                           className="text-[8px] px-2 py-0.5 rounded"
                           style={i === 1
                             ? { background: 'rgba(143,212,58,0.15)', color: '#8FD43A', fontWeight: 600 }
                             : { color: 'rgba(255,255,255,0.25)' }}>
                        {t}
                      </div>
                    ))}
                  </div>
                  <div className="text-[9px] font-semibold mb-2" style={{ color: '#F0EDE6' }}>Fuerza + Hipertrofia · Hoy</div>
                  <div className="space-y-1.5">
                    {[
                      { n: 'Press banca', s: '4×10', done: true },
                      { n: 'Sentadilla',  s: '4×8',  done: true },
                      { n: 'Peso muerto', s: '3×6',  done: false },
                      { n: 'Remo barra',  s: '3×12', done: false },
                    ].map(ex => (
                      <div key={ex.n} className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded flex items-center justify-center text-[6px] shrink-0"
                             style={ex.done
                               ? { background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }
                               : { border: '1px solid rgba(255,255,255,0.12)' }}>
                          {ex.done ? '✓' : ''}
                        </div>
                        <span className="text-[8px] flex-1"
                              style={{ color: ex.done ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)', textDecoration: ex.done ? 'line-through' : 'none' }}>
                          {ex.n}
                        </span>
                        <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{ex.s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 h-10 pointer-events-none"
                     style={{ background: 'linear-gradient(to top, rgba(5,5,10,0.9), transparent)' }} />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                       style={{ background: 'linear-gradient(135deg, #10B981, #8FD43A)' }}>
                    <Users className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <div className="text-base font-bold" style={{ color: '#F0EDE6' }}>Portal del Cliente</div>
                    <div className="text-xs" style={{ color: 'rgba(232,228,217,0.4)' }}>Lo que ven tus clientes cada día</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 mb-5">
                  {CLIENT_FEATURES.map(f => (
                    <div key={f.text} className="flex items-center gap-2">
                      <f.icon className="w-3 h-3 shrink-0" style={{ color: '#10B981' }} />
                      <span className="text-xs" style={{ color: 'rgba(232,228,217,0.5)' }}>{f.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold transition-all duration-200 group-hover:gap-3"
                     style={{ color: '#10B981' }}>
                  Explorar portal del cliente
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-xl p-8 text-center"
             style={{ border: '1px solid rgba(143,212,58,0.12)', background: 'rgba(143,212,58,0.04)' }}>
          <DemoWaitlistCTA
            title="¿Te convence lo que ves?"
            subtitle="Apúntate a la lista de espera. Te avisamos el día que abramos, antes que nadie."
          />
          <p className="text-xs mt-5" style={{ color: 'rgba(232,228,217,0.25)' }}>
            Sin compromiso · Gratis para siempre hasta 5 clientes
          </p>
        </div>

      </div>
    </div>
  )
}
