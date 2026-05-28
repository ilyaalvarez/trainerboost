'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Zap, LayoutDashboard, Users, Dumbbell, UtensilsCrossed,
  CalendarDays, MessageSquare, Settings, CreditCard, BarChart2,
  Clock, TrendingUp, Plus, ExternalLink, Check, Flame,
  ArrowUpRight, Award, ChevronRight, Activity,
  Video, MapPin, Trophy,
} from 'lucide-react'
import StatsCard from '@/components/ui/StatsCard'
import Badge from '@/components/ui/Badge'

// ─── Types ───────────────────────────────────────────────────
type ClientStatus = 'active' | 'paused'
type AptStatus    = 'confirmed' | 'pending' | 'done'

// ─── Counter hook ─────────────────────────────────────────────
function useCountUp(target: number, duration = 1000): number {
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
function Ring({ pct, size = 52, stroke = 5, color = '#0EA5E9' }: {
  pct: number; size?: number; stroke?: number; color?: string
}) {
  const r = (size - stroke * 2) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="shrink-0" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
        style={{ transition: 'stroke-dashoffset 1s ease', strokeLinecap: 'round' }} />
    </svg>
  )
}

// ─── Mock data ────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Panel',     key: 'dashboard' },
  { icon: Users,           label: 'Clientes',  key: 'clients' },
  { icon: Dumbbell,        label: 'Rutinas',   key: 'routines' },
  { icon: UtensilsCrossed, label: 'Nutrición', key: 'nutrition' },
  { icon: CalendarDays,    label: 'Citas',     key: 'appointments' },
  { icon: MessageSquare,   label: 'Mensajes',  key: 'messages', badge: true },
  { icon: BarChart2,       label: 'Analytics', key: 'analytics' },
]

const MOCK_CLIENTS = [
  { id: 1, initials: 'AG', name: 'Ana García',      status: 'active' as ClientStatus,
    since: '12 Ene 2025', plan: 'Pro',    sessions: 18, goal: 20, weightLoss: 2.8, streak: 12,
    nextApt: 'Hoy · 11:30', routine: 'Fuerza + Hipertrofia',
    colorClass: 'bg-sky-500/20 text-sky-300',     ringColor: '#0EA5E9' },
  { id: 2, initials: 'PL', name: 'Pedro López',     status: 'active' as ClientStatus,
    since: '3 Feb 2025',  plan: 'Pro',    sessions: 14, goal: 20, weightLoss: 1.2, streak: 8,
    nextApt: 'Vie · 09:00', routine: 'Cardio + Core',
    colorClass: 'bg-violet-500/20 text-violet-300', ringColor: '#7C3AED' },
  { id: 3, initials: 'MF', name: 'María Fernández', status: 'active' as ClientStatus,
    since: '20 Feb 2025', plan: 'Básico', sessions: 10, goal: 12, weightLoss: 0.8, streak: 5,
    nextApt: 'Hoy · 16:00', routine: 'Full Body Express',
    colorClass: 'bg-emerald-500/20 text-emerald-300', ringColor: '#10B981' },
  { id: 4, initials: 'JR', name: 'Jorge Ruiz',      status: 'paused' as ClientStatus,
    since: '5 Mar 2025',  plan: 'Pro',    sessions: 6,  goal: 20, weightLoss: 0,   streak: 0,
    nextApt: '—', routine: '—',
    colorClass: 'bg-amber-500/20 text-amber-300',   ringColor: '#F59E0B' },
]

const MOCK_APPOINTMENTS = [
  { id: 1, client: 'Ana García',  initials: 'AG', colorClass: 'bg-sky-500/20 text-sky-300',        time: '09:00', duration: 60, type: 'Online',     status: 'confirmed' as AptStatus },
  { id: 2, client: 'Pedro López', initials: 'PL', colorClass: 'bg-violet-500/20 text-violet-300',  time: '11:30', duration: 45, type: 'Presencial', status: 'pending'   as AptStatus },
  { id: 3, client: 'María Fdez.', initials: 'MF', colorClass: 'bg-emerald-500/20 text-emerald-300', time: '16:00', duration: 60, type: 'Online',     status: 'confirmed' as AptStatus },
]

