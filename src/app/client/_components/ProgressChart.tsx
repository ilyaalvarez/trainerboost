'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ProgressLog } from '@/types/database'

interface Props {
  logs: ProgressLog[]
}

export default function ProgressChart({ logs }: Props) {
  const data = logs
    .filter(l => l.weight_kg !== null)
    .map(l => ({
      date: format(new Date(l.logged_at), 'dd MMM', { locale: es }),
      peso: Number(l.weight_kg),
      grasa: l.body_fat_pct ? Number(l.body_fat_pct) : undefined,
    }))

  return (
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
          formatter={(val, name) => [
            `${val} ${name === 'peso' ? 'kg' : '%'}`,
            name === 'peso' ? 'Peso' : 'Grasa corporal',
          ]}
        />
        <Line
          type="monotone"
          dataKey="peso"
          stroke="#0EA5E9"
          strokeWidth={2}
          dot={{ fill: '#0EA5E9', r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="grasa"
          stroke="#10B981"
          strokeWidth={2}
          dot={{ fill: '#10B981', r: 3 }}
          activeDot={{ r: 5 }}
          strokeDasharray="4 4"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
