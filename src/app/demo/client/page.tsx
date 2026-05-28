'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Zap, Users, Dumbbell, UtensilsCrossed, CalendarDays,
  MessageSquare, TrendingUp, Check, ExternalLink,
} from 'lucide-react'

const EXERCISES_DATA = [
  { id: 1, name: 'Press de banca',   sets: 4, reps: 10, rest: 90,  notes: 'Bajar controlado, 2 segundos de excéntrico' },
  { id: 2, name: 'Sentadilla libre', sets: 4, reps: 8,  rest: 120, notes: 'Profundidad paralela. Rodillas no hacia dentro' },
  { id: 3, name: 'Remo con barra',   sets: 3, reps: 12, rest: 75,  notes: 'Codos pegados al cuerpo, aprieta en el pico' },
  { id: 4, name: 'Press militar',    sets: 3, reps: 10, rest: 90,  notes: null },
  { id: 5, name: 'Fondos en barra',  sets: 3, reps: 12, rest: 60,  notes: 'Ligera inclinación hacia delante' },
]

const MOCK_PROGRESS = [
  { label: 'Peso actual',    value: '74.2 kg', change: '-2.8 kg', positive: true },
  { label: 'Grasa corporal', value: '17.4%',   change: '-1.2%',   positive: true },
  { label: 'Masa muscular',  value: '38.1 kg', change: '+1.4 kg', positive: true },
]

const MOCK_MEALS = [
  { time: 'Desayuno · 08:00', name: 'Avena con proteína + fruta',            kcal: 420, p: 35 },
  { time: 'Comida · 13:30',   name: 'Pollo a la plancha + arroz + ensalada', kcal: 680, p: 52 },
  { time: 'Merienda · 17:00', name: 'Yogur griego + frutos secos',            kcal: 280, p: 20 },
  { time: 'Cena · 20:30',     name: 'Merluza + verduras al vapor + patata',   kcal: 510, p: 45 },
]

const NAV_ITEMS = [
  { icon: TrendingUp,      label: 'Progreso',  key: 'progress' },
  { icon: Dumbbell,        label: 'Mi Rutina', key: 'routine' },
  { icon: UtensilsCrossed, label: 'Nutrición', key: 'nutrition' },
  { icon: CalendarDays,    label: 'Citas',     key: 'appointments' },
  { icon: MessageSquare,   label: 'Mensajes',  key: 'messages' },
]

