import Link from 'next/link'
import {
  Zap, Users, Dumbbell, UtensilsCrossed, CalendarDays,
  MessageSquare, TrendingUp, Check, Play, ExternalLink,
} from 'lucide-react'

const MOCK_EXERCISES = [
  { id: 1, name: 'Press de banca',   sets: 4, reps: 10, rest: 90,  notes: 'Bajar controlado, 2 segundos de excéntrico',    done: true },
  { id: 2, name: 'Sentadilla libre', sets: 4, reps: 8,  rest: 120, notes: 'Profundidad paralela. Rodillas no hacia dentro', done: true },
  { id: 3, name: 'Remo con barra',   sets: 3, reps: 12, rest: 75,  notes: 'Codos pegados al cuerpo, aprieta en el pico',   done: false },
  { id: 4, name: 'Press militar',    sets: 3, reps: 10, rest: 90,  notes: null,                                            done: false },
  { id: 5, name: 'Fondos en barra',  sets: 3, reps: 12, rest: 60,  notes: 'Ligera inclinación hacia delante',              done: false },
]

const MOCK_PROGRESS = [
  { label: 'Peso actual',  value: '74.2 kg', change: '-2.8 kg', positive: true },
  { label: 'Grasa corporal', value: '17.4%', change: '-1.2%',  positive: true },
  { label: 'Masa muscular', value: '38.1 kg', change: '+1.4 kg', positive: true },
]

const MOCK_MEALS = [
  { time: 'Desayuno · 08:00', name: 'Avena con proteína + fruta',           kcal: 420, p: 35, c: 55, g: 8 },
  { time: 'Comida · 13:30',   name: 'Pollo a la plancha + arroz + ensalada', kcal: 680, p: 52, c: 65, g: 12 },
  { time: 'Merienda · 17:00', name: 'Yogur griego + frutos secos',           kcal: 280, p: 20, c: 22, g: 14 },
  { time: 'Cena · 20:30',     name: 'Merluza + verduras al vapor + patata',  kcal: 510, p: 45, c: 42, g: 9 },
]

const completedCount = MOCK_EXERCISES.filter(e => e.done).length
const progress = Math.round((completedCount / MOCK_EXERCISES.length) * 100)