const MOCK_MESSAGES = [
  { id: 1, initials: 'AG', colorClass: 'bg-sky-500/20 text-sky-300',        name: 'Ana García',      text: '¡La nueva rutina está genial! Me encantó el circuito de fuerza', unread: true,  time: '10:32' },
  { id: 2, initials: 'PL', colorClass: 'bg-violet-500/20 text-violet-300',  name: 'Pedro López',     text: '¿Podemos cambiar la cita del jueves al viernes?',                 unread: true,  time: '09:15' },
  { id: 3, initials: 'MF', colorClass: 'bg-emerald-500/20 text-emerald-300',name: 'María Fernández', text: 'Ya hice las medidas esta mañana, te las mando ahora',             unread: false, time: 'Ayer' },
]

const MOCK_ROUTINES = [
  { id: 1, name: 'Fuerza + Hipertrofia', days: 'Lun · Mié · Vie', clients: 2, level: 'Intermedio',
    exercises: ['Press de banca', 'Sentadilla libre', 'Remo con barra', 'Press militar', 'Fondos en barra'], completion: 87 },
  { id: 2, name: 'Cardio + Core',        days: 'Mar · Jue',        clients: 1, level: 'Principiante',
    exercises: ['Plancha', 'Burpees', 'Mountain climbers', 'Jumping jacks', 'Abdominales'], completion: 92 },
  { id: 3, name: 'Full Body Express',    days: 'Lun · Mié',        clients: 1, level: 'Avanzado',
    exercises: ['Peso muerto', 'Dominadas', 'Zancadas', 'Press Arnold', 'Core total'], completion: 75 },
]

const MOCK_REVENUE  = [480, 560, 640, 720, 680, 760]
const MOCK_MONTHS   = ['Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May']

const MOCK_WEEK = [
  { day: 'L', planned: 3, done: 3, today: false },
  { day: 'M', planned: 2, done: 2, today: false },
  { day: 'X', planned: 3, done: 2, today: false },
  { day: 'J', planned: 3, done: 0, today: true  },
  { day: 'V', planned: 2, done: 0, today: false },
  { day: 'S', planned: 1, done: 0, today: false },
  { day: 'D', planned: 0, done: 0, today: false },
]

const MOCK_ACTIVITY = [
  { id: 1, type: 'message',  client: 'Ana García',   initials: 'AG', colorClass: 'bg-sky-500/20 text-sky-300',        text: 'envió un mensaje nuevo',       time: '10:32' },
  { id: 2, type: 'check',    client: 'Pedro López',  initials: 'PL', colorClass: 'bg-violet-500/20 text-violet-300',  text: 'completó su rutina del día',   time: '08:45' },
  { id: 3, type: 'progress', client: 'María Fdez.',  initials: 'MF', colorClass: 'bg-emerald-500/20 text-emerald-300',text: 'registró 59.1 kg (−0.8 kg)',   time: 'Ayer' },
  { id: 4, type: 'fire',     client: 'Ana García',   initials: 'AG', colorClass: 'bg-sky-500/20 text-sky-300',        text: '¡Racha de 12 días conseguida!', time: 'Ayer' },
]

