'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  Zap, Users, Dumbbell, UtensilsCrossed, CalendarDays,
  MessageSquare, TrendingUp, TrendingDown, Check, Flame,
  Droplets, Trophy, Activity, Clock, Plus, X, ChevronDown,
  Send, ArrowUpRight, Star, RotateCcw,
} from 'lucide-react'
import DemoWaitlistCTA from '@/components/demo/DemoWaitlistCTA'

// ─── Types ────────────────────────────────────────────────────
interface MeasurementEntry { date: string; weight: number; fat: number; notes: string }
interface ExerciseRow { id: number; name: string; sets: number; reps: number; rest: number; cat: string; notes: string | null }
interface Meal { time: string; name: string; desc: string; kcal: number; p: number; c: number; f: number }
interface DayMeal { time: string; food: string; kcal: number }
interface DayPlan { dayFull: string; dayShort: string; meals: DayMeal[] }
interface Appointment { id: number; date: string; time: string; type: string; duration: string; status: 'confirmed' | 'pending' }
interface ChatMsg { from: 'trainer' | 'client'; text: string; time: string }
interface Milestone { label: string; icon: LucideIcon; unlocked: boolean; color: string }

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

// ─── SVG Ring ─────────────────────────────────────────────────
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

// ─── MacroBar ─────────────────────────────────────────────────
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
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

// ─── Mock data ────────────────────────────────────────────────
const EXERCISES: ExerciseRow[] = [
  { id: 1, name: 'Press de banca',   sets: 4, reps: 10, rest: 90,  cat: 'Pecho',    notes: 'Bajar controlado, 2s excéntrico' },
  { id: 2, name: 'Sentadilla libre', sets: 4, reps: 8,  rest: 120, cat: 'Piernas',  notes: 'Profundidad paralela, rodillas alineadas con los pies' },
  { id: 3, name: 'Remo con barra',   sets: 3, reps: 12, rest: 75,  cat: 'Espalda',  notes: 'Codos pegados al cuerpo, aprieta en el pico' },
  { id: 4, name: 'Press militar',    sets: 3, reps: 10, rest: 90,  cat: 'Hombros',  notes: null },
  { id: 5, name: 'Fondos en barra',  sets: 3, reps: 12, rest: 60,  cat: 'Tríceps',  notes: 'Ligera inclinación hacia delante para activar el pecho' },
]

const MEALS: Meal[] = [
  { time: '08:00', name: 'Desayuno',  desc: 'Avena + proteína + plátano',              kcal: 420, p: 35, c: 58, f: 9 },
  { time: '11:30', name: 'Media m.',  desc: 'Manzana + frutos secos 30g',               kcal: 210, p: 5,  c: 24, f: 11 },
  { time: '14:00', name: 'Comida',    desc: 'Pollo a la plancha + arroz + ensalada',    kcal: 680, p: 52, c: 72, f: 14 },
  { time: '17:00', name: 'Merienda',  desc: 'Yogur griego + frutos secos',              kcal: 280, p: 20, c: 18, f: 16 },
  { time: '20:30', name: 'Cena',      desc: 'Merluza + verduras + patata',              kcal: 510, p: 45, c: 38, f: 12 },
]

