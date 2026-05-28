import Link from 'next/link'
import {
  Zap, LayoutDashboard, Users, Dumbbell, UtensilsCrossed,
  CalendarDays, MessageSquare, Settings, CreditCard, BarChart2,
  Clock, TrendingUp, Plus, ExternalLink,
} from 'lucide-react'
import StatsCard from '@/components/ui/StatsCard'
import Badge from '@/components/ui/Badge'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Panel',      active: true,  badge: 0 },
  { icon: Users,           label: 'Clientes',   active: false, badge: 0 },
  { icon: Dumbbell,        label: 'Rutinas',    active: false, badge: 0 },
  { icon: UtensilsCrossed, label: 'Nutrición',  active: false, badge: 0 },
  { icon: CalendarDays,    label: 'Citas',      active: false, badge: 0 },
  { icon: MessageSquare,   label: 'Mensajes',   active: false, badge: 2 },
  { icon: BarChart2,       label: 'Analytics',  active: false, badge: 0 },
]

const MOCK_CLIENTS = [
  { id: 1, initials: 'AG', name: 'Ana García',       status: 'active' as const,  since: '12 Ene 2025',  color: 'bg-sky-500/20 text-sky-300' },
  { id: 2, initials: 'PL', name: 'Pedro López',      status: 'active' as const,  since: '3 Feb 2025',   color: 'bg-violet-500/20 text-violet-300' },
  { id: 3, initials: 'MF', name: 'María Fernández',  status: 'active' as const,  since: '20 Feb 2025',  color: 'bg-emerald-500/20 text-emerald-300' },
  { id: 4, initials: 'JR', name: 'Jorge Ruiz',       status: 'paused' as const,  since: '5 Mar 2025',   color: 'bg-amber-500/20 text-amber-300' },
]

const MOCK_APPOINTMENTS = [
  { id: 1, client: 'Ana García',    initials: 'AG', color: 'bg-sky-500/20 text-sky-300',     time: '09:00', duration: 60, type: 'Online',      status: 'confirmed' as const },
  { id: 2, client: 'Pedro López',   initials: 'PL', color: 'bg-violet-500/20 text-violet-300', time: '11:30', duration: 45, type: 'Presencial', status: 'pending' as const },
]

const MOCK_MESSAGES = [
  { id: 1, initials: 'AG', color: 'bg-sky-500/20 text-sky-300',     name: 'Ana García',   text: '¡La nueva rutina está genial! Me encantó el circuito de fuerza', unread: true },
  { id: 2, initials: 'PL', color: 'bg-violet-500/20 text-violet-300', name: 'Pedro López',  text: '¿Podemos cambiar la cita del jueves al viernes?', unread: true },
  { id: 3, initials: 'MF', color: 'bg-emerald-500/20 text-emerald-300', name: 'María Fernández', text: 'Ya hice las medidas esta mañana, te las mando ahora', unread: false },
]

export default function TrainerDemoPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Demo banner ────────────────────────────────────────────────── */}
      <div
        className="w-full px-4 py-3 flex items-center justify-between gap-4 text-sm sticky top-0 z-50 border-b border-brand-primary/20"
        style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.12), rgba(124,58,237,0.08))' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)', color: 'white' }}>
            DEMO
          </span>
          <span className="text-slate-300 hidden sm:block">Vista previa del panel de entrenador — datos de ejemplo</span>
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

      {/* ── Layout ─────────────────────────────────────────────────────── */}
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
              <span className="text-xs text-slate-400">10 clientes</span>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-0.5">
            {NAV_ITEMS.map(item => (
              <div
                key={item.label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium relative cursor-default select-none"
                style={item.active ? { background: 'linear-gradient(90deg, rgba(14,165,233,0.12) 0%, transparent 100%)' } : {}}
              >
                {item.active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full shadow-glow-sm"
                        style={{ background: 'linear-gradient(180deg, #38BDF8, #7C3AED)' }} />
                )}
                <item.icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-brand-primary' : 'text-slate-500'}`} />
                <span className={item.active ? 'text-brand-primary' : 'text-slate-400'}>{item.label}</span>
                {item.badge > 0 && (
                  <span className="ml-auto bg-brand-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
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
                <div className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300 text-xs font-bold shrink-0">
                  CM
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">Carlos Martínez</div>
                  <div className="text-xs text-slate-500">Entrenador</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Panel principal</h1>
                <p className="text-slate-400 text-sm mt-0.5">Jueves, 29 Mayo 2025</p>
              </div>
              <button disabled className="btn-primary opacity-50 cursor-not-allowed">
                <Plus className="w-4 h-4" /> Añadir cliente
              </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard label="Clientes activos"    value={4}    icon={<Users className="w-5 h-5" />}        color="primary" />
              <StatsCard label="Citas hoy"           value={2}    icon={<CalendarDays className="w-5 h-5" />} color="accent" />
              <StatsCard label="Mensajes sin leer"   value={2}    icon={<MessageSquare className="w-5 h-5" />} color="secondary" />
              <StatsCard label="Capacidad usada"     value="40%"  icon={<TrendingUp className="w-5 h-5" />}   color="warning" />
            </div>

            {/* Appointments + Messages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-white">Citas de hoy</h2>
                  <span className="text-xs text-brand-primary font-medium opacity-50">Ver todas →</span>
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
                  <span className="text-xs text-brand-primary font-medium opacity-50">Ver todos →</span>
                </div>
                <div className="space-y-2">
                  {MOCK_MESSAGES.map(msg => (
                    <div key={msg.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${msg.color}`}>
                        {msg.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm text-white truncate">{msg.name}</span>
                          {msg.unread && <span className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />}
                        </div>
                        <div className="text-xs text-slate-400 truncate mt-0.5">{msg.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Clients table */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-white">Mis clientes</h2>
                <span className="text-xs text-brand-primary font-medium opacity-50">Gestionar →</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                      <th className="text-left pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                      <th className="text-left pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Desde</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {MOCK_CLIENTS.map(c => (
                      <tr key={c.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${c.color}`}>
                              {c.initials}
                            </div>
                            <span className="font-medium text-white">{c.name}</span>
                          </div>
                        </td>
                        <td className="py-3"><Badge status={c.status} /></td>
                        <td className="py-3 text-slate-400 hidden sm:table-cell">{c.since}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Register CTA */}
            <div
              className="rounded-2xl p-8 text-center border border-brand-primary/20"
              style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(124,58,237,0.05))' }}
            >
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