// ─── Main Component ───────────────────────────────────────────
export default function TrainerDemoPage() {
  const [activeKey, setActiveKey] = useState('dashboard')
  const [readMessages, setReadMessages] = useState<Set<number>>(new Set())

  const unread        = MOCK_MESSAGES.filter(m => m.unread && !readMessages.has(m.id)).length
  const clientsCount  = useCountUp(4)
  const revenueCount  = useCountUp(760)
  const sessionsCount = useCountUp(24)
  const retentionCount = useCountUp(92)

  function markRead(id: number) {
    setReadMessages(prev => { const next = new Set(prev); next.add(id); return next })
  }

  const nav = (key: string) => setActiveKey(key)

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Demo banner ── */}
      <div className="w-full px-4 py-3 flex items-center justify-between gap-4 text-sm sticky top-0 z-50 border-b border-brand-primary/20"
           style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.12), rgba(124,58,237,0.08))' }}>
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)', color: 'white' }}>
            DEMO
          </span>
          <span className="text-slate-300 hidden sm:block">Panel de entrenador interactivo — navega por las secciones</span>
          <span className="text-slate-300 sm:hidden">Panel entrenador · Demo</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/demo" className="text-xs text-slate-400 hover:text-white transition-colors hidden sm:block">← Volver</Link>
          <Link href="/register" className="btn-gradient text-xs px-4 py-1.5">
            <Zap className="w-3 h-3" /> Crear cuenta gratis
          </Link>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 49px)' }}>

        {/* ── Sidebar ── */}
        <aside className="w-64 bg-surface border-r border-border flex flex-col shrink-0 overflow-y-auto hidden md:flex">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-glow-sm shrink-0"
                   style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-sm tracking-tight">TrainerBoost</div>
                <div className="text-xs text-slate-500">Dashboard</div>
              </div>
            </div>
          </div>

          {/* Plan strip */}
          <div className="mx-4 mt-3 px-3 py-2.5 rounded-lg border"
               style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(124,58,237,0.05))', borderColor: 'rgba(14,165,233,0.25)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-brand-primary" />
                <span className="text-xs font-semibold text-brand-primary">Plan Pro</span>
              </div>
              <span className="text-xs text-slate-400">4 / 10</span>
            </div>
            <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '40%', background: 'linear-gradient(90deg, #0EA5E9, #7C3AED)' }} />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">4 de 10 clientes usados</p>
          </div>

          <nav className="flex-1 p-3 space-y-0.5 mt-2">
            {NAV_ITEMS.map(item => {
              const isActive = item.key === activeKey
              const itemBadge = item.key === 'messages' ? unread : 0
              return (
                <button key={item.key} onClick={() => setActiveKey(item.key)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium relative cursor-pointer transition-all"
                        style={isActive ? { background: 'linear-gradient(90deg, rgba(14,165,233,0.12) 0%, transparent 100%)' } : {}}>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full shadow-glow-sm"
                          style={{ background: 'linear-gradient(180deg, #38BDF8, #7C3AED)' }} />
                  )}
                  <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-brand-primary' : 'text-slate-500'}`} />
                  <span className={`transition-colors ${isActive ? 'text-brand-primary' : 'text-slate-400'}`}>{item.label}</span>
                  {itemBadge > 0 && (
                    <span className="ml-auto bg-brand-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">{itemBadge}</span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="p-3 border-t border-border space-y-0.5">
            {[{ icon: Settings, label: 'Ajustes' }, { icon: CreditCard, label: 'Plan' }].map(item => (
              <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 cursor-default">
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </div>
            ))}
            <div className="pt-2 mt-1 border-t border-border/50">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sky-300 text-xs font-bold shrink-0"
                     style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(124,58,237,0.15))', border: '1px solid rgba(14,165,233,0.3)' }}>
                  CM
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">Carlos Martínez</div>
                  <div className="text-[10px] text-slate-500">Entrenador Personal</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile tabs */}
          <div className="md:hidden flex overflow-x-auto border-b border-border bg-surface sticky top-0 z-10">
            {NAV_ITEMS.map(item => (
              <button key={item.key} onClick={() => setActiveKey(item.key)}
                      className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors relative ${activeKey === item.key ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400'}`}>
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
                {item.key === 'messages' && unread > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary absolute top-2 right-1" />
                )}
              </button>
            ))}
          </div>

          <div className="max-w-5xl mx-auto p-5 lg:p-8 space-y-6">

            {/* ═══ DASHBOARD ═══ */}
            {activeKey === 'dashboard' && (
              <>
                {/* Header */}
                <div className="flex items-start justify-between animate-fade-in-up">
                  <div>
                    <p className="text-xs text-brand-accent font-semibold uppercase tracking-widest mb-1">Buenos días 👋</p>
                    <h1 className="text-2xl font-bold text-white">Carlos Martínez</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Jueves, 29 Mayo · 3 citas programadas hoy</p>
                  </div>
                  <button disabled className="btn-primary opacity-40 cursor-not-allowed text-sm">
                    <Plus className="w-4 h-4" /> Añadir cliente
                  </button>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-75">
                  <StatsCard label="Clientes activos" value={clientsCount}
                    change={{ value: '+1 este mes', positive: true }}
                    icon={<Users className="w-5 h-5" />} color="primary" />
                  <StatsCard label="Ingresos mes" value={`${revenueCount}€`}
                    change={{ value: '+18%', positive: true }}
                    icon={<TrendingUp className="w-5 h-5" />} color="accent" />
                  <StatsCard label="Sesiones sem." value={sessionsCount}
                    change={{ value: '+4', positive: true }}
                    icon={<Dumbbell className="w-5 h-5" />} color="secondary" />
                  <StatsCard label="Retención" value={`${retentionCount}%`}
                    icon={<Award className="w-5 h-5" />} color="warning" />
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up delay-150">
                  {[
                    { icon: CalendarDays, label: 'Nueva cita',     color: 'text-sky-400',     bg: 'bg-sky-500/8 border-sky-500/20',     nav: 'appointments' },
                    { icon: Users,        label: 'Invitar cliente', color: 'text-violet-400',  bg: 'bg-violet-500/8 border-violet-500/20', nav: 'clients' },
                    { icon: Dumbbell,     label: 'Nueva rutina',   color: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/20', nav: 'routines' },
                    { icon: MessageSquare, label: 'Mensajes',      color: 'text-amber-400',   bg: 'bg-amber-500/8 border-amber-500/20',  nav: 'messages' },
                  ].map(a => (
                    <button key={a.label} onClick={() => nav(a.nav)}
                            className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.03] hover:shadow-card-hover group ${a.bg}`}>
                      <a.icon className={`w-6 h-6 ${a.color} transition-transform group-hover:scale-110`} />
                      <span className="text-xs font-semibold text-slate-300">{a.label}</span>
                    </button>
                  ))}
                </div>

                {/* Revenue + Weekly */}
                <div className="grid lg:grid-cols-2 gap-6 animate-fade-in-up delay-200">

                  {/* Revenue */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="font-semibold text-white">Ingresos mensuales</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Últimos 6 meses</p>
                      </div>
                      <span className="text-emerald-400 text-sm font-bold flex items-center gap-1">
                        <ArrowUpRight className="w-4 h-4" /> +58%
                      </span>
                    </div>
                    <div className="flex items-end gap-2 h-28">
                      {MOCK_REVENUE.map((v, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <span className="text-[9px] text-slate-600 font-mono">{v}€</span>
                          <div className="w-full rounded-t-sm transition-all duration-700"
                               style={{
                                 height: `${(v / 760) * 100}%`,
                                 background: i === 5 ? 'linear-gradient(180deg, #0EA5E9, #7C3AED)' : 'rgba(14,165,233,0.18)',
                                 boxShadow: i === 5 ? '0 0 10px rgba(14,165,233,0.35)' : 'none',
                                 minHeight: '4px',
                               }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex mt-2">
                      {MOCK_MONTHS.map((m, i) => (
                        <span key={m} className={`flex-1 text-center text-[10px] ${i === 5 ? 'text-brand-primary font-semibold' : 'text-slate-600'}`}>{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* Weekly schedule */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="font-semibold text-white">Esta semana</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Sesiones planificadas vs completadas</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">7 / 14 completadas</span>
                    </div>
                    <div className="flex items-end gap-2 h-24">
                      {MOCK_WEEK.map(day => (
                        <div key={day.day} className="flex-1 flex flex-col gap-1 items-center">
                          <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                            {day.planned > 0 ? (
                              <div className="w-full rounded-t-sm transition-all duration-500"
                                   style={{
                                     height: `${(day.planned / 3) * 100}%`,
                                     minHeight: '8px',
                                     background: day.today
                                       ? 'linear-gradient(180deg, #0EA5E9, #7C3AED)'
                                       : day.done === day.planned
                                       ? 'rgba(16,185,129,0.4)'
                                       : 'rgba(14,165,233,0.15)',
                                     border: day.today ? '1px solid rgba(14,165,233,0.4)' : 'none',
                                     boxShadow: day.today ? '0 0 8px rgba(14,165,233,0.25)' : 'none',
                                   }} />
                            ) : (
                              <div className="w-full rounded-t-sm bg-surface-2" style={{ height: '8px' }} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {MOCK_WEEK.map(day => (
                        <span key={day.day} className={`flex-1 text-center text-[10px] ${day.today ? 'text-brand-primary font-bold' : 'text-slate-600'}`}>
                          {day.day}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold font-mono text-emerald-400">7</div>
                        <div className="text-[10px] text-slate-500">Completadas</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold font-mono text-brand-primary">3</div>
                        <div className="text-[10px] text-slate-500">Hoy</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold font-mono text-slate-400">7</div>
                        <div className="text-[10px] text-slate-500">Pendientes</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client progress rings */}
                <div className="card p-6 animate-fade-in-up delay-300">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold text-white">Progreso de clientes</h2>
                    <button onClick={() => nav('clients')} className="text-xs text-brand-primary hover:underline font-medium flex items-center gap-1">
                      Ver todos <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {MOCK_CLIENTS.map(c => {
                      const pct = Math.round((c.sessions / c.goal) * 100)
                      return (
                        <div key={c.id} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors cursor-default group">
                          <div className="relative">
                            <Ring pct={pct} size={60} stroke={5} color={c.ringColor} />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{pct}%</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-white">{c.name.split(' ')[0]}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{c.sessions}/{c.goal} sesiones</div>
                          </div>
                          <Badge status={c.status} />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Activity feed */}
                <div className="card p-6 animate-fade-in-up delay-400">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold text-white">Actividad reciente</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">En vivo</span>
                  </div>
                  <div className="space-y-1">
                    {MOCK_ACTIVITY.map((item, i) => {
                      const iconColor = item.type === 'message' ? 'text-brand-primary' :
                                        item.type === 'check'   ? 'text-emerald-400' :
                                        item.type === 'fire'    ? 'text-amber-400' : 'text-violet-400'
                      const IconComp = item.type === 'message' ? MessageSquare :
                                       item.type === 'check'   ? Check :
                                       item.type === 'fire'    ? Flame : TrendingUp
                      return (
                        <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0 animate-fade-in-up"
                             style={{ animationDelay: `${400 + i * 80}ms` }}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${item.colorClass}`}>
                            {item.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-white font-medium">{item.client} </span>
                            <span className="text-sm text-slate-400">{item.text}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <IconComp className={`w-3.5 h-3.5 ${iconColor}`} />
                            <span className="text-xs text-slate-500">{item.time}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ═══ CLIENTES ═══ */}
            {activeKey === 'clients' && (
              <>
                <div className="flex items-center justify-between animate-fade-in-up">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Mis clientes</h1>
                    <p className="text-slate-400 text-sm mt-0.5">3 activos · 1 en pausa</p>
                  </div>
                  <button disabled className="btn-primary opacity-40 cursor-not-allowed text-sm">
                    <Plus className="w-4 h-4" /> Invitar cliente
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {MOCK_CLIENTS.map((c, i) => {
                    const pct = Math.round((c.sessions / c.goal) * 100)
                    return (
                      <div key={c.id} className="card p-5 hover:border-border-bright transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover animate-fade-in-up"
                           style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative shrink-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${c.colorClass}`}>
                              {c.initials}
                            </div>
                            {c.streak > 0 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                                {c.streak}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-white">{c.name}</span>
                              <Badge status={c.status} />
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">Desde {c.since} · {c.plan}</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-400">Sesiones del mes</span>
                            <span className="font-mono font-semibold text-white">{c.sessions}/{c.goal}</span>
                          </div>
                          <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                                 style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #10B981, #0EA5E9)' }} />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <TrendingUp className="w-3 h-3 text-emerald-400" />
                              <span className="text-sm font-bold font-mono text-emerald-400">−{c.weightLoss}kg</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">Pérdida</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Flame className="w-3 h-3 text-amber-400" />
                              <span className="text-sm font-bold font-mono text-amber-400">{c.streak}d</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">Racha</div>
                          </div>
                          <div className="text-center">
                            <span className="text-sm font-bold font-mono text-white">{pct}%</span>
                            <div className="text-[10px] text-slate-500 mt-0.5">Completado</div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <CalendarDays className="w-3.5 h-3.5" /> {c.nextApt}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Dumbbell className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[120px]">{c.routine}</span>
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* ═══ RUTINAS ═══ */}
            {activeKey === 'routines' && (
              <>
                <div className="flex items-center justify-between animate-fade-in-up">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Rutinas</h1>
                    <p className="text-slate-400 text-sm mt-0.5">3 rutinas · 4 clientes asignados</p>
                  </div>
                  <button disabled className="btn-primary opacity-40 cursor-not-allowed text-sm">
                    <Plus className="w-4 h-4" /> Nueva rutina
                  </button>
                </div>
                <div className="space-y-4">
                  {MOCK_ROUTINES.map((r, i) => {
                    const levelColor = r.level === 'Avanzado'    ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                                       r.level === 'Intermedio'  ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                                                                   'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    return (
                      <div key={r.id} className="card p-6 hover:border-border-bright transition-all hover:-translate-y-0.5 animate-fade-in-up"
                           style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                               style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                            <Dumbbell className="w-6 h-6 text-violet-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap mb-1">
                              <h3 className="font-semibold text-white text-lg">{r.name}</h3>
                              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${levelColor}`}>{r.level}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                              <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{r.days}</span>
                              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{r.clients} clientes</span>
                              <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" />{r.exercises.length} ejercicios</span>
                            </div>
                          </div>
                          <div className="relative shrink-0">
                            <Ring pct={r.completion} size={52} stroke={4} color="#10B981" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-emerald-400">{r.completion}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-[10px] text-slate-500 mb-2.5 uppercase tracking-widest font-semibold">Ejercicios incluidos</p>
                          <div className="flex flex-wrap gap-2">
                            {r.exercises.map(ex => (
                              <span key={ex} className="text-xs px-2.5 py-1 rounded-full bg-surface-2 border border-border text-slate-300">
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* ═══ NUTRICIÓN ═══ */}
            {activeKey === 'nutrition' && (
              <>
                <div className="animate-fade-in-up">
                  <h1 className="text-2xl font-bold text-white">Nutrición</h1>
                  <p className="text-slate-400 text-sm mt-0.5">Planes nutricionales activos de tus clientes</p>
                </div>
                <div className="space-y-4">
                  {MOCK_CLIENTS.filter(c => c.status === 'active').map((c, i) => {
                    const macros = [
                      { label: 'Proteína',      value: 145, max: 160, color: '#0EA5E9', unit: 'g' },
                      { label: 'Carbohidratos', value: 280, max: 350, color: '#7C3AED', unit: 'g' },
                      { label: 'Grasas',        value: 65,  max: 80,  color: '#F59E0B', unit: 'g' },
                    ]
                    return (
                      <div key={c.id} className="card p-6 hover:border-border-bright transition-all animate-fade-in-up"
                           style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="flex items-center gap-4 mb-5">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${c.colorClass}`}>
                            {c.initials}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white">{c.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">2.800 kcal objetivo diario</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold font-mono text-white">2.650</div>
                            <div className="text-[10px] text-slate-500">kcal hoy</div>
                          </div>
                        </div>
                        <div className="space-y-3.5">
                          {macros.map(m => (
                            <div key={m.label}>
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-slate-400 font-medium">{m.label}</span>
                                <span className="font-mono font-semibold text-white">{m.value}{m.unit} / {m.max}{m.unit}</span>
                              </div>
                              <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700"
                                     style={{ width: `${(m.value / m.max) * 100}%`, background: m.color }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* ═══ CITAS ═══ */}
            {activeKey === 'appointments' && (
              <>
                <div className="flex items-center justify-between animate-fade-in-up">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Citas</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Hoy · Jueves 29 Mayo</p>
                  </div>
                  <button disabled className="btn-primary opacity-40 cursor-not-allowed text-sm">
                    <Plus className="w-4 h-4" /> Nueva cita
                  </button>
                </div>

                {/* Timeline */}
                <div className="relative animate-fade-in-up delay-100">
                  <div className="absolute left-[27px] top-4 bottom-4 w-px bg-border/50" />
                  <div className="space-y-4">
                    {MOCK_APPOINTMENTS.map((apt, i) => (
                      <div key={apt.id} className="flex items-center gap-4 relative animate-fade-in-up"
                           style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 z-10"
                             style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' }}>
                          <span className="text-xl font-bold font-mono text-brand-primary leading-none">{apt.time.split(':')[0]}</span>
                          <span className="text-[10px] text-slate-500">:{apt.time.split(':')[1]}</span>
                        </div>
                        <div className="flex-1 card p-4 hover:border-border-bright transition-all hover:-translate-y-0.5">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${apt.colorClass}`}>
                                {apt.initials}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{apt.client}</div>
                                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  <span>{apt.duration}min</span>
                                  <span>·</span>
                                  {apt.type === 'Online'
                                    ? <><Video className="w-3 h-3" /> Online</>
                                    : <><MapPin className="w-3 h-3" /> Presencial</>}
                                </div>
                              </div>
                            </div>
                            <Badge status={apt.status} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming */}
                <div className="card p-6 animate-fade-in-up delay-300">
                  <h2 className="font-semibold text-white mb-4">Próximas citas</h2>
                  <div className="space-y-3">
                    {[
                      { date: 'Vie 30 Mayo', time: '09:00', client: 'Pedro López', type: 'Online' },
                      { date: 'Lun 2 Junio', time: '10:30', client: 'Ana García',  type: 'Presencial' },
                      { date: 'Mar 3 Junio', time: '16:00', client: 'María Fdez.', type: 'Online' },
                    ].map(apt => (
                      <div key={apt.date + apt.time} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2">
                        <div className="text-center shrink-0 w-16">
                          <div className="text-xs font-semibold text-slate-300">{apt.date.split(' ').slice(0, 2).join(' ')}</div>
                          <div className="text-sm font-bold font-mono text-brand-primary">{apt.time}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-white">{apt.client}</div>
                          <div className="text-xs text-slate-500">{apt.type}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ═══ MENSAJES ═══ */}
            {activeKey === 'messages' && (
              <>
                <div className="animate-fade-in-up">
                  <h1 className="text-2xl font-bold text-white">Mensajes</h1>
                  <p className="text-slate-400 text-sm mt-0.5">{unread > 0 ? `${unread} sin leer` : 'Todo leído'}</p>
                </div>
                <div className="space-y-2">
                  {MOCK_MESSAGES.map((msg, i) => {
                    const isUnread = msg.unread && !readMessages.has(msg.id)
                    return (
                      <button key={msg.id} onClick={() => markRead(msg.id)}
                              className={`w-full card p-5 flex items-start gap-4 text-left transition-all hover:border-border-bright hover:-translate-y-0.5 animate-fade-in-up ${isUnread ? 'border-brand-primary/30' : ''}`}
                              style={{
                                animationDelay: `${i * 80}ms`,
                                background: isUnread ? 'linear-gradient(180deg, rgba(14,165,233,0.04), #1E293B)' : undefined,
                              }}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${msg.colorClass}`}>
                          {msg.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-white">{msg.name}</span>
                            <span className="text-xs text-slate-500 shrink-0">{msg.time}</span>
                          </div>
                          <div className="text-sm text-slate-400 truncate mt-1">{msg.text}</div>
                        </div>
                        {isUnread
                          ? <span className="w-2.5 h-2.5 rounded-full bg-brand-primary shrink-0 mt-1 animate-pulse" />
                          : <Check className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />}
                      </button>
                    )
                  })}
                </div>
                <p className="text-center text-xs text-slate-500">Toca un mensaje para marcarlo como leído</p>
              </>
            )}

            {/* ═══ ANALYTICS ═══ */}
            {activeKey === 'analytics' && (
              <>
                <div className="animate-fade-in-up">
                  <h1 className="text-2xl font-bold text-white">Analytics</h1>
                  <p className="text-slate-400 text-sm mt-0.5">Rendimiento · Mayo 2025</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-75">
                  <StatsCard label="Clientes activos" value={4}    change={{ value: '+1',  positive: true }} icon={<Users className="w-5 h-5" />}        color="primary" />
                  <StatsCard label="Ingresos mes"      value="760€" change={{ value: '+18%', positive: true }} icon={<TrendingUp className="w-5 h-5" />}   color="accent" />
                  <StatsCard label="Sesiones mes"      value={24}   change={{ value: '+4',  positive: true }} icon={<CalendarDays className="w-5 h-5" />} color="secondary" />
                  <StatsCard label="Retención"         value="92%"  icon={<Trophy className="w-5 h-5" />}    color="warning" />
                </div>

                {/* Revenue chart */}
                <div className="card p-6 animate-fade-in-up delay-150">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-semibold text-white">Evolución de ingresos</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Dic 2024 — May 2025</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" /> +58% en 6 meses
                    </span>
                  </div>
                  <div className="flex items-end gap-3 h-36">
                    {MOCK_REVENUE.map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">{v}€</span>
                        <div className="w-full rounded-t-md transition-all duration-700"
                             style={{
                               height: `${(v / 760) * 100}%`,
                               background: i === 5 ? 'linear-gradient(180deg, #0EA5E9, #7C3AED)' : 'rgba(14,165,233,0.22)',
                               boxShadow: i === 5 ? '0 0 12px rgba(14,165,233,0.35)' : 'none',
                               minHeight: '4px',
                             }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex mt-2">
                    {MOCK_MONTHS.map((m, i) => (
                      <span key={m} className={`flex-1 text-center text-xs ${i === 5 ? 'text-brand-primary font-semibold' : 'text-slate-600'}`}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* Client metrics */}
                <div className="grid lg:grid-cols-2 gap-6 animate-fade-in-up delay-200">
                  <div className="card p-6">
                    <h2 className="font-semibold text-white mb-5">Sesiones completadas por cliente</h2>
                    <div className="space-y-4">
                      {MOCK_CLIENTS.map(c => {
                        const pct = Math.round((c.sessions / c.goal) * 100)
                        return (
                          <div key={c.id}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${c.colorClass}`}>
                                  {c.initials.charAt(0)}
                                </div>
                                <span className="text-slate-300">{c.name.split(' ').slice(0, 2).join(' ')}</span>
                              </div>
                              <span className="font-mono font-semibold text-white">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700"
                                   style={{ width: `${pct}%`, background: c.ringColor }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="card p-6">
                    <h2 className="font-semibold text-white mb-5">Crecimiento de clientes</h2>
                    <div className="flex items-end gap-2 h-28">
                      {[1, 1, 2, 2, 3, 4].map((v, i) => (
                        <div key={i} className="flex-1 rounded-t-md"
                             style={{
                               height: `${(v / 4) * 100}%`,
                               background: i === 5 ? 'linear-gradient(180deg, #0EA5E9, #7C3AED)' : 'rgba(14,165,233,0.2)',
                               minHeight: '4px',
                             }} />
                      ))}
                    </div>
                    <div className="flex mt-2">
                      {MOCK_MONTHS.map(m => <span key={m} className="flex-1 text-center text-[10px] text-slate-600">{m}</span>)}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold font-mono gradient-text">+33%</div>
                        <div className="text-xs text-slate-500">Crecimiento anual</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold font-mono text-white">4</div>
                        <div className="text-xs text-slate-500">Clientes activos</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ═══ CTA ═══ */}
            <div className="rounded-2xl p-8 text-center border border-brand-primary/20 animate-fade-in-up"
                 style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.07), rgba(124,58,237,0.05))' }}>
              <h3 className="text-xl font-bold text-white mb-2">¿Listo para empezar?</h3>
              <p className="text-slate-400 text-sm mb-6">Crea tu cuenta gratis y gestiona hasta 3 clientes sin pagar nada.</p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link href="/register" className="btn-gradient px-8 py-2.5">
                  <Zap className="w-4 h-4" /> Crear cuenta gratis
                </Link>
                <Link href="/pricing" className="btn-secondary px-6 py-2.5">
                  Ver planes <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