export default function ClientDemoPage() {
  const [done, setDone] = useState<Set<number>>(new Set([1, 2]))
  const [activeTab, setActiveTab] = useState('routine')

  function toggle(id: number) {
    setDone(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const completedCount = done.size
  const progress = Math.round((completedCount / EXERCISES_DATA.length) * 100)

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Demo banner ──────────────────────────────────────────────── */}
      <div
        className="w-full px-4 py-3 flex items-center justify-between gap-4 text-sm sticky top-0 z-50 border-b border-brand-accent/20"
        style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.10), rgba(14,165,233,0.07))' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', color: 'white' }}>
            DEMO
          </span>
          <span className="text-slate-300 hidden sm:block">Portal de cliente interactivo — toca los ejercicios para marcarlos</span>
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

      {/* ── Topbar ───────────────────────────────────────────────────── */}
      <header className="bg-surface/90 backdrop-blur-md border-b border-border sticky top-[49px] z-40">
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
              {NAV_ITEMS.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all"
                  style={activeTab === item.key ? { background: 'rgba(14,165,233,0.08)' } : {}}
                >
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
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-xs font-bold">
                AG
              </div>
              <span className="text-xs text-slate-400 font-medium hidden sm:block">Ana</span>
            </div>
          </div>

          <nav className="flex md:hidden items-center gap-0.5 pb-2 overflow-x-auto">
            {NAV_ITEMS.map(item => (
              <button key={item.key} onClick={() => setActiveTab(item.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${activeTab === item.key ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-400'}`}>
                <item.icon className="w-3.5 h-3.5" />{item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

          {/* RUTINA */}
          {activeTab === 'routine' && (
            <>
              <div>
                <div className="text-xs text-brand-accent font-semibold mb-1 uppercase tracking-wide">Rutina de hoy · Jueves</div>
                <h1 className="text-2xl font-bold text-white">Fuerza + Hipertrofia</h1>
                <p className="text-slate-400 text-sm mt-1">Lun · Mié · Vie · Asignada por Carlos Martínez</p>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">Progreso de hoy</span>
                  <span className="font-mono text-sm font-bold text-brand-primary">{completedCount}/{EXERCISES_DATA.length}</span>
                </div>
                <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                       style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #10B981, #0EA5E9)' }} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-slate-400">{progress}% completado · {EXERCISES_DATA.length - completedCount} restantes</p>
                  {progress === 100 && (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> ¡Sesión completada!
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {EXERCISES_DATA.map((ex, i) => {
                  const isDone = done.has(ex.id)
                  return (
                    <button key={ex.id} onClick={() => toggle(ex.id)}
                            className={`w-full text-left card transition-all duration-200 cursor-pointer active:scale-[0.99] ${isDone ? 'border-emerald-500/25' : 'hover:border-border-bright hover:shadow-card-hover'}`}
                            style={isDone ? { background: 'linear-gradient(180deg, rgba(16,185,129,0.05), #1E293B)' } : {}}>
                      <div className="flex items-center gap-4 p-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${isDone ? 'text-white' : 'bg-surface-2 border border-border text-slate-400'}`}
                             style={isDone ? { background: 'linear-gradient(135deg, #10B981, #0EA5E9)' } : {}}>
                          {isDone ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm transition-all ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>{ex.name}</div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-slate-400">{ex.sets} series</span>
                            <span className="text-xs text-slate-400">× {ex.reps} reps</span>
                            <span className="text-xs text-slate-400">{ex.rest}s descanso</span>
                          </div>
                        </div>
                        {ex.notes && <div className="hidden sm:block text-xs text-slate-500 italic max-w-[200px] truncate">&ldquo;{ex.notes}&rdquo;</div>}
                        <span className={`text-xs font-medium shrink-0 ${isDone ? 'text-emerald-400' : 'text-slate-600'}`}>
                          {isDone ? 'Hecho ✓' : 'Marcar'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* PROGRESO */}
          {activeTab === 'progress' && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-white">Mi progreso</h1>
                <p className="text-slate-400 text-sm mt-1">Evolución de los últimos 3 meses</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {MOCK_PROGRESS.map(p => (
                  <div key={p.label} className="card p-5">
                    <div className="text-xs text-slate-400 mb-1">{p.label}</div>
                    <div className="text-2xl font-bold font-mono text-white">{p.value}</div>
                    <div className={`text-sm font-semibold mt-2 ${p.positive ? 'text-emerald-400' : 'text-red-400'}`}>{p.change}</div>
                  </div>
                ))}
              </div>
              <div className="card p-6">
                <h2 className="font-semibold text-white mb-5">Evolución del peso (kg)</h2>
                <div className="flex items-end gap-2 h-28">
                  {[77.0, 76.5, 76.2, 75.8, 75.4, 75.1, 74.8, 74.5, 74.2].map((v, i) => (
                    <div key={i} className="flex-1 rounded-t-sm transition-all"
                         style={{ height: `${((v - 73) / 5) * 100}%`, background: i === 8 ? 'linear-gradient(180deg, #10B981, #0EA5E9)' : 'rgba(14,165,233,0.2)' }} />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-600">
                  <span>Mar</span><span>Abr</span><span>May</span>
                </div>
              </div>
            </>
          )}

          {/* NUTRICIÓN */}
          {activeTab === 'nutrition' && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-white">Plan nutricional</h1>
                <p className="text-slate-400 text-sm mt-1">Diseñado por Carlos Martínez</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Calorías', value: '2.890', unit: 'kcal', color: 'text-amber-400' },
                  { label: 'Proteína', value: '152', unit: 'g', color: 'text-sky-400' },
                  { label: 'Carbohidratos', value: '320', unit: 'g', color: 'text-violet-400' },
                ].map(m => (
                  <div key={m.label} className="card p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1">{m.label}</div>
                    <div className={`text-2xl font-bold font-mono ${m.color}`}>{m.value}</div>
                    <div className="text-xs text-slate-500">{m.unit}</div>
                  </div>
                ))}
              </div>
              <div className="card p-6">
                <h2 className="font-semibold text-white mb-5">Comidas de hoy</h2>
                <div className="space-y-3">
                  {MOCK_MEALS.map(meal => (
                    <div key={meal.name} className="flex items-center gap-4 p-3 rounded-xl bg-surface-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500">{meal.time}</div>
                        <div className="font-medium text-sm text-white truncate">{meal.name}</div>
                      </div>
                      <div className="flex gap-3 text-xs shrink-0">
                        <span className="text-amber-400 font-mono">{meal.kcal} kcal</span>
                        <span className="text-sky-400 hidden sm:block">{meal.p}g P</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* CITAS */}
          {activeTab === 'appointments' && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-white">Mis citas</h1>
                <p className="text-slate-400 text-sm mt-1">Próximas sesiones con tu entrenador</p>
              </div>
              <div className="space-y-3">
                {[
                  { date: 'Hoy, Jueves 29 Mayo', time: '11:30', type: 'Online',      status: 'confirmed' },
                  { date: 'Lunes, 2 Junio',       time: '10:00', type: 'Presencial', status: 'pending' },
                  { date: 'Miércoles, 4 Junio',   time: '11:30', type: 'Online',      status: 'pending' },
                ].map(apt => (
                  <div key={apt.date} className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                         style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
                      <CalendarDays className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{apt.date}</div>
                      <div className="text-sm text-slate-400">{apt.time} · 60min · {apt.type}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${apt.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-400'}`}>
                      {apt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* MENSAJES */}
          {activeTab === 'messages' && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-white">Mensajes</h1>
                <p className="text-slate-400 text-sm mt-1">Conversación con Carlos Martínez</p>
              </div>
              <div className="card p-6 space-y-4">
                {[
                  { from: 'trainer', text: '¡Hola Ana! He revisado tus medidas y vamos muy bien. Baja de peso constante y ganando músculo.', time: '09:15' },
                  { from: 'client',  text: 'Gracias Carlos! La verdad que me noto con más energía también.', time: '09:32' },
                  { from: 'trainer', text: 'Perfecto. Esta semana intenta llegar a las 8h de sueño, es clave para la recuperación muscular.', time: '09:35' },
                  { from: 'client',  text: '¡Entendido! ¿La rutina de mañana es igual que la de hoy?', time: '10:02' },
                  { from: 'trainer', text: 'No, mañana toca descanso. Pasado te toca Cardio + Core. Te lo subo ahora.', time: '10:05' },
                ].map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.from === 'client' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${msg.from === 'trainer' ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {msg.from === 'trainer' ? 'CM' : 'AG'}
                    </div>
                    <div className={`max-w-[70%] flex flex-col gap-1 ${msg.from === 'client' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.from === 'trainer' ? 'bg-surface-2 text-white rounded-tl-sm' : 'text-white rounded-tr-sm'}`}
                           style={msg.from === 'client' ? { background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' } : {}}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-600">{msg.time}</span>
                    </div>
                  </div>
                ))}
                {/* Reply input (disabled) */}
                <div className="flex gap-3 pt-2 border-t border-border/60">
                  <input disabled placeholder="Escribe un mensaje..." className="input flex-1 opacity-50 cursor-not-allowed" />
                  <button disabled className="btn-gradient px-4 opacity-40 cursor-not-allowed">Enviar</button>
                </div>
              </div>
            </>
          )}

          {/* CTA */}
          <div className="rounded-2xl p-8 text-center border border-brand-accent/20"
               style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(14,165,233,0.05))' }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Users className="w-5 h-5 text-brand-accent" />
              <span className="text-xs font-semibold text-brand-accent uppercase tracking-wide">Esto es lo que recibirán tus clientes</span>
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
