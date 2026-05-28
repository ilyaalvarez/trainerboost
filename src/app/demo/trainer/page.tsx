'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Zap, LayoutDashboard, Users, Dumbbell, UtensilsCrossed,
  CalendarDays, MessageSquare, Settings, CreditCard, BarChart2,
  Clock, TrendingUp, Plus, ExternalLink, Check,
} from 'lucide-react'
import StatsCard from '@/components/ui/StatsCard'
import Badge from '@/components/ui/Badge'

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
  { id: 1, initials: 'AG', name: 'Ana García',      status: 'active' as const, since: '12 Ene 2025', plan: 'Pro',    color: 'bg-sky-500/20 text-sky-300' },
  { id: 2, initials: 'PL', name: 'Pedro López',     status: 'active' as const, since: '3 Feb 2025',  plan: 'Pro',    color: 'bg-violet-500/20 text-violet-300' },
  { id: 3, initials: 'MF', name: 'María Fernández', status: 'active' as const, since: '20 Feb 2025', plan: 'Básico', color: 'bg-emerald-500/20 text-emerald-300' },
  { id: 4, initials: 'JR', name: 'Jorge Ruiz',      status: 'paused' as const, since: '5 Mar 2025',  plan: 'Pro',    color: 'bg-amber-500/20 text-amber-300' },
]

const MOCK_APPOINTMENTS = [
  { id: 1, client: 'Ana García',   initials: 'AG', time: '09:00', duration: 60, type: 'Online',     status: 'confirmed' as const },
  { id: 2, client: 'Pedro López',  initials: 'PL', time: '11:30', duration: 45, type: 'Presencial', status: 'pending' as const },
  { id: 3, client: 'María Fdez.',  initials: 'MF', time: '16:00', duration: 60, type: 'Online',     status: 'confirmed' as const },
]

const MOCK_MESSAGES = [
  { id: 1, initials: 'AG', color: 'bg-sky-500/20 text-sky-300',        name: 'Ana García',      text: '¡La nueva rutina está genial! Me encantó el circuito de fuerza', unread: true,  time: '10:32' },
  { id: 2, initials: 'PL', color: 'bg-violet-500/20 text-violet-300',  name: 'Pedro López',     text: '¿Podemos cambiar la cita del jueves al viernes?',                 unread: true,  time: '09:15' },
  { id: 3, initials: 'MF', color: 'bg-emerald-500/20 text-emerald-300',name: 'María Fernández', text: 'Ya hice las medidas esta mañana, te las mando ahora',             unread: false, time: 'Ayer' },
]

const MOCK_ROUTINES = [
  { id: 1, name: 'Fuerza + Hipertrofia', days: 'Lun · Mié · Vie', clients: 3, level: 'Intermedio' },
  { id: 2, name: 'Cardio + Core',        days: 'Mar · Jue',        clients: 2, level: 'Principiante' },
  { id: 3, name: 'Full Body Express',    days: 'Lun · Mié',        clients: 1, level: 'Avanzado' },
]