export default function ClientDemoPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Demo banner ────────────────────────────────────────────────── */}
      <div
        className="w-full px-4 py-3 flex items-center justify-between gap-4 text-sm sticky top-0 z-50 border-b border-brand-accent/20"
        style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.10), rgba(14,165,233,0.07))' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', color: 'white' }}>
            DEMO
          </span>
          <span className="text-slate-300 hidden sm:block">Vista previa del portal de cliente — datos de ejemplo</span>
          <span className="text-slate-300 sm:hidden">Portal cliente · Demo</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/demo" className="text-xs text-slate-400 hover:text-white transition-colors hidden sm:block">
            ← Volver a demos
          </Link>
          <Link href="/register" className="btn-gradient text-xs px-4 py-1.5">
            <Zap className="w-3 h-3" /> Crear cuenta gratis
          </Link>
        </div>
      </div>

      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <header className="bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-sm tracking-tight">TrainerBoost</span>
            </div>

            <nav className="hidden md:flex items-center gap-0.5">
              {[
                { icon: TrendingUp,      label: 'Progreso',  active: false },
                { icon: Dumbbell,        label: 'Mi Rutina', active: true  },
                { icon: UtensilsCrossed, label: 'Nutrición', active: false },
                { icon: CalendarDays,    label: 'Citas',     active: false },
                { icon: MessageSquare,   label: 'Mensajes',  active: false },
              ].map(item => (
                <div
                  key={item.label}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-default"
                  style={item.active ? { background: 'linear-gradient(180deg, rgba(14,165,233,0.1) 0%, transparent 100%)' } : {}}
                >
                  <item.icon className={`w-3.5 h-3.5 ${item.active ? 'text-brand-primary' : 'text-slate-500'}`} />
                  <span className={item.active ? 'text-brand-primary' : 'text-slate-400'}>{item.label}</span>
                  {item.active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                          style={{ background: 'linear-gradient(90deg, #0EA5E9, #7C3AED)' }} />
                  )}
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-xs font-bold">
                AG
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:block">Ana</span>
            </div>
          </div>

          <nav className="flex md:hidden items-center gap-0.5 pb-2 overflow-x-auto">
            {[
              { icon: TrendingUp, label: 'Progreso',  active: false },
              { icon: Dumbbell,   label: 'Mi Rutina', active: true  },
              { icon: UtensilsCrossed, label: 'Nutrición', active: false },
              { icon: CalendarDays,   label: 'Citas',     active: false },
              { icon: MessageSquare,  label: 'Mensajes',  active: false },
            ].map(item => (
              <div key={item.label}
                   className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-default ${item.active ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-400'}`}>
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </div>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

          {/* Page header */}
          <div>
            <div className="text-xs text-brand-accent font-semibold mb-1 uppercase tracking-wide">Rutina de hoy · Jueves</div>
            <h1 className="text-2xl font-bold text-white">Fuerza + Hipertrofia</h1>
            <p className="text-slate-400 text-sm mt-1">
              Lunes · Miércoles · Viernes · Asignada por Carlos Martínez
            </p>
          </div>

          {/* Progress bar */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Progreso de hoy</span>
              <span className="font-mono text-sm font-bold text-brand-primary">{completedCount}/{MOCK_EXERCISES.length}</span>
            </div>
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #0EA5E9, #7C3AED)' }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">{progress}% completado · {MOCK_EXERCISES.length - completedCount} ejercicios restantes</p>
          </div>

          {/* Exercises */}
          <div className="space-y-3">
            {MOCK_EXERCISES.map((ex, i) => (
              <div key={ex.id} className={`card transition-all ${ex.done ? 'border-emerald-500/20' : ''}`}
                   style={ex.done ? { background: 'linear-gradient(180deg, rgba(16,185,129,0.04), #1E293B)' } : {}}>
                <div className="flex items-center gap-4 p-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    ex.done ? 'bg-emerald-500 text-white' : 'bg-surface-2 border border-border text-slate-400'
                  }`}>
                    {ex.done
                      ? <Check className="w-4 h-4" />
                      : <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${ex.done ? 'line-through text-slate-500' : 'text-white'}`}>
                      {ex.name}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400">{ex.sets} series</span>
                      <span className="text-xs text-slate-400">× {ex.reps} reps</span>
                      <span className="text-xs text-slate-400">{ex.rest}s descanso</span>
                    </div>
                  </div>
                  {ex.notes && (
                    <div className="hidden sm:block text-xs text-slate-500 italic max-w-[200px] truncate">
                      &ldquo;{ex.notes}&rdquo;
                    </div>
                  )}
                  {!ex.done && (
                    <button disabled className="p-2 rounded-lg text-slate-500 bg-surface-2 border border-border opacity-50 cursor-not-allowed hidden sm:flex items-center gap-1 text-xs">
                      <Play className="w-3 h-3" /> Ver vídeo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progress stats */}
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-4">Mi progreso</div>
            <div className="grid grid-cols-3 gap-4">
              {MOCK_PROGRESS.map(p => (
                <div key={p.label} className="card p-4">
                  <div className="text-xs text-slate-400 mb-1">{p.label}</div>
                  <div className="text-xl font-bold font-mono text-white">{p.value}</div>
                  <div className={`text-xs font-semibold mt-1 ${p.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {p.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition preview */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
                Plan de hoy
              </h2>
              <span className="text-xs font-mono text-brand-primary">2.890 kcal · 152g proteína</span>
            </div>
            <div className="space-y-3">
              {MOCK_MEALS.map(meal => (
                <div key={meal.name} className="flex items-center gap-4 p-3 rounded-xl bg-surface-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500">{meal.time}</div>
                    <div className="font-medium text-sm text-white truncate">{meal.name}</div>
                  </div>
                  <div className="flex gap-3 text-xs shrink-0">
                    <span className="text-slate-400">{meal.kcal} kcal</span>
                    <span className="text-sky-400 hidden sm:block">{meal.p}g P</span>
                    <span className="text-amber-400 hidden sm:block">{meal.c}g C</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Register CTA */}
          <div
            className="rounded-2xl p-8 text-center border border-brand-accent/20"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(14,165,233,0.05))' }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Users className="w-5 h-5 text-brand-accent" />
              <span className="text-xs font-semibold text-brand-accent uppercase tracking-wide">Esto es lo que recibirá tu cliente</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">¿Quieres darle esto a tus clientes?</h3>
            <p className="text-slate-400 text-sm mb-6">Registra tu cuenta como entrenador y empieza a gestionar a tus clientes hoy mismo.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/register" className="btn-gradient px-8 py-2.5">
                <Zap className="w-4 h-4" /> Registrarme como entrenador
              </Link>
              <Link href="/demo/trainer" className="btn-secondary px-6 py-2.5">
                Ver panel entrenador <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