const WEEK_PLAN: DayPlan[] = [
  { dayFull: 'Lunes',     dayShort: 'L', meals: [
    { time: '08:00', food: 'Avena proteica + plátano', kcal: 420 },
    { time: '11:30', food: 'Frutos secos + manzana', kcal: 180 },
    { time: '14:00', food: 'Pollo + arroz basmati + espinacas', kcal: 650 },
    { time: '17:30', food: 'Batido de proteína + plátano', kcal: 290 },
    { time: '21:00', food: 'Salmón + verduras al vapor', kcal: 520 },
  ]},
  { dayFull: 'Martes',    dayShort: 'M', meals: [
    { time: '08:00', food: 'Huevos revueltos + tostadas integrales', kcal: 460 },
    { time: '11:30', food: 'Yogur griego + nueces', kcal: 210 },
    { time: '14:00', food: 'Ternera + quinoa + tomate cherry', kcal: 620 },
    { time: '17:30', food: 'Fruta de temporada + almendras', kcal: 180 },
    { time: '21:00', food: 'Pechuga al horno + ensalada verde', kcal: 480 },
  ]},
  { dayFull: 'Miércoles', dayShort: 'X', meals: [
    { time: '08:00', food: 'Avena + frutas del bosque + semillas chía', kcal: 390 },
    { time: '11:30', food: 'Batido de proteína', kcal: 150 },
    { time: '14:00', food: 'Lentejas + verduras + huevo cocido', kcal: 580 },
    { time: '17:30', food: 'Frutos secos 30g', kcal: 170 },
    { time: '21:00', food: 'Merluza + brócoli + patata cocida', kcal: 490 },
  ]},
  { dayFull: 'Jueves',    dayShort: 'J', meals: [
    { time: '08:00', food: 'Avena + proteína + plátano', kcal: 420 },
    { time: '11:30', food: 'Manzana + frutos secos 30g', kcal: 210 },
    { time: '14:00', food: 'Pollo a la plancha + arroz + ensalada', kcal: 680 },
    { time: '17:00', food: 'Yogur griego + frutos secos', kcal: 280 },
    { time: '20:30', food: 'Merluza + verduras + patata', kcal: 510 },
  ]},
  { dayFull: 'Viernes',   dayShort: 'V', meals: [
    { time: '08:00', food: 'Tortilla francesa + pan integral tostado', kcal: 440 },
    { time: '11:30', food: 'Plátano + mantequilla de cacahuete', kcal: 230 },
    { time: '14:00', food: 'Salmón + pasta integral + espárragos', kcal: 700 },
    { time: '17:30', food: 'Batido de proteína', kcal: 150 },
    { time: '21:00', food: 'Pavo + aguacate + ensalada', kcal: 520 },
  ]},
  { dayFull: 'Sábado',    dayShort: 'S', meals: [
    { time: '09:00', food: 'Tortitas proteicas + frutas del bosque', kcal: 480 },
    { time: '12:30', food: 'Frutos secos + yogur griego', kcal: 250 },
    { time: '14:30', food: 'Paella de pollo y verduras', kcal: 680 },
    { time: '18:00', food: 'Fruta de temporada', kcal: 120 },
    { time: '21:00', food: 'Pizza proteica casera', kcal: 620 },
  ]},
  { dayFull: 'Domingo',   dayShort: 'D', meals: [
    { time: '09:30', food: 'Tostadas integrales + aguacate + huevo', kcal: 500 },
    { time: '13:00', food: 'Frutos secos 30g', kcal: 170 },
    { time: '15:00', food: 'Pollo asado + patatas + ensalada', kcal: 720 },
    { time: '18:30', food: 'Batido de proteína + plátano', kcal: 290 },
    { time: '21:30', food: 'Sopa de verduras + filete de ternera', kcal: 560 },
  ]},
]

const INIT_MEASUREMENTS: MeasurementEntry[] = [
  { date: '26 Jun', weight: 74.2, fat: 17.4, notes: '' },
  { date: '19 Jun', weight: 74.8, fat: 17.7, notes: 'Buena semana, energía alta' },
  { date: '12 Jun', weight: 75.4, fat: 18.1, notes: '' },
  { date: '5 Jun',  weight: 76.0, fat: 18.5, notes: 'Hidratación algo baja' },
  { date: '30 Abr', weight: 76.5, fat: 18.9, notes: '' },
]

const MILESTONES: Milestone[] = [
  { label: 'Primera semana',  icon: Star,         unlocked: true,  color: '#F59E0B' },
  { label: '10 sesiones',     icon: Trophy,       unlocked: true,  color: '#10B981' },
  { label: '5 kg perdidos',   icon: TrendingDown, unlocked: false, color: '#7C3AED' },
  { label: 'Racha 30 días',   icon: Flame,        unlocked: false, color: '#EF4444' },
]

const INIT_APPOINTMENTS: Appointment[] = [
  { id: 1, date: 'Hoy, Vie 4 Jul',  time: '11:30', type: 'Online',     duration: '60 min', status: 'confirmed' },
  { id: 2, date: 'Lun, 7 Jul',      time: '10:00', type: 'Presencial', duration: '90 min', status: 'pending' },
  { id: 3, date: 'Mié, 9 Jul',      time: '11:30', type: 'Online',     duration: '60 min', status: 'pending' },
  { id: 4, date: 'Vie, 11 Jul',     time: '09:00', type: 'Online',     duration: '60 min', status: 'pending' },
]