export default function TrainerDemoPage() {
  const [activeKey, setActiveKey] = useState('dashboard')
  const [readMessages, setReadMessages] = useState<Set<number>>(new Set())

  const unread = MOCK_MESSAGES.filter(m => m.unread && !readMessages.has(m.id)).length

  function markRead(id: number) {
    setReadMessages(prev => { const next = new Set(prev); next.add(id); return next })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Demo banner ──────────────────────────────────────────────── */}
      <div
        className="w-full px-4 py-3 flex items-center justify-between gap-4 text-sm sticky top-0 z-50 border-b border-brand-primary/20"
        style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.12), rgba(124,58,237,0.08))' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)', color: 'white' }}>
            DEMO
          </span>
          <span className="text-slate-300 hidden sm:block">Panel de entrenador interactivo — navega por las secciones del sidebar</span>
          <span className="text-slate-300 sm:hidden">Panel entrenador · Demo</span>
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

      {/* ── Layout ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 49px)' }}>

        {/* Sidebar */}
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

          <div className="mx-4 mt-3 px-3 py-2 rounded-lg border"
               style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(124,58,237,0.05))', borderColor: 'rgba(14,165,233,0.25)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-brand-primary" />
                <span className="text-xs font-semibold text-brand-primary">Plan Pro</span>
              </div>
              <span className="text-xs text-slate-400">4 / 10 clientes</span>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-0.5">
            {NAV_ITEMS.map(item => {
              const isActive = item.key === activeKey
              const itemBadge = item.key === 'messages' ? unread : 0
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveKey(item.key)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium relative cursor-pointer transition-all"
                  style={isActive ? { background: 'linear-gradient(90deg, rgba(14,165,233,0.12) 0%, transparent 100%)' } : {}}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full shadow-glow-sm"
                          style={{ background: 'linear-gradient(180deg, #38BDF8, #7C3AED)' }} />
                  )}
                  <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-brand-primary' : 'text-slate-500'}`} />
                  <span className={`transition-colors ${isActive ? 'text-brand-primary' : 'text-slate-400'}`}>{item.label}</span>
                  {itemBadge > 0 && (
                    <span className="ml-auto bg-brand-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{itemBadge}</span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="p-3 border-t border-border space-y-0.5">
            {[{ icon: Settings, label: 'Ajustes' }, { icon: CreditCard, label: 'Plan' }].map(item => (
              <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 cursor-default">
                <item.icon className="w-4 h-4 shrink-0 text-slate-500" />
                {item.label}
              </div>
            ))}
            <div className="pt-2 mt-1 border-t border-border/50">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300 text-xs font-bold shrink-0">CM</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">Carlos Martínez</div>
                  <div className="text-xs text-slate-500">Entrenador</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile tabs */}
          <div className="md:hidden flex overflow-x-auto border-b border-border bg-surface">
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

          <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-8">

            {/* DASHBOARD */}
            {activeKey === 'dashboard' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Panel principal</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Jueves, 29 Mayo 2025</p>
                  </div>
                  <button disabled className="btn-primary opacity-40 cursor-not-allowed text-sm">
                    <Plus className="w-4 h-4" /> Añadir cliente
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard label="Clientes activos"  value={4}     icon={<Users className="w-5 h-5" />}          color="primary" />
                  <StatsCard label="Citas hoy"          value={3}     icon={<CalendarDays className="w-5 h-5" />}   color="accent" />
                  <StatsCard label="Mensajes sin leer"  value={unread} icon={<MessageSquare className="w-5 h-5" />} color="secondary" />
                  <StatsCard label="Capacidad usada"    value="40%"   icon={<TrendingUp className="w-5 h-5" />}     color="warning" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-semibold text-white">Citas de hoy</h2>
                      <button onClick={() => setActiveKey('appointments')} className="text-xs text-brand-primary hover:underline font-medium">Ver todas →</button>
                    </div>
                    <div className="space-y-2">
                      {MOCK_APPOINTMENTS.map(apt => (
                        <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                               style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
                            <Clock className="w-4 h-4 text-brand-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-white truncate">{apt.client}</div>
                            <div className="text-xs text-slate-400">{apt.time} · {apt.duration}min · {apt.type}</div>
                          </div>
                          <Badge status={apt.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-semibold text-white">Mensajes recientes</h2>
                      <button onClick={() => setActiveKey('messages')} className="text-xs text-brand-primary hover:underline font-medium">Ver todos →</button>
                    </div>
                    <div className="space-y-2">
                      {MOCK_MESSAGES.map(msg => {
                        const isUnread = msg.unread && !readMessages.has(msg.id)
                        return (
                          <button key={msg.id} onClick={() => { markRead(msg.id); setActiveKey('messages') }}
                                  className="w-full flex items-start gap-3 p-3 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors text-left">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${msg.color}`}>{msg.initials}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-sm text-white truncate">{msg.name}</span>
                                {isUnread && <span className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />}
                              </div>
                              <div className="text-xs text-slate-400 truncate mt-0.5">{msg.text}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* CLIENTES */}
            {activeKey === 'clients' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Mis clientes</h1>
                    <p className="text-slate-400 text-sm mt-0.5">3 activos · 1 en pausa</p>
                  </div>
                  <button disabled className="btn-primary opacity-40 cursor-not-allowed text-sm">
                    <Plus className="w-4 h-4" /> Invitar cliente
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MOCK_CLIENTS.map(c => (
                    <div key={c.id} className="card p-5 flex items-center gap-4 hover:border-border-bright transition-colors">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${c.color}`}>{c.initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white">{c.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Desde {c.since}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Badge status={c.status} />
                        <span className="text-xs text-slate-500">{c.plan}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* MENSAJES */}
            {activeKey === 'messages' && (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-white">Mensajes</h1>
                  <p className="text-slate-400 text-sm mt-0.5">{unread > 0 ? `${unread} sin leer` : 'Todo leído'}</p>
                </div>
                <div className="space-y-3">
                  {MOCK_MESSAGES.map(msg => {
                    const isUnread = msg.unread && !readMessages.has(msg.id)
                    return (
                      <button key={msg.id} onClick={() => markRead(msg.id)}
                              className={`w-full card p-5 flex items-start gap-4 text-left transition-all hover:border-border-bright ${isUnread ? 'border-brand-primary/30' : ''}`}
                              style={isUnread ? { background: 'linear-gradient(180deg, rgba(14,165,233,0.04), #1E293B)' } : {}}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${msg.color}`}>{msg.initials}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-white">{msg.name}</span>
                            <span className="text-xs text-slate-500 shrink-0">{msg.time}</span>
                          </div>
                          <div className="text-sm text-slate-400 truncate mt-1">{msg.text}</div>
                        </div>
                        {isUnread
                          ? <span className="w-2.5 h-2.5 rounded-full bg-brand-primary shrink-0 mt-1" />
                          : <Check className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />}
                      </button>
                    )
                  })}
                </div>
                <p className="text-center text-xs text-slate-500">Toca un mensaje para marcarlo como leído</p>
              </>
            )}

            {/* CITAS */}
            {activeKey === 'appointments' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Citas</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Hoy · Jueves 29 Mayo</p>
                  </div>
                  <button disabled className="btn-primary opacity-40 cursor-not-allowed text-sm">
                    <Plus className="w-4 h-4" /> Nueva cita
                  </button>
                </div>
                <div className="space-y-3">
                  {MOCK_APPOINTMENTS.map(apt => (
                    <div key={apt.id} className="card p-5 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 flex-col"
                           style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' }}>
                        <span className="text-lg font-bold font-mono text-brand-primary leading-none">{apt.time.split(':')[0]}</span>
                        <span className="text-xs text-slate-500">:{apt.time.split(':')[1]}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{apt.client}</div>
                        <div className="text-sm text-slate-400 mt-0.5">{apt.duration}min · {apt.type}</div>
                      </div>
                      <Badge status={apt.status} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* RUTINAS */}
            {activeKey === 'routines' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Rutinas</h1>
                    <p className="text-slate-400 text-sm mt-0.5">3 rutinas activas</p>
                  </div>
                  <button disabled className="btn-primary opacity-40 cursor-not-allowed text-sm">
                    <Plus className="w-4 h-4" /> Nueva rutina
                  </button>
                </div>
                <div className="space-y-3">
                  {MOCK_ROUTINES.map(r => (
                    <div key={r.id} className="card p-5 flex items-center gap-4 hover:border-border-bright transition-colors">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                           style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                        <Dumbbell className="w-5 h-5 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white">{r.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{r.days}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold text-white">{r.clients} clientes</div>
                        <div className="text-xs text-slate-500 mt-0.5">{r.level}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* NUTRICIÓN */}
            {activeKey === 'nutrition' && (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-white">Nutrición</h1>
                  <p className="text-slate-400 text-sm mt-0.5">Planes nutricionales de tus clientes</p>
                </div>
                <div className="space-y-3">
                  {MOCK_CLIENTS.filter(c => c.status === 'active').map(c => (
                    <div key={c.id} className="card p-5 flex items-center gap-4 hover:border-border-bright transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${c.color}`}>{c.initials}</div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{c.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">2.800 kcal · 145g proteína</div>
                      </div>
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">Activo</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ANALYTICS */}
            {activeKey === 'analytics' && (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-white">Analytics</h1>
                  <p className="text-slate-400 text-sm mt-0.5">Rendimiento · Mayo 2025</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard label="Clientes activos" value={4}    icon={<Users className="w-5 h-5" />}         color="primary" />
                  <StatsCard label="Sesiones mes"      value={24}   icon={<CalendarDays className="w-5 h-5" />}  color="accent" />
                  <StatsCard label="Ingresos mes"      value="760€" icon={<TrendingUp className="w-5 h-5" />}    color="secondary" />
                  <StatsCard label="Retención"         value="92%"  icon={<BarChart2 className="w-5 h-5" />}     color="warning" />
                </div>
                <div className="card p-6">
                  <h2 className="font-semibold text-white mb-5">Crecimiento de clientes</h2>
                  <div className="flex items-end gap-3 h-28">
                    {[1, 1, 2, 2, 3, 4].map((v, i) => (
                      <div key={i} className="flex-1 rounded-t-md"
                           style={{ height: `${(v / 4) * 100}%`, background: i === 5 ? 'linear-gradient(180deg, #0EA5E9, #7C3AED)' : 'rgba(14,165,233,0.2)' }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-slate-600">
                    {['Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May'].map(m => <span key={m}>{m}</span>)}
                  </div>
                </div>
              </>
            )}

            {/* CTA */}
            <div className="rounded-2xl p-8 text-center border border-brand-primary/20"
                 style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(124,58,237,0.05))' }}>
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
