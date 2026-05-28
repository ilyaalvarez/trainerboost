'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { TrendingDown, TrendingUp, Users, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Profile, ProgressLog } from '@/types/database'

// Palette for multi-client lines
const LINE_COLORS = [
  '#0EA5E9', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
]

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
      <p className="text-slate-400 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-semibold text-white">{p.value} kg</span>
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
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [metric, setMetric] = useState<'weight_kg' | 'body_fat_pct'>('weight_kg')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch all clients for this trainer
    const { data: relations, error } = await supabase
      .from('trainer_clients')
      .select('client_id, profiles!client_id(id, full_name, avatar_url)')
      .eq('trainer_id', user.id)
      .eq('status', 'active')

    if (error) { toast.error('Error al cargar clientes'); setLoading(false); return }

    const clientIds = (relations ?? []).map(r => r.client_id)
    if (clientIds.length === 0) { setLoading(false); return }

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
    setLoading(false)
  }, [supabase, metric])

  useEffect(() => { load() }, [load])

  function toggleClient(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
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

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Activity className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Sin datos de progreso</h2>
        <p className="text-slate-400 text-sm max-w-xs">
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
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setMetric('weight_kg')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${metric === 'weight_kg' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Peso (kg)
          </button>
          <button
            onClick={() => setMetric('body_fat_pct')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${metric === 'body_fat_pct' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'}`}
          >
            % Grasa
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">Clientes con datos</p>
          <p className="text-2xl font-bold font-mono text-white">{clients.length}</p>
          <div className="flex items-center gap-1 mt-1">
            <Users className="w-3 h-3 text-slate-500" />
            <span className="text-xs text-slate-500">con registros</span>
          </div>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">Bajaron peso</p>
          <p className="text-2xl font-bold font-mono text-green-400">{withLoss.length}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingDown className="w-3 h-3 text-green-500" />
            <span className="text-xs text-slate-500">clientes</span>
          </div>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">Subieron peso</p>
          <p className="text-2xl font-bold font-mono text-yellow-400">{withGain.length}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-slate-500">clientes</span>
          </div>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 mb-1">Cambio medio</p>
          <p className={`text-2xl font-bold font-mono ${avgChange < 0 ? 'text-green-400' : avgChange > 0 ? 'text-yellow-400' : 'text-white'}`}>
            {isNaN(avgChange) ? '—' : `${avgChange > 0 ? '+' : ''}${avgChange.toFixed(1)} kg`}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Activity className="w-3 h-3 text-slate-500" />
            <span className="text-xs text-slate-500">entre todos</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-white mb-4">
          {metric === 'weight_kg' ? 'Evolución del peso' : 'Evolución % grasa corporal'}
        </h2>
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
      </div>

      {/* Client selector + table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-white">Resumen por cliente</h2>
          <p className="text-xs text-slate-500 mt-0.5">Haz clic para mostrar u ocultar en la gráfica</p>
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
                <span className="flex-1 text-sm font-medium text-white">{cp.client.full_name}</span>
                <span className="text-xs text-slate-500">{cp.logs.length} registros</span>
                {cp.latest?.weight_kg && (
                  <span className="text-sm font-mono text-white">{cp.latest.weight_kg} kg</span>
                )}
                {cp.change !== null && (
                  <span className={`text-sm font-mono font-bold ${cp.change < 0 ? 'text-green-400' : cp.change > 0 ? 'text-yellow-400' : 'text-slate-400'}`}>
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