const INIT_CHAT: ChatMsg[] = [
  { from: 'trainer', text: '¡Hola Ana! He revisado tus medidas y vamos genial. Bajada de peso constante y ganando músculo 💪', time: '09:15' },
  { from: 'client',  text: 'Gracias Carlos! Me noto con mucha más energía también.', time: '09:32' },
  { from: 'trainer', text: 'Perfecto. Esta semana intenta llegar a las 8h de sueño, es clave para la recuperación muscular.', time: '09:35' },
  { from: 'client',  text: '¡Entendido! ¿La rutina de mañana es igual que la de hoy?', time: '10:02' },
  { from: 'trainer', text: 'No, mañana es descanso activo. Pasado mañana toca Cardio + Core. Te lo subo a la app 👍', time: '10:05' },
  { from: 'client',  text: '¡Perfecto, gracias! A ver si llego al objetivo antes del verano 😄', time: '10:28' },
]

const TRAINER_REPLIES = [
  '¡Perfecto! Sigue así, vas muy bien 💪',
  '¡Muy bien! Recuerda hidratarte bien durante el entreno.',
  'Excelente trabajo hoy. Descansa bien para mañana.',
  '¡Genial! Esa actitud es lo que marca la diferencia.',
  'La constancia es la clave. ¡Lo estás haciendo fenomenal!',
  'Anotado. Ajustaré el plan si es necesario. ¡Ánimo!',
  '¿Cómo te has sentido con el último entreno? Cuéntame.',
  'Muy bien, Ana. Sigue con esa motivación 🔥',
  'Recuerda que el progreso no siempre es lineal. ¡Confía en el proceso!',
  'Fantástico. Mañana subimos la intensidad un poco 😊',
]

const WEIGHT_DATA = [77.0, 76.5, 76.2, 75.8, 75.4, 75.1, 74.8, 74.5, 74.2]

const NAV_ITEMS = [
  { icon: TrendingUp,      label: 'Progreso',  key: 'progress' },
  { icon: Dumbbell,        label: 'Mi Rutina', key: 'routine' },
  { icon: UtensilsCrossed, label: 'Nutrición', key: 'nutrition' },
  { icon: CalendarDays,    label: 'Citas',     key: 'appointments' },
  { icon: MessageSquare,   label: 'Mensajes',  key: 'messages' },
]

const CAT_COLORS: Record<string, string> = {
  Pecho:    'bg-sky-500/15 text-sky-300 border-sky-500/20',
  Piernas:  'bg-violet-500/15 text-violet-300 border-violet-500/20',
  Espalda:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  Hombros:  'bg-amber-500/15 text-amber-300 border-amber-500/20',
  'Tríceps':'bg-red-500/15 text-red-300 border-red-500/20',
}

