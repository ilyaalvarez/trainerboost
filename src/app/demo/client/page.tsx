'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Zap, Users, Dumbbell, UtensilsCrossed, CalendarDays,
  MessageSquare, TrendingUp, Check, ExternalLink, Flame,
  Droplets, Trophy, Activity, Clock,
  ArrowUpRight,
} from 'lucide-react'

// ─── Counter hook ─────────────────────────────────────────────
function useCountUp(target: number, duration = 900): number {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setCount(Math.round(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    const id = requestAnimationFrame(step)
    return () => cancelAnimationFrame(id)
  }, [target, duration])
  return count
}

// ─── SVG Progress Ring ────────────────────────────────────────
function Ring({ pct, size = 120, stroke = 10, color = '#10B981', bg = 'rgba(255,255,255,0.05)' }: {
  pct: number; size?: number; stroke?: number; color?: string; bg?: string
}) {
  const r = (size - stroke * 2) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
        style={{ transition: 'stroke-dashoffset 1.2s ease', strokeLinecap: 'round' }} />
    </svg>
  )
}

// ─── Macro bar ────────────────────────────────────────────────
function MacroBar({ label, value, max, color, unit }: {
  label: string; value: number; max: number; color: string; unit: string
}) {
  const pct = Math.round((value / max) * 100)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className="font-mono font-semibold text-white">{value}{unit} <span className="text-slate-500">/ {max}{unit}</span></span>
      </div>
      <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
             style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

// ─── Mock data ────────────────────────────────────────────────
const EXERCISES = [
  { id: 1, name: 'Press de banca',   sets: 4, reps: 10, rest: 90,  cat: 'Pecho',   notes: 'Bajar controlado, 2s excéntrico' },
  { id: 2, name: 'Sentadilla libre', sets: 4, reps: 8,  rest: 120, cat: 'Piernas', notes: 'Profundidad paralela, rodillas alineadas' },
  { id: 3, name: 'Remo con barra',   sets: 3, reps: 12, rest: 75,  cat: 'Espalda', notes: 'Codos pegados, aprieta en el pico' },
  { id: 4, name: 'Press militar',    sets: 3, reps: 10, rest: 90,  cat: 'Hombros', notes: null },
  { id: 5, name: 'Fondos en barra',  sets: 3, reps: 12, rest: 60,  cat: 'Tríceps', notes: 'Ligera inclinación hacia delante' },
]

const MEALS = [
  { time: '08:00', name: 'Desayuno',  desc: 'Avena + proteína + plátano',        kcal: 420, p: 35, c: 58, f: 9,  done: true  },
  { time: '11:30', name: 'Media m.', desc: 'Manzana + frutos secos 30g',          kcal: 210, p: 5,  c: 24, f: 11, done: true  },
  { time: '14:00', name: 'Comida',    desc: 'Pollo a la plancha + arroz + ensalada', kcal: 680, p: 52, c: 72, f: 14, done: false },
  { time: '17:00', name: 'Merienda', desc: 'Yogur griego + frutos secos',          kcal: 280, p: 20, c: 18, f: 16, done: false },
  { time: '20:30', name: 'Cena',      desc: 'Merluza + verduras + patata',          kcal: 510, p: 45, c: 38, f: 12, done: false },
]

const WEIGHT_DATA = [77.0, 76.5, 76.2, 75.8, 75.4, 75.1, 74.8, 74.5, 74.2]

const NAV_ITEMS = [
  { icon: TrendingUp,      label: 'Progreso',   key: 'progress' },
  { icon: Dumbbell,        label: 'Mi Rutina',  key: 'routine' },
  { icon: UtensilsCrossed, label: 'Nutrición',  key: 'nutrition' },
  { icon: CalendarDays,    label: 'Citas',       key: 'appointments' },
  { icon: MessageSquare,   label: 'Mensajes',   key: 'messages' },
]

const CAT_COLORS: Record<string, string> = {
  Pecho:   'bg-sky-500/15 text-sky-300 border-sky-500/20',
  Piernas: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  Espalda: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  Hombros: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  Tríceps: 'bg-red-500/15 text-red-300 border-red-500/20',
}

// ─── Main Component ───────────────────────────────────────────
export default function ClientDemoPage() {
  const [done, setDone]         = useState<Set<number>>(new Set([1, 2]))
  const [activeTab, setActiveTab] = useState('routine')
  const [water, setWater]       = useState(4)
  const [mealsDone, setMealsDone] = useState<Set<number>>(new Set([0, 1]))

  function toggle(id: number) {
    setDone(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  function toggleMeal(idx: number) {
    setMealsDone(prev => { const next = new Set(prev); if (next.has(idx)) next.delete(idx); else next.add(idx); return next })
  }

  const completedCount = done.size
  const progress       = Math.round((completedCount / EXERCISES.length) * 100)
  const streak         = useCountUp(12)
  const weightLost     = useCountUp(28)  // decimas → 2.8 kg

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Demo banner ── */}
      <div className="w-full px-4 py-3 flex items-center justify-between gap-4 text-sm sticky top-0 z-50 border-b border-brand-accent/20"
           style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.10), rgba(14,165,233,0.07))' }}>
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', color: 'white' }}>
            DEMO
          </span>
          <span className="text-slate-300 hidden sm:block">Portal de cliente — interactúa con ejercicios y nutrición</span>
          <span className="text-slate-300 sm:hidden">Portal cliente · Demo</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/demo" className="text-xs text-slate-400 hover:text-white transition-colors hidden sm:block">← Volver</Link>
          <Link href="/register" className="btn-gradient text-xs px-4 py-1.5">
            <Zap className="w-3 h-3" /> Crear cuenta
          </Link>
        </div>
      </div>

      {/* ── Topbar ── */}
      <header className="bg-surface/90 backdrop-blur-md border-b border-border sticky top-[49px] z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-sm">TrainerBoost</span>
            </div>

            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_ITEMS.map(item => (
                <button key={item.key} onClick={() => setActiveTab(item.key)}
                        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all"
                        style={activeTab === item.key ? { background: 'rgba(14,165,233,0.08)' } : {}}>
                  <item.icon className={`w-3.5 h-3.5 transition-colors ${activeTab === item.key ? 'text-brand-primary' : 'text-slate-500'}`} />
                  <span className={`transition-colors ${activeTab === item.key ? 'text-brand-primary' : 'text-slate-400'}`}>{item.label}</span>
                  {activeTab === item.key && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                          style={{ background: 'linear-gradient(90deg, #0EA5E9, #7C3AED)' }} />
                  )}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                <Flame className="w-3.5 h-3.5" />
                <span>{streak}d racha</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-xs font-bold">AG</div>
            </div>
          </div>

          {/* Mobile nav */}
          <nav className="flex md:hidden items-center gap-0.5 pb-2 overflow-x-auto">
            {NAV_ITEMS.map(item => (
              <button key={item.key} onClick={() => setActiveTab(item.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === item.key ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-400'}`}>
                <item.icon className="w-3.5 h-3.5" />{item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

          {/* ═══ PROGRESO ═══ */}
          {activeTab === 'progress' && (
            <>
              <div className="animate-fade-in-up">
                <div className="text-xs text-brand-accent font-semibold uppercase tracking-widest mb-1">Mi evolución</div>
                <h1 className="text-2xl font-bold text-white">Progreso</h1>
                <p className="text-slate-400 text-sm mt-0.5">Últimos 3 meses · Entrenador: Carlos Martínez</p>
              </div>

              {/* Main ring + stats */}
              <div className="grid sm:grid-cols-2 gap-6 animate-fade-in-up delay-75">

                {/* Big ring */}
                <div className="card p-6 flex flex-col items-center gap-4">
                  <div className="relative">
                    <Ring pct={progress || 78} size={130} stroke={11} color="#10B981" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold font-mono text-white">{progress || 78}%</span>
                      <span className="text-xs text-slate-400">objetivo mes</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-white">Objetivo del mes</div>
                    <div className="text-sm text-slate-400 mt-0.5">20 sesiones completadas / 24</div>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 content-start">
                  {[
                    { label: 'Peso actual',    value: '74.2',  unit: 'kg',   change: '-2.8',  positive: true,  color: 'text-emerald-400', icon: TrendingUp },
                    { label: 'Grasa corporal', value: '17.4',  unit: '%',    change: '-1.2',  positive: true,  color: 'text-sky-400',     icon: Activity },
                    { label: 'Masa muscular',  value: '38.1',  unit: 'kg',   change: '+1.4',  positive: true,  color: 'text-violet-400',  icon: Dumbbell },
                    { label: 'Racha actual',   value: `${streak}`,  unit: 'días', change: 'récord', positive: true, color: 'text-amber-400',  icon: Flame },
                  ].map((s, i) => (
                    <div key={s.label} className="card p-4 animate-fade-in-up"
                         style={{ animationDelay: `${150 + i * 80}ms` }}>
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide leading-tight">{s.label}</span>
                        <s.icon className={`w-3.5 h-3.5 shrink-0 ${s.color}`} />
                      </div>
                      <div className="text-xl font-bold font-mono text-white leading-none">
                        {s.value}<span className="text-sm font-normal text-slate-400 ml-1">{s.unit}</span>
                      </div>
                      <div className={`text-xs font-semibold mt-1.5 ${s.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {s.change}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Streak + milestones */}
              <div className="grid sm:grid-cols-2 gap-4 animate-fade-in-up delay-200">
                <div className="card p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                       style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.15))', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <Flame className="w-7 h-7 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold font-mono text-amber-400">{streak}</div>
                    <div className="font-semibold text-white">días de racha</div>
                    <div className="text-xs text-slate-400 mt-0.5">¡Tu mejor marca personal!</div>
                  </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                       style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(14,165,233,0.15))', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <Trophy className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold font-mono text-emerald-400">−{(weightLost / 10).toFixed(1)}</div>
                    <div className="font-semibold text-white">kg perdidos</div>
                    <div className="text-xs text-slate-400 mt-0.5">En los últimos 3 meses</div>
                  </div>
                </div>
              </div>

              {/* Weight chart */}
              <div className="card p-6 animate-fade-in-up delay-300">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-semibold text-white">Evolución del peso</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Mar — May 2025</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 rotate-90" />
                    −2.8 kg
                  </span>
                </div>
                <div className="flex items-end gap-2 h-28">
                  {WEIGHT_DATA.map((v, i) => {
                    const h = ((v - 73) / 5) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        {i === WEIGHT_DATA.length - 1 && (
                          <span className="text-[9px] font-bold text-emerald-400">{v}</span>
                        )}
                        <div className="w-full rounded-t-sm transition-all duration-700"
                             style={{
                               height: `${h}%`,
                               minHeight: '4px',
                               background: i === WEIGHT_DATA.length - 1 ? 'linear-gradient(180deg, #10B981, #0EA5E9)' : 'rgba(14,165,233,0.2)',
                               boxShadow: i === WEIGHT_DATA.length - 1 ? '0 0 8px rgba(16,185,129,0.35)' : 'none',
                             }} />
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-600 px-1">
                  <span>1 Mar</span><span>15 Mar</span><span>1 Abr</span><span>15 Abr</span><span>1 May</span><span>15 May</span><span>Hoy</span>
                </div>
              </div>
            </>
          )}

          {/* ═══ RUTINA ═══ */}
          {activeTab === 'routine' && (
            <>
              <div className="animate-fade-in-up">
                <div className="text-xs text-brand-accent font-semibold mb-1 uppercase tracking-widest">Rutina de hoy · Jueves</div>
                <h1 className="text-2xl font-bold text-white">Fuerza + Hipertrofia</h1>
                <p className="text-slate-400 text-sm mt-1">Lun · Mié · Vie · Diseñada por Carlos Martínez</p>
              </div>

              {/* Progress card */}
              <div className="card p-5 animate-fade-in-up delay-75">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">Progreso de hoy</span>
                  <span className="font-mono text-sm font-bold text-brand-primary">{completedCount}/{EXERCISES.length}</span>
                </div>
                <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                       style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #10B981, #0EA5E9)' }} />
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <p className="text-xs text-slate-400">{progress}% completado · {EXERCISES.length - completedCount} ejercicios restantes</p>
                  {progress === 100 && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-fade-in">
                      <Trophy className="w-3 h-3" /> ¡Sesión completada!
                    </span>
                  )}
                </div>
              </div>

              {/* Exercises */}
              <div className="space-y-3">
                {EXERCISES.map((ex, i) => {
                  const isDone = done.has(ex.id)
                  return (
                    <button key={ex.id} onClick={() => toggle(ex.id)}
                            className={`w-full text-left card transition-all duration-200 cursor-pointer active:scale-[0.99] animate-fade-in-up ${isDone ? 'border-emerald-500/25' : 'hover:border-border-bright hover:-translate-y-0.5'}`}
                            style={{
                              animationDelay: `${i * 70}ms`,
                              background: isDone ? 'linear-gradient(180deg, rgba(16,185,129,0.05), #1E293B)' : undefined,
                            }}>
                      <div className="flex items-center gap-4 p-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${isDone ? 'text-white' : 'bg-surface-2 border border-border text-slate-400'}`}
                             style={isDone ? { background: 'linear-gradient(135deg, #10B981, #0EA5E9)' } : {}}>
                          {isDone ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm transition-all ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                            {ex.name}
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CAT_COLORS[ex.cat]}`}>{ex.cat}</span>
                            <span className="text-xs text-slate-400">{ex.sets} × {ex.reps} reps</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />{ex.rest}s
                            </span>
                          </div>
                        </div>
                        {ex.notes && (
                          <div className="hidden sm:block text-xs text-slate-500 italic max-w-[180px] truncate">&ldquo;{ex.notes}&rdquo;</div>
                        )}
                        <span className={`text-xs font-semibold shrink-0 ${isDone ? 'text-emerald-400' : 'text-slate-600'}`}>
                          {isDone ? '✓ Hecho' : 'Marcar'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {progress === 100 && (
                <div className="rounded-2xl p-6 text-center border border-emerald-500/20 animate-fade-in"
                     style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,165,233,0.05))' }}>
                  <Trophy className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white mb-1">¡Sesión completada!</h3>
                  <p className="text-slate-400 text-sm">Carlos registrará tu progreso en las próximas horas.</p>
                </div>
              )}
            </>
          )}

          {/* ═══ NUTRICIÓN ═══ */}
          {activeTab === 'nutrition' && (
            <>
              <div className="animate-fade-in-up">
                <div className="text-xs text-brand-accent font-semibold uppercase tracking-widest mb-1">Plan nutricional</div>
                <h1 className="text-2xl font-bold text-white">Nutrición de hoy</h1>
                <p className="text-slate-400 text-sm mt-0.5">Diseñado por Carlos Martínez · 2.100 kcal objetivo</p>
              </div>

              {/* Macros summary */}
              <div className="card p-6 animate-fade-in-up delay-75">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-white">Macros de hoy</h2>
                  <span className="text-xs text-slate-400 font-mono">630 / 2.100 kcal</span>
                </div>
                <div className="space-y-4 mb-5">
                  <MacroBar label="Proteína"      value={40}  max={152} color="#0EA5E9" unit="g" />
                  <MacroBar label="Carbohidratos" value={82}  max={250} color="#7C3AED" unit="g" />
                  <MacroBar label="Grasas"        value={20}  max={70}  color="#F59E0B" unit="g" />
                </div>
                <div className="grid grid-cols-4 gap-3 pt-4 border-t border-border/50">
                  {[
                    { label: 'Calorías', value: '630',  unit: 'kcal', color: 'text-amber-400' },
                    { label: 'Proteína', value: '40',   unit: 'g',    color: 'text-sky-400' },
                    { label: 'Carbos',   value: '82',   unit: 'g',    color: 'text-violet-400' },
                    { label: 'Grasas',   value: '20',   unit: 'g',    color: 'text-orange-400' },
                  ].map(m => (
                    <div key={m.label} className="text-center">
                      <div className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</div>
                      <div className="text-[10px] text-slate-500">{m.unit}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Water tracker */}
              <div className="card p-5 animate-fade-in-up delay-150">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-sky-400" />
                    <h2 className="font-semibold text-white">Hidratación</h2>
                  </div>
                  <span className="text-sm font-mono font-bold text-sky-400">{water} / 8 vasos</span>
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <button key={i} onClick={() => setWater(i + 1)}
                            className={`flex-1 h-8 rounded-lg border transition-all duration-200 ${i < water ? 'border-sky-500/40' : 'border-border bg-surface-2'}`}
                            style={i < water ? { background: 'linear-gradient(180deg, rgba(14,165,233,0.3), rgba(14,165,233,0.1))' } : {}}>
                      {i < water && <Droplets className="w-3 h-3 text-sky-400 mx-auto" />}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">Toca para registrar un vaso · {8 - water} restantes hoy</p>
              </div>

              {/* Meals */}
              <div className="card p-6 animate-fade-in-up delay-200">
                <h2 className="font-semibold text-white mb-5">Comidas del día</h2>
                <div className="space-y-3">
                  {MEALS.map((meal, idx) => {
                    const isChecked = mealsDone.has(idx)
                    return (
                      <button key={idx} onClick={() => toggleMeal(idx)}
                              className={`w-full flex items-center gap-4 p-3.5 rounded-xl text-left transition-all ${isChecked ? 'opacity-60' : 'hover:bg-surface-2'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${isChecked ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-surface-2 border border-border'}`}>
                          {isChecked ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="text-[10px] font-bold text-slate-500">{meal.time.split(':')[0]}h</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400">{meal.time} · {meal.name}</span>
                          </div>
                          <div className={`text-sm font-medium mt-0.5 truncate ${isChecked ? 'line-through text-slate-500' : 'text-white'}`}>
                            {meal.desc}
                          </div>
                        </div>
                        <div className="flex gap-3 text-xs shrink-0">
                          <span className="text-amber-400 font-mono">{meal.kcal}cal</span>
                          <span className="text-sky-400 hidden sm:block">{meal.p}g P</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* ═══ CITAS ═══ */}
          {activeTab === 'appointments' && (
            <>
              <div className="animate-fade-in-up">
                <h1 className="text-2xl font-bold text-white">Mis citas</h1>
                <p className="text-slate-400 text-sm mt-0.5">Sesiones con Carlos Martínez</p>
              </div>

              {/* Next appointment highlight */}
              <div className="rounded-2xl p-6 border border-brand-primary/25 animate-fade-in-up delay-75"
                   style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(124,58,237,0.05))' }}>
                <div className="text-xs text-brand-primary font-semibold uppercase tracking-widest mb-3">Próxima sesión</div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-2xl font-bold text-white">Hoy · 11:30</div>
                    <div className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> 60 min · Online
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold font-mono gradient-text">45</div>
                    <div className="text-xs text-slate-400">min restantes</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 animate-fade-in-up delay-150">
                {[
                  { date: 'Hoy, Jue 29 Mayo',  time: '11:30', type: 'Online',     duration: '60 min', status: 'confirmed', highlight: true },
                  { date: 'Lun, 2 Junio',       time: '10:00', type: 'Presencial', duration: '90 min', status: 'pending',   highlight: false },
                  { date: 'Mié, 4 Junio',       time: '11:30', type: 'Online',     duration: '60 min', status: 'pending',   highlight: false },
                  { date: 'Vie, 6 Junio',       time: '09:00', type: 'Online',     duration: '60 min', status: 'pending',   highlight: false },
                ].map((apt, i) => (
                  <div key={i} className={`card p-5 flex items-center gap-4 hover:border-border-bright transition-all hover:-translate-y-0.5 animate-fade-in-up ${apt.highlight ? 'border-brand-primary/30' : ''}`}
                       style={{ animationDelay: `${200 + i * 80}ms` }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                         style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' }}>
                      <CalendarDays className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{apt.date}</div>
                      <div className="text-sm text-slate-400 mt-0.5">{apt.time} · {apt.duration} · {apt.type}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${apt.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700/80 text-slate-400 border border-slate-600/50'}`}>
                      {apt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═══ MENSAJES ═══ */}
          {activeTab === 'messages' && (
            <>
              <div className="animate-fade-in-up">
                <h1 className="text-2xl font-bold text-white">Mensajes</h1>
                <p className="text-slate-400 text-sm mt-0.5">Conversación con Carlos Martínez</p>
              </div>
              <div className="card p-6 animate-fade-in-up delay-75">
                <div className="space-y-5">
                  {[
                    { from: 'trainer', text: '¡Hola Ana! He revisado tus medidas y vamos genial. Bajada de peso constante y ganando músculo a la vez 💪', time: '09:15' },
                    { from: 'client',  text: 'Gracias Carlos! La verdad que me noto con mucha más energía también.', time: '09:32' },
                    { from: 'trainer', text: 'Perfecto. Esta semana intenta llegar a las 8h de sueño, es clave para la recuperación muscular y la pérdida de grasa.', time: '09:35' },
                    { from: 'client',  text: '¡Entendido! ¿La rutina de mañana es igual que la de hoy?', time: '10:02' },
                    { from: 'trainer', text: 'No, mañana es día de descanso activo. Pasado mañana toca Cardio + Core. Te lo subo ahora a la app 👍', time: '10:05' },
                    { from: 'client',  text: 'Perfecto, gracias! A ver si llego al objetivo de peso antes del verano 😄', time: '10:28' },
                  ].map((msg, i) => (
                    <div key={i} className={`flex gap-3 animate-fade-in-up ${msg.from === 'client' ? 'flex-row-reverse' : ''}`}
                         style={{ animationDelay: `${i * 80}ms` }}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${msg.from === 'trainer' ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {msg.from === 'trainer' ? 'CM' : 'AG'}
                      </div>
                      <div className={`max-w-[72%] flex flex-col gap-1 ${msg.from === 'client' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.from === 'trainer' ? 'bg-surface-2 text-white rounded-tl-sm' : 'text-white rounded-tr-sm'}`}
                             style={msg.from === 'client' ? { background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' } : {}}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-slate-600 px-1">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-4 mt-2 border-t border-border/60">
                  <input disabled placeholder="Escribe un mensaje..." className="input flex-1 opacity-50 cursor-not-allowed text-sm" />
                  <button disabled className="btn-gradient px-4 opacity-40 cursor-not-allowed text-sm">Enviar</button>
                </div>
              </div>
            </>
          )}

          {/* ═══ CTA ═══ */}
          <div className="rounded-2xl p-8 text-center border border-brand-accent/20 animate-fade-in-up"
               style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(14,165,233,0.05))' }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Users className="w-4 h-4 text-brand-accent" />
              <span className="text-xs font-semibold text-brand-accent uppercase tracking-widest">Esto es lo que recibirán tus clientes</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">¿Quieres darle esto a tus clientes?</h3>
            <p className="text-slate-400 text-sm mb-6">Regístrate como entrenador y empieza a gestionar tus clientes hoy mismo.</p>
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
