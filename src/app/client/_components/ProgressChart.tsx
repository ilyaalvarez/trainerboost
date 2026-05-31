'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { format, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ProgressLog } from '@/types/database'

type Metric = 'weight_kg' | 'body_fat_pct' | 'muscle_mass_kg'
type Range = 30 | 90 | 180 | 0

const METRICS: { key: Metric; label: string; unit: string; color: string }[] = [
  { key: 'weight_kg',      label: 'Peso',     unit: 'kg', color: '#0EA5E9' },
  { key: 'body_fat_pct',   label: 'Grasa %',  unit: '%',  color: '#EF4444' },
  { key: 'muscle_mass_kg', label: 'Músculo',  unit: 'kg', color: '#10B981' },
]

const RANGES: { value: Range; label: string }[] = [
  { value: 30,  label: '30d' },
  { value: 90,  label: '3m'  },
  { value: 180, label: '6m'  },
  { value: 0,   label: 'Todo' },
]

interface Props {
  logs: ProgressLog[]
}

export default function ProgressChart({ logs }: Props) {
  const [metric, setMetric] = useState<Metric>('weight_kg')
  const [range, setRange] = useState<Range>(90)
  const cfg = METRICS.find(m => m.key === metric)!

  const cutoff = range > 0 ? subDays(new Date(), range) : null

  const data = logs
    .filter(l => l[metric] != null && (!cutoff || new Date(l.logged_at) >= cutoff))
    .map(l => ({
      date:  format(new Date(l.logged_at), 'dd MMM', { locale: es }),
      value: Number(l[metric]),
    }))

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex gap-1.5">
          {METRICS.map(m => (
            <button key={m.key} onClick={() => setMetric(m.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${metric === m.key ? 'text-white' : 'text-slate-500 hover:text-slate-300 bg-surface-2'}`}
              style={metric === m.key ? { background: m.color } : undefined}>{m.label}</button>
          ))}
        </div>
        <div className="flex gap-1 border border-border/60 rounded-lg p-0.5 bg-surface-2">
          {RANGES.map(r => (
            <button key={r.value} onClick={() => setRange(r.value)}
              className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-all ${range === r.value ? 'bg-surface text-white' : 'text-slate-500 hover:text-slate-300'}`}>{r.label}</button>
          ))}
        </div>
      </div>
    )
  }

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length

  return (
    <div className="space-y-3">
      {/* Controls row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1.5">
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                metric === m.key
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-300 bg-surface-2'
              }`}
              style={metric === m.key ? { background: m.color, boxShadow: `0 0 10px ${m.color}40` } : undefined}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 border border-border/60 rounded-lg p-0.5 bg-surface-2">
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-all duration-150 ${
                range === r.value
                  ? 'bg-surface text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#F1F5F9',
              fontSize: 12,
            }}
            formatter={(val) => [`${val} ${cfg.unit}`, cfg.label]}
          />
          <ReferenceLine
            y={avg}
            stroke={cfg.color}
            strokeDasharray="4 4"
            strokeOpacity={0.35}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={cfg.color}
            strokeWidth={2}
            dot={{ fill: cfg.color, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Mini stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Mínimo', value: min },
          { label: 'Media',  value: Math.round(avg * 10) / 10 },
          { label: 'Máximo', value: max },
        ].map(s => (
          <div key={s.label} className="bg-surface-2 rounded-lg py-2">
            <div className="font-mono text-sm font-bold text-white">{s.value} {cfg.unit}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