// ─── Main component ────────────────────────────────────────────
const DAY_NAMES_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function ClientDemoPage() {
  const [activeTab, setActiveTab] = useState('progress')
  const todayDayName = DAY_NAMES_ES[new Date().getDay()]

  // Animated counters
  const streak       = useCountUp(12)
  const recordStreak = useCountUp(18)
  const weightLost   = useCountUp(28) // /10 = 2.8 kg

  // ── Progress tab ──
  const [showMeasureModal, setShowMM] = useState(false)
  const [mWeight, setMWeight] = useState('')
  const [mFat,    setMFat]    = useState('')
  const [mNotes,  setMNotes]  = useState('')
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>(INIT_MEASUREMENTS)

  // ── Routine tab ──
  const [done,       setDone]       = useState<Set<number>>(new Set([1, 2]))
  const [expandedEx, setExpandedEx] = useState<Set<number>>(new Set())
  const [activeTimerId,  setActiveTimerId]  = useState<number | null>(null)
  const [timerRemaining, setTimerRemaining] = useState(0)

  // ── Nutrition tab ──
  const [water,     setWater]     = useState(4)
  const [mealsDone, setMealsDone] = useState<Set<number>>(new Set([0, 1]))
  const [activeDay, setActiveDay] = useState(3)
  const [showWeekPlan, setShowWeekPlan] = useState(false)

  // ── Appointments tab ──
  const [appointments, setAppointments] = useState<Appointment[]>(INIT_APPOINTMENTS)
  const [confirmCancel, setConfirmCancel] = useState<Set<number>>(new Set())

  // ── Messages tab ──
  const [chatMsgs,   setChatMsgs]   = useState<ChatMsg[]>(INIT_CHAT)
  const [chatInput,  setChatInput]  = useState('')
  const chatEndRef  = useRef<HTMLDivElement>(null)
  const replyTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Computed
  const completedCount  = done.size
  const sessionProgress = Math.round((completedCount / EXERCISES.length) * 100)

  // ── Timer countdown effect ──
  useEffect(() => {
    if (activeTimerId === null) return
    const intervalId = setInterval(() => {
      setTimerRemaining(prev => {
        if (prev <= 1) { clearInterval(intervalId); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalId)
  }, [activeTimerId])

  // ── Chat scroll effect ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMsgs])

  // ── Cleanup reply timer on unmount ──
  useEffect(() => {
    return () => { if (replyTimer.current) clearTimeout(replyTimer.current) }
  }, [])

  // ── Handlers ──
  function toggleDone(id: number) {
    setDone(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }
  function toggleExpand(id: number) {
    setExpandedEx(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }
  function startTimer(exId: number, seconds: number) {
    setActiveTimerId(exId)
    setTimerRemaining(seconds)
  }
  function resetTimer() {
    setActiveTimerId(null)
    setTimerRemaining(0)
  }

  function submitMeasure(e: React.FormEvent) {
    e.preventDefault()
    if (!mWeight) return
    const today = new Date()
    const label = today.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    setMeasurements(prev => [
      { date: label, weight: parseFloat(mWeight), fat: parseFloat(mFat) || 0, notes: mNotes },
      ...prev,
    ].slice(0, 10))
    setShowMM(false)
    setMWeight(''); setMFat(''); setMNotes('')
  }

  function cancelAppointment(id: number) {
    if (confirmCancel.has(id)) {
      setAppointments(prev => prev.filter(a => a.id !== id))
      const n = new Set(confirmCancel); n.delete(id); setConfirmCancel(n)
    } else {
      const n = new Set(confirmCancel); n.add(id); setConfirmCancel(n)
    }
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const text = chatInput.trim()
    if (!text) return
    const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    setChatMsgs(prev => [...prev, { from: 'client', text, time: now }])
    setChatInput('')
    if (replyTimer.current) clearTimeout(replyTimer.current)
    replyTimer.current = setTimeout(() => {
      const reply = TRAINER_REPLIES[Math.floor(Math.random() * TRAINER_REPLIES.length)]
      const t = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      setChatMsgs(prev => [...prev, { from: 'trainer', text: reply, time: t }])
    }, 1500)
  }

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
          <span className="text-slate-300 hidden sm:block">Portal de cliente — todo es interactivo</span>
          <span className="text-slate-300 sm:hidden">Portal cliente · Demo</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/demo" className="text-xs text-slate-400 hover:text-white transition-colors hidden sm:block">← Volver</Link>
          <a href="#demo-cta" className="btn-gradient text-xs px-4 py-1.5">
            <Zap className="w-3 h-3" /> Apuntarme
          </a>
        </div>
      </div>

      {/* ── Topbar ── */}
      <header className="bg-surface/90 backdrop-blur-md border-b border-border sticky top-[49px] z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                   style={{ background: '#8FD43A' }}>
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
                <Flame className="w-3.5 h-3.5" /><span>{streak}d racha</span>
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

      {/* ── Main content ── */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

          {/* ══════════════════════════════════════════ PROGRESO */}
          {activeTab === 'progress' && (
            <>
              <div className="animate-fade-in-up flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-brand-accent font-semibold uppercase tracking-widest mb-1">Mi evolución</div>
                  <h1 className="text-2xl font-bold text-white">Progreso</h1>
                  <p className="text-slate-400 text-sm mt-0.5">Últimos 3 meses · Entrenador: Carlos Martínez</p>
                </div>
                <button onClick={() => setShowMM(true)}
                        className="btn-primary text-xs px-3 py-2 shrink-0">
                  <Plus className="w-3.5 h-3.5" /> Registrar medidas
                </button>
              </div>

              {/* Ring + stats */}
              <div className="grid sm:grid-cols-2 gap-6 animate-fade-in-up delay-75">
                <div className="card p-6 flex flex-col items-center gap-4">
                  <div className="relative">
                    <Ring pct={sessionProgress || 78} size={140} stroke={12} color="#10B981" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold font-mono text-white">{sessionProgress || 78}%</span>
                      <span className="text-xs text-slate-400">objetivo mes</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-white">Objetivo del mes</div>
                    <div className="text-sm text-slate-400 mt-0.5">20 sesiones completadas / 24</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 content-start">
                  {[
                    { label: 'Peso actual',    value: measurements[0]?.weight.toFixed(1) ?? '74.2', unit: 'kg',   change: '−2.8',  color: 'text-emerald-400', icon: TrendingDown },
                    { label: 'Grasa corporal', value: measurements[0]?.fat.toFixed(1) ?? '17.4',    unit: '%',    change: '−1.2',  color: 'text-sky-400',     icon: Activity },
                    { label: 'Masa muscular',  value: '38.1',   unit: 'kg',   change: '+1.4',  color: 'text-violet-400',  icon: Dumbbell },
                    { label: 'Racha actual',   value: `${streak}`, unit: 'días', change: `Récord: ${recordStreak}d`, color: 'text-amber-400',  icon: Flame },
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
                      <div className={`text-xs font-semibold mt-1.5 ${s.color}`}>{s.change}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Streak + weight lost */}
              <div className="grid sm:grid-cols-2 gap-4 animate-fade-in-up delay-200">
                <div className="card p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                       style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.15))', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <Flame className="w-7 h-7 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold font-mono text-amber-400">{streak}</div>
                    <div className="font-semibold text-white">días de racha</div>
                    <div className="text-xs text-slate-400 mt-0.5">Récord personal: {recordStreak} días</div>
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
                    <p className="text-xs text-slate-500 mt-0.5">Abr — Jul 2026</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 rotate-90" /> −2.8 kg
                  </span>
                </div>
                <div className="flex items-end gap-2 h-28">
                  {WEIGHT_DATA.map((v, i) => {
                    const h = ((v - 73) / 5) * 100
                    const isLast = i === WEIGHT_DATA.length - 1
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        {isLast && <span className="text-[9px] font-bold text-emerald-400">{v}</span>}
                        <div className="w-full rounded-t-sm transition-all duration-700"
                             style={{
                               height: `${h}%`, minHeight: '4px',
                               background: isLast ? 'linear-gradient(180deg, #10B981, #0EA5E9)' : 'rgba(14,165,233,0.2)',
                               boxShadow: isLast ? '0 0 8px rgba(16,185,129,0.35)' : 'none',
                             }} />
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-600 px-1">
                  <span>1 Abr</span><span>15 Abr</span><span>1 May</span><span>15 May</span><span>1 Jun</span><span>15 Jun</span><span>Hoy</span>
                </div>
              </div>

              {/* Measurement history */}
              <div className="card p-6 animate-fade-in-up delay-400">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white">Historial de medidas</h2>
                  <button onClick={() => setShowMM(true)} className="text-xs text-brand-primary hover:underline font-medium flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Añadir
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                        <th className="text-right pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Peso</th>
                        <th className="text-right pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Grasa</th>
                        <th className="text-left pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell pl-4">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {measurements.slice(0, 5).map((m, i) => (
                        <tr key={i} className="hover:bg-surface-2/50 transition-colors">
                          <td className="py-2.5 text-slate-300 font-medium">{m.date}</td>
                          <td className="py-2.5 text-right font-mono font-semibold text-white">{m.weight.toFixed(1)} kg</td>
                          <td className="py-2.5 text-right font-mono text-slate-400">{m.fat > 0 ? `${m.fat.toFixed(1)}%` : '—'}</td>
                          <td className="py-2.5 text-slate-500 text-xs italic hidden sm:table-cell pl-4 truncate max-w-[140px]">{m.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Milestone badges */}
              <div className="animate-fade-in-up delay-500">
                <h2 className="font-semibold text-white mb-3">Logros</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {MILESTONES.map(m => (
                    <div key={m.label}
                         className={`card p-4 text-center transition-all ${m.unlocked ? 'border-opacity-100' : 'opacity-40'}`}
                         style={m.unlocked ? { borderColor: `${m.color}40`, background: `${m.color}08` } : {}}>
                      <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                           style={{ background: m.unlocked ? `${m.color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${m.color}30` }}>
                        <m.icon className="w-5 h-5" style={{ color: m.unlocked ? m.color : '#475569' }} />
                      </div>
                      <div className="text-xs font-semibold text-white leading-tight">{m.label}</div>
                      <div className="text-[10px] mt-1" style={{ color: m.unlocked ? m.color : '#475569' }}>
                        {m.unlocked ? '✓ Desbloqueado' : 'Bloqueado'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════ RUTINA */}
          {activeTab === 'routine' && (
            <>
              <div className="animate-fade-in-up">
                <div className="text-xs text-brand-accent font-semibold mb-1 uppercase tracking-widest">Rutina de hoy · {todayDayName}</div>
                <h1 className="text-2xl font-bold text-white">Fuerza + Hipertrofia</h1>
                <p className="text-slate-400 text-sm mt-1">Lun · Mié · Vie · Diseñada por Carlos Martínez</p>
              </div>

              {/* Session progress */}
              <div className="card p-5 animate-fade-in-up delay-75">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">Progreso de hoy</span>
                  <span className="font-mono text-sm font-bold text-brand-primary">{completedCount}/{EXERCISES.length}</span>
                </div>
                <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                       style={{ width: `${sessionProgress}%`, background: 'linear-gradient(90deg, #10B981, #0EA5E9)' }} />
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <p className="text-xs text-slate-400">{sessionProgress}% completado · {EXERCISES.length - completedCount} ejercicios restantes</p>
                  {sessionProgress === 100 && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-fade-in">
                      <Trophy className="w-3 h-3" /> ¡Sesión completada!
                    </span>
                  )}
                </div>
              </div>

              {/* Exercises */}
              <div className="space-y-3">
                {EXERCISES.map((ex, i) => {
                  const isDone    = done.has(ex.id)
                  const isOpen    = expandedEx.has(ex.id)
                  const isTimerOn = activeTimerId === ex.id
                  return (
                    <div key={ex.id}
                         className={`card transition-all duration-200 animate-fade-in-up ${isDone ? 'border-emerald-500/25' : 'hover:border-border-bright'}`}
                         style={{ animationDelay: `${i * 60}ms`, background: isDone ? 'linear-gradient(180deg, rgba(16,185,129,0.04), #1E293B)' : undefined }}>

                      {/* Card header — click to expand */}
                      <button className="w-full flex items-center gap-4 p-4 text-left" onClick={() => toggleExpand(ex.id)}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${isDone ? 'text-white' : 'bg-surface-2 border border-border text-slate-400'}`}
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
                            <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{ex.rest}s descanso</span>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Expanded detail */}
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 border-t border-border/50 space-y-4 animate-fade-in">
                          {ex.notes && (
                            <div className="rounded-lg px-3 py-2.5 text-sm text-slate-300 italic"
                                 style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)' }}>
                              💬 {ex.notes}
                            </div>
                          )}

                          {/* Rest timer */}
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3">
                              {!isTimerOn ? (
                                <button onClick={() => startTimer(ex.id, ex.rest)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                                        style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)', color: '#38BDF8' }}>
                                  <Clock className="w-3.5 h-3.5" /> Iniciar descanso {ex.rest}s
                                </button>
                              ) : timerRemaining > 0 ? (
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold"
                                       style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#FCD34D' }}>
                                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                                    {timerRemaining}s
                                  </div>
                                  <div className="w-24 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                                         style={{ width: `${(timerRemaining / ex.rest) * 100}%` }} />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5" /> ¡A por ello!
                                  </span>
                                  <button onClick={resetTimer}
                                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
                                          style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                            <button onClick={() => toggleDone(ex.id)}
                                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${isDone ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-surface-2 text-slate-300 border border-border hover:border-border-bright'}`}>
                              {isDone ? '✓ Marcado hecho' : 'Marcar como hecho'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {sessionProgress === 100 && (
                <div className="rounded-2xl p-6 text-center border border-emerald-500/20 animate-fade-in"
                     style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,165,233,0.05))' }}>
                  <Trophy className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white mb-1">¡Sesión completada!</h3>
                  <p className="text-slate-400 text-sm">Carlos registrará tu progreso en las próximas horas.</p>
                </div>
              )}
            </>
          )}

          {/* ══════════════════════════════════════════ NUTRICIÓN */}
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
                <p className="text-xs text-slate-500 mt-2">Toca para registrar · {8 - water} restantes hoy</p>
              </div>

              {/* Meals */}
              <div className="card p-6 animate-fade-in-up delay-200">
                <h2 className="font-semibold text-white mb-5">Comidas del día</h2>
                <div className="space-y-3">
                  {MEALS.map((meal, idx) => {
                    const isChecked = mealsDone.has(idx)
                    return (
                      <button key={idx} onClick={() => { setMealsDone(prev => { const n = new Set(prev); if (n.has(idx)) n.delete(idx); else n.add(idx); return n }) }}
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

              {/* Weekly plan toggle */}
              <div className="animate-fade-in-up delay-300">
                <button onClick={() => setShowWeekPlan(v => !v)}
                        className="w-full card p-4 flex items-center justify-between hover:border-border-bright transition-all">
                  <div className="flex items-center gap-2.5">
                    <UtensilsCrossed className="w-4 h-4 text-brand-accent" />
                    <span className="font-semibold text-white text-sm">Plan semanal completo</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showWeekPlan ? 'rotate-180' : ''}`} />
                </button>

                {showWeekPlan && (
                  <div className="card p-6 mt-2 animate-fade-in">
                    {/* Day tabs */}
                    <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
                      {WEEK_PLAN.map((day, i) => (
                        <button key={i} onClick={() => setActiveDay(i)}
                                className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${activeDay === i ? 'text-brand-primary' : 'text-slate-500 hover:text-slate-300'}`}
                                style={activeDay === i ? { background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' } : {}}>
                          <span className="text-[10px] uppercase">{day.dayShort}</span>
                          {i === 3 && <span className="w-1 h-1 rounded-full bg-brand-primary" />}
                        </button>
                      ))}
                    </div>

                    {/* Selected day meals */}
                    <div className="space-y-2.5">
                      <h3 className="font-semibold text-white mb-3">{WEEK_PLAN[activeDay].dayFull}</h3>
                      {WEEK_PLAN[activeDay].meals.map((m, j) => (
                        <div key={j} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2">
                          <span className="text-xs font-mono text-slate-500 w-12 shrink-0">{m.time}</span>
                          <span className="flex-1 text-sm text-slate-200">{m.food}</span>
                          <span className="text-xs font-mono text-amber-400 shrink-0">{m.kcal}cal</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t border-border/50 text-xs">
                        <span className="text-slate-500">Total del día</span>
                        <span className="font-mono font-bold text-amber-400">
                          {WEEK_PLAN[activeDay].meals.reduce((s, m) => s + m.kcal, 0)} kcal
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════ CITAS */}
          {activeTab === 'appointments' && (
            <>
              <div className="animate-fade-in-up">
                <h1 className="text-2xl font-bold text-white">Mis citas</h1>
                <p className="text-slate-400 text-sm mt-0.5">Sesiones con Carlos Martínez</p>
              </div>

              {/* Next session highlight */}
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
                {appointments.map((apt, i) => {
                  const isFirst    = i === 0
                  const isConfirm  = confirmCancel.has(apt.id)
                  return (
                    <div key={apt.id}
                         className={`card p-5 flex items-center gap-4 hover:border-border-bright transition-all animate-fade-in-up ${isFirst ? 'border-brand-primary/30' : ''}`}
                         style={{ animationDelay: `${200 + i * 80}ms` }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                           style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' }}>
                        <CalendarDays className="w-5 h-5 text-brand-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white">{apt.date}</div>
                        <div className="text-sm text-slate-400 mt-0.5">{apt.time} · {apt.duration} · {apt.type}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${apt.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700/80 text-slate-400 border border-slate-600/50'}`}>
                          {apt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                        </span>
                        {apt.status === 'pending' && (
                          <button onClick={() => cancelAppointment(apt.id)}
                                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${isConfirm ? 'bg-red-500/15 text-red-400 border-red-500/25 animate-pulse' : 'text-slate-500 border-border hover:text-red-400 hover:border-red-500/25'}`}>
                            {isConfirm ? '¿Seguro?' : 'Cancelar'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {appointments.length === 0 && (
                  <div className="card p-10 text-center text-slate-500 text-sm">
                    <CalendarDays className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p>No tienes citas programadas.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════ MENSAJES */}
          {activeTab === 'messages' && (
            <>
              <div className="animate-fade-in-up">
                <h1 className="text-2xl font-bold text-white">Mensajes</h1>
                <p className="text-slate-400 text-sm mt-0.5">Conversación con Carlos Martínez</p>
              </div>

              <div className="card animate-fade-in-up delay-75 flex flex-col" style={{ height: '520px' }}>
                {/* Chat header */}
                <div className="flex items-center gap-3 p-4 border-b border-border/60">
                  <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300 text-xs font-bold">CM</div>
                  <div>
                    <div className="font-semibold text-white text-sm">Carlos Martínez</div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      En línea
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMsgs.map((msg, i) => (
                    <div key={i} className={`flex gap-3 animate-fade-in ${msg.from === 'client' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${msg.from === 'trainer' ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {msg.from === 'trainer' ? 'CM' : 'AG'}
                      </div>
                      <div className={`max-w-[72%] flex flex-col gap-1 ${msg.from === 'client' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.from === 'trainer' ? 'bg-surface-2 text-white rounded-tl-sm' : 'text-white rounded-tr-sm'}`}
                             style={msg.from === 'client' ? { background: '#8FD43A' } : {}}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-slate-600 px-1">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="flex gap-3 p-4 border-t border-border/60">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                         placeholder="Escribe un mensaje..." className="input flex-1 text-sm"
                         onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e) } }} />
                  <button type="submit" className="btn-gradient px-4 text-sm">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════ CTA */}
          <div id="demo-cta" className="rounded-2xl p-8 border border-brand-accent/20 animate-fade-in-up"
               style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(14,165,233,0.05))' }}>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-brand-accent shrink-0" />
              <span className="text-xs font-semibold text-brand-accent uppercase tracking-widest">Esto es lo que recibirán tus clientes</span>
            </div>
            <DemoWaitlistCTA
              title="¿Quieres darle esto a tus clientes?"
              subtitle="Apúntate a la lista de espera. Te avisamos el día del lanzamiento para que puedas empezar enseguida."
            />
            <p className="text-xs text-slate-500 mt-4">
              ¿Eres entrenador? <Link href="/demo/trainer" className="text-slate-400 hover:text-white underline underline-offset-2 transition-colors">Ver panel del entrenador</Link>
            </p>
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════ MEASURE MODAL */}
      {showMeasureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
             onClick={e => { if (e.target === e.currentTarget) setShowMM(false) }}>
          <div className="card p-6 w-full max-w-sm animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg">Registrar medidas</h3>
              <button onClick={() => setShowMM(false)} aria-label="Cerrar" className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-2 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={submitMeasure} className="space-y-4">
              <div>
                <label className="label">Peso corporal (kg)</label>
                <input type="number" step="0.1" min="30" max="200"
                       value={mWeight} onChange={e => setMWeight(e.target.value)}
                       placeholder="74.5" className="input" autoFocus required />
              </div>
              <div>
                <label className="label">Grasa corporal (%) <span className="text-slate-600 font-normal normal-case">· opcional</span></label>
                <input type="number" step="0.1" min="3" max="60"
                       value={mFat} onChange={e => setMFat(e.target.value)}
                       placeholder="17.4" className="input" />
              </div>
              <div>
                <label className="label">Notas <span className="text-slate-600 font-normal normal-case">· opcional</span></label>
                <input type="text" value={mNotes} onChange={e => setMNotes(e.target.value)}
                       placeholder="¿Cómo te has sentido esta semana?" className="input" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowMM(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
