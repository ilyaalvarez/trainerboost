'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar, Cell,
} from 'recharts'
import { TrendingDown, TrendingUp, Users, Activity, Calendar, MessageCircle, Download, CreditCard, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import PlanGuard from '@/components/ui/PlanGuard'
import type { Profile, ProgressLog } from '@/types/database'

// Palette for multi-client lines
const LINE_COLORS = [
  '#0EA5E9', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
]

interface BusinessKpis {
  sessionsThisMonth: number
  activeClientsCount: number
  totalMessages: number
  retentionRate: number | null
}

interface SubscriptionKpi {
  plan: string | null
  status: string
  maxClients: number
  currentPeriodEnd: string | null
}

const PLAN_PRICES: Record<string, number> = { starter: 19, pro: 39, unlimited: 79 }
const PLAN_LABELS: Record<string, string> = { starter: 'Starter', pro: 'Pro', unlimited: 'Unlimited' }
const PLAN_COLORS: Record<string, string> = {
  starter: 'text-semantic-info-text bg-semantic-info/15',
  pro: 'text-[#C4B5FD] bg-brand-secondary/15',
  unlimited: 'text-semantic-warning-text bg-semantic-warning/15',
}

interface ClientProgress {
  client: Profile
  logs: ProgressLog[]
  latest: ProgressLog | null
  change: number | null  // kg since first log
}

interface ChartPoint {
  date: string
  [clientName: string]: string | number | null
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-xl p-3 text-xs shadow-lg">
      <p className="text-fg-secondary mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-fg-secondary">{p.name}:</span>
          <span className="font-semibold text-fg-primary">{p.value} kg</span>
        </div>
      ))}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const supabase = createClient()
  const [clients, setClients] = useState<ClientProgress[]>([])
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [weeklySessions, setWeeklySessions] = useState<{ week: string; sessions: number; current: boolean }[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [metric, setMetric] = useState<'weight_kg' | 'body_fat_pct'>('weight_kg')
  const [kpis, setKpis] = useState<BusinessKpis>({ sessionsThisMonth: 0, activeClientsCount: 0, totalMessages: 0, retentionRate: null })
  const [subscription, setSubscription] = useState<SubscriptionKpi | null>(null)
  const [clientCheckins, setClientCheckins] = useState<Array<{ clientId: string; name: string; avatarUrl: string | null; avgEnergy: number | null; avgMood: number | null; avgSleep: number | null; checkinsCount: number }>>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Business KPIs — fetched in parallel
    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const twelveWeeksAgo = new Date(Date.now() - 12 * 7 * 86400000).toISOString()

    const [
      { count: sessionsThisMonth },
      { count: activeClientsCount },
      { count: totalMessages },
      { data: recentSessions },
      { data: subData },
    ] = await Promise.all([
      supabase.from('appointments').select('*', { count: 'exact', head: true })
        .eq('trainer_id', user.id).eq('status', 'done').gte('created_at', thisMonthStart),
      supabase.from('trainer_clients').select('*', { count: 'exact', head: true })
        .eq('trainer_id', user.id).eq('status', 'active'),
      supabase.from('messages').select('*', { count: 'exact', head: true })
        .eq('sender_id', user.id),
      supabase.from('appointments').select('scheduled_at')
        .eq('trainer_id', user.id).eq('status', 'done')
        .gte('scheduled_at', twelveWeeksAgo)
        .order('scheduled_at'),
      supabase.from('subscriptions').select('plan,status,max_clients,current_period_end')
        .eq('user_id', user.id).maybeSingle(),
    ])

    if (subData) {
      setSubscription({
        plan: subData.plan,
        status: subData.status,
        maxClients: subData.max_clients ?? 0,
        currentPeriodEnd: subData.current_period_end,
      })
    }

    // Build weekly sessions chart data (last 12 weeks)
    const weekMap: Record<string, number> = {}
    const now = new Date()
    for (let w = 11; w >= 0; w--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay() + 1 - w * 7) // Monday
      const label = weekStart.toLocaleString('es-ES', { month: 'short', day: 'numeric' })
      weekMap[label] = 0
    }
    for (const s of recentSessions ?? []) {
      const d = new Date(s.scheduled_at)
      const monday = new Date(d)
      monday.setDate(d.getDate() - d.getDay() + 1)
      const label = monday.toLocaleString('es-ES', { month: 'short', day: 'numeric' })
      if (label in weekMap) weekMap[label]++
    }
    const currentWeekMonday = new Date(now)
    currentWeekMonday.setDate(now.getDate() - now.getDay() + 1)
    const currentWeekLabel = currentWeekMonday.toLocaleString('es-ES', { month: 'short', day: 'numeric' })
    setWeeklySessions(Object.entries(weekMap).map(([week, sessions]) => ({
      week, sessions, current: week === currentWeekLabel,
    })))
    setKpis(prev => ({
      ...prev,
      sessionsThisMonth: sessionsThisMonth ?? 0,
      activeClientsCount: activeClientsCount ?? 0,
      totalMessages: totalMessages ?? 0,
    }))

    // Fetch all clients for this trainer
    const { data: relations, error } = await supabase
      .from('trainer_clients')
      .select('client_id, profiles!client_id(id, full_name, avatar_url)')
      .eq('trainer_id', user.id)
      .eq('status', 'active')

    if (error) throw error

    const clientIds = (relations ?? []).map(r => r.client_id)
    if (clientIds.length === 0) { setClients([]); return }

    // Fetch daily check-ins for the last 30 days
    const thirtyDaysAgoStr = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
    const { data: checkinData } = await supabase
      .from('daily_checkins')
      .select('client_id, energy, mood, sleep_hours')
      .in('client_id', clientIds)
      .gte('checkin_date', thirtyDaysAgoStr)

    const checkinsByClient: Record<string, Array<{ energy: number | null; mood: number | null; sleep_hours: number | null }>> = {}
    for (const c of checkinData ?? []) {
      if (!checkinsByClient[c.client_id]) checkinsByClient[c.client_id] = []
      checkinsByClient[c.client_id].push({ energy: c.energy, mood: c.mood, sleep_hours: c.sleep_hours })
    }
    const wellbeingData = (relations ?? []).map(r => {
      const profile = r.profiles as unknown as Profile
      const entries = checkinsByClient[r.client_id] ?? []
      const withEnergy = entries.filter(e => e.energy != null)
      const withMood = entries.filter(e => e.mood != null)
      const withSleep = entries.filter(e => e.sleep_hours != null)
      return {
        clientId: r.client_id,
        name: profile.full_name,
        avatarUrl: profile.avatar_url,
        avgEnergy: withEnergy.length > 0 ? Math.round(withEnergy.reduce((s, e) => s + (e.energy ?? 0), 0) / withEnergy.length * 10) / 10 : null,
        avgMood: withMood.length > 0 ? Math.round(withMood.reduce((s, e) => s + (e.mood ?? 0), 0) / withMood.length * 10) / 10 : null,
        avgSleep: withSleep.length > 0 ? Math.round(withSleep.reduce((s, e) => s + (e.sleep_hours ?? 0), 0) / withSleep.length * 10) / 10 : null,
        checkinsCount: entries.length,
      }
    }).filter(w => w.checkinsCount > 0).sort((a, b) => (a.avgEnergy ?? 99) - (b.avgEnergy ?? 99))
    setClientCheckins(wellbeingData)

    // Fetch all progress logs for all clients at once
    const { data: logs } = await supabase
      .from('progress_logs')
      .select('*')
      .in('client_id', clientIds)
      .eq('trainer_id', user.id)
      .order('logged_at', { ascending: true })

    const logsByClient: Record<string, ProgressLog[]> = {}
    for (const log of logs ?? []) {
      if (!logsByClient[log.client_id]) logsByClient[log.client_id] = []
      logsByClient[log.client_id].push(log)
    }

    const clientProgress: ClientProgress[] = (relations ?? []).map(r => {
      const profile = r.profiles as unknown as Profile
      const clientLogs = logsByClient[r.client_id] ?? []
      const latest = clientLogs[clientLogs.length - 1] ?? null
      const first = clientLogs[0] ?? null
      const change = latest && first && latest.weight_kg != null && first.weight_kg != null
        ? Math.round((latest.weight_kg - first.weight_kg) * 10) / 10
        : null
      return { client: profile, logs: clientLogs, latest, change }
    }).filter(cp => cp.logs.length > 0)

    // Compute retention rate: % of active clients with a log in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
    const activeWithRecentLog = new Set(
      (logs ?? []).filter(l => l.logged_at >= thirtyDaysAgo).map(l => l.client_id)
    ).size
    const total = clientIds.length
    const retentionRate = total > 0 ? Math.round((activeWithRecentLog / total) * 100) : null
    setKpis(prev => ({ ...prev, retentionRate }))

    setClients(clientProgress)
    // Select all by default
    setSelected(new Set(clientProgress.map(cp => cp.client.id)))

    // Build chart data — merge all dates into a single timeline
    const allDates = new Set<string>()
    for (const cp of clientProgress) {
      for (const log of cp.logs) {
        allDates.add(formatDate(log.logged_at, 'dd/MM'))
      }
    }
    const sortedDates = Array.from(allDates).sort((a, b) => {
      const [da, ma] = a.split('/').map(Number)
      const [db, mb] = b.split('/').map(Number)
      return ma !== mb ? ma - mb : da - db
    })

    const points: ChartPoint[] = sortedDates.map(date => {
      const point: ChartPoint = { date }
      for (const cp of clientProgress) {
        const log = cp.logs.find(l => formatDate(l.logged_at, 'dd/MM') === date)
        point[cp.client.full_name] = log?.[metric] ?? null
      }
      return point
    })

    setChartData(points)
    } catch (err: unknown) {
      toast.error('Error al cargar las analíticas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [supabase, metric])

  useEffect(() => { load() }, [load])

  function exportCsv() {
    const rows = ['Cliente,Fecha,Peso (kg),% Grasa,Masa muscular (kg)']
    for (const cp of clients) {
      for (const log of cp.logs) {
        rows.push([
          `"${cp.client.full_name}"`,
          new Date(log.logged_at).toLocaleDateString('es-ES'),
          log.weight_kg ?? '',
          log.body_fat_pct ?? '',
          log.muscle_mass_kg ?? '',
        ].join(','))
      }
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `progreso-clientes-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function toggleClient(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const activeClients = clients.filter(cp => selected.has(cp.client.id))

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  if (!subscription?.plan) {
    return (
      <PlanGuard requiredPlan="starter" currentPlan={null}>
        <div />
      </PlanGuard>
    )
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Activity className="w-12 h-12 text-fg-disabled mb-4" />
        <h2 className="text-lg font-semibold text-fg-primary mb-2">Sin datos de progreso</h2>
        <p className="text-fg-secondary text-sm max-w-xs">
          Registra medidas de tus clientes para ver comparativas aquí.
        </p>
      </div>
    )
  }

  // Summary stats
  const withLoss  = clients.filter(cp => cp.change !== null && cp.change < 0)
  const withGain  = clients.filter(cp => cp.change !== null && cp.change > 0)
  const avgChange = clients.reduce((acc, cp) => acc + (cp.change ?? 0), 0) / clients.filter(cp => cp.change !== null).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-fg-primary">Analytics</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMetric('weight_kg')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${metric === 'weight_kg' ? 'bg-brand-primary text-black' : 'text-fg-secondary hover:text-fg-primary'}`}
          >
            Peso (kg)
          </button>
          <button
            onClick={() => setMetric('body_fat_pct')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${metric === 'body_fat_pct' ? 'bg-brand-primary text-black' : 'text-fg-secondary hover:text-fg-primary'}`}
          >
            % Grasa
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-fg-secondary hover:text-fg-primary hover:bg-surface-2 transition-colors border border-border/60"
            title="Exportar datos como CSV"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      {/* Business KPIs */}
      {(() => {
        const businessKpis = [
          {
            label: 'Clientes activos',
            value: kpis.activeClientsCount,
            Icon: Users,
            color: 'text-semantic-info-text',
            bg: 'rgba(14,165,233,0.15)',
          },
          {
            label: 'Sesiones este mes',
            value: kpis.sessionsThisMonth,
            Icon: Calendar,
            color: 'text-[#C4B5FD]',
            bg: 'rgba(124,58,237,0.15)',
          },
          {
            label: 'Mensajes enviados',
            value: kpis.totalMessages,
            Icon: MessageCircle,
            color: 'text-semantic-success-text',
            bg: 'rgba(16,185,129,0.15)',
          },
          {
            label: 'Retención 30d',
            value: kpis.retentionRate != null ? `${kpis.retentionRate}%` : '—',
            Icon: Activity,
            color: 'text-semantic-warning-text',
            bg: 'rgba(245,158,11,0.15)',
          },
        ]
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {businessKpis.map(kpi => (
              <div key={kpi.label} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-fg-secondary uppercase tracking-wider">{kpi.label}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: kpi.bg }}>
                    <kpi.Icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-fg-primary">{kpi.value}</p>
              </div>
            ))}
          </div>
        )
      })()}

      {/* Plan & MRR */}
      {subscription && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-secondary/15">
                <CreditCard className="w-4 h-4 text-[#C4B5FD]" />
              </div>
              <h2 className="text-sm font-semibold text-fg-primary">Tu plan</h2>
            </div>
            <div className="flex items-center gap-2">
              {subscription.plan && (
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${PLAN_COLORS[subscription.plan] ?? 'text-fg-secondary bg-surface-3'}`}>
                  {PLAN_LABELS[subscription.plan] ?? subscription.plan}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full ${subscription.status === 'active' ? 'bg-semantic-success/15 text-semantic-success-text' : 'bg-surface-3 text-fg-secondary'}`}>
                {subscription.status === 'active' ? 'Activo' : subscription.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0F172A]/60 rounded-xl p-4 border border-[#334155]/60">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-semantic-warning-text" />
                <span className="text-xs text-fg-secondary uppercase tracking-wider font-medium">MRR</span>
              </div>
              <p className="text-2xl font-bold text-fg-primary">
                {subscription.plan && PLAN_PRICES[subscription.plan]
                  ? `${PLAN_PRICES[subscription.plan]}€`
                  : '—'}
              </p>
              <p className="text-xs text-fg-muted mt-0.5">al mes</p>
            </div>

            <div className="bg-[#0F172A]/60 rounded-xl p-4 border border-[#334155]/60">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-semantic-info-text" />
                <span className="text-xs text-fg-secondary uppercase tracking-wider font-medium">Capacidad</span>
              </div>
              <p className="text-2xl font-bold text-fg-primary">
                {kpis.activeClientsCount}
                <span className="text-sm font-normal text-fg-muted"> / {subscription.maxClients === 9999 ? '∞' : subscription.maxClients}</span>
              </p>
              {subscription.maxClients > 0 && subscription.maxClients !== 9999 && (
                <div className="mt-2 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min((kpis.activeClientsCount / subscription.maxClients) * 100, 100)}%`,
                      background: kpis.activeClientsCount / subscription.maxClients > 0.9 ? '#EF4444' : kpis.activeClientsCount / subscription.maxClients > 0.7 ? '#F59E0B' : '#0EA5E9',
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-fg-muted mt-1">clientes activos</p>
            </div>

            <div className="bg-[#0F172A]/60 rounded-xl p-4 border border-[#334155]/60">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-semantic-success-text" />
                <span className="text-xs text-fg-secondary uppercase tracking-wider font-medium">Renovación</span>
              </div>
              <p className="text-sm font-semibold text-fg-primary mt-2">
                {subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'}
              </p>
              <p className="text-xs text-fg-muted mt-0.5">próxima fecha</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-fg-secondary mb-1">Clientes con datos</p>
          <p className="text-2xl font-bold font-mono text-fg-primary">{clients.length}</p>
          <div className="flex items-center gap-1 mt-1">
            <Users className="w-3 h-3 text-fg-muted" />
            <span className="text-xs text-fg-muted">con registros</span>
          </div>
        </div>
        <div className="card p-4">
          <p className="text-xs text-fg-secondary mb-1">Bajaron peso</p>
          <p className="text-2xl font-bold font-mono text-semantic-success-text">{withLoss.length}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingDown className="w-3 h-3 text-semantic-success-text" />
            <span className="text-xs text-fg-muted">clientes</span>
          </div>
        </div>
        <div className="card p-4">
          <p className="text-xs text-fg-secondary mb-1">Subieron peso</p>
          <p className="text-2xl font-bold font-mono text-semantic-warning-text">{withGain.length}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-semantic-warning-text" />
            <span className="text-xs text-fg-muted">clientes</span>
          </div>
        </div>
        <div className="card p-4">
          <p className="text-xs text-fg-secondary mb-1">Cambio medio</p>
          <p className={`text-2xl font-bold font-mono ${avgChange < 0 ? 'text-semantic-success-text' : avgChange > 0 ? 'text-semantic-warning-text' : 'text-fg-primary'}`}>
            {isNaN(avgChange) ? '—' : `${avgChange > 0 ? '+' : ''}${avgChange.toFixed(1)} kg`}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Activity className="w-3 h-3 text-fg-muted" />
            <span className="text-xs text-fg-muted">entre todos</span>
          </div>
        </div>
      </div>

      {/* Weekly sessions bar chart */}
      {weeklySessions.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-fg-primary">Sesiones completadas por semana</h2>
            <span className="text-xs text-fg-muted">Últimas 12 semanas</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklySessions} margin={{ top: 0, right: 0, bottom: 0, left: -20 }} barSize={18} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: 12 }}
                formatter={(v) => [v, 'Sesiones']}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="sessions" radius={[4, 4, 0, 0]}>
                {weeklySessions.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.current ? '#0EA5E9' : entry.sessions > 0 ? '#7C3AED' : '#1E293B'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-fg-disabled mt-1">Azul = semana actual · Morado = semanas anteriores</p>
        </div>
      )}

      {/* Bienestar de clientes */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-fg-primary">Bienestar de clientes</h2>
            <p className="text-xs text-fg-muted mt-0.5">Promedios de check-in — últimos 30 días</p>
          </div>
        </div>
        {clientCheckins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                 style={{ background: 'rgba(51,65,85,0.5)' }}>
              <Activity className="w-6 h-6 text-fg-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-fg-secondary">Sin datos de bienestar aún</p>
              <p className="text-xs text-fg-disabled mt-1 max-w-xs">Anima a tus clientes a completar el check-in diario para ver sus niveles de energía, ánimo y sueño.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {clientCheckins.map(c => (
              <div key={c.clientId} className="flex items-center gap-4">
                <Avatar name={c.name} url={c.avatarUrl} size="sm" />
                <span className="text-sm text-fg-primary flex-1 min-w-0 truncate">{c.name}</span>
                <div className="flex items-center gap-4 text-xs shrink-0">
                  {c.avgEnergy != null && (
                    <div className="flex items-center gap-1">
                      <span>⚡</span>
                      <div className="w-20 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-semantic-warning" style={{ width: `${(c.avgEnergy / 5) * 100}%` }} />
                      </div>
                      <span className="text-fg-secondary w-6">{c.avgEnergy}</span>
                    </div>
                  )}
                  {c.avgMood != null && (
                    <div className="flex items-center gap-1">
                      <span>😊</span>
                      <div className="w-20 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-semantic-info" style={{ width: `${(c.avgMood / 5) * 100}%` }} />
                      </div>
                      <span className="text-fg-secondary w-6">{c.avgMood}</span>
                    </div>
                  )}
                  {c.avgSleep != null && (
                    <div className="flex items-center gap-1 text-fg-secondary">
                      <span>🌙</span>
                      <span>{c.avgSleep}h</span>
                    </div>
                  )}
                  <span className="text-fg-disabled text-[10px]">{c.checkinsCount} check-ins</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Client progress chart */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-fg-primary mb-4">
          {metric === 'weight_kg' ? 'Evolución del peso' : 'Evolución % grasa corporal'}
        </h2>
        {activeClients.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center gap-2 text-center">
            <Activity className="w-8 h-8 text-fg-disabled" />
            <p className="text-fg-muted text-sm">Selecciona al menos un cliente para ver la gráfica</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                formatter={(value) => <span style={{ color: '#94A3B8' }}>{value}</span>}
              />
              {activeClients.map((cp, i) => (
                <Line
                  key={cp.client.id}
                  type="monotone"
                  dataKey={cp.client.full_name}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: LINE_COLORS[i % LINE_COLORS.length] }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Client selector + table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-fg-primary">Resumen por cliente</h2>
          <p className="text-xs text-fg-muted mt-0.5">Haz clic para mostrar u ocultar en la gráfica</p>
        </div>
        <div className="divide-y divide-border">
          {clients.map((cp, i) => {
            const isSelected = selected.has(cp.client.id)
            const color = LINE_COLORS[i % LINE_COLORS.length]
            return (
              <button
                key={cp.client.id}
                onClick={() => toggleClient(cp.client.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors ${isSelected ? 'bg-surface hover:bg-surface-2' : 'opacity-40 hover:opacity-60'}`}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                <Avatar name={cp.client.full_name} url={cp.client.avatar_url} size="sm" />
                <span className="flex-1 text-sm font-medium text-fg-primary">{cp.client.full_name}</span>
                <span className="text-xs text-fg-muted">{cp.logs.length} registros</span>
                {cp.latest?.weight_kg && (
                  <span className="text-sm font-mono text-fg-primary">{cp.latest.weight_kg} kg</span>
                )}
                {cp.change !== null && (
                  <span className={`text-sm font-mono font-bold ${cp.change < 0 ? 'text-semantic-success-text' : cp.change > 0 ? 'text-semantic-warning-text' : 'text-fg-secondary'}`}>
                    {cp.change > 0 ? '+' : ''}{cp.change} kg
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
