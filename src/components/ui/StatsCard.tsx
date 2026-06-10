'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import AnimatedCounter from './AnimatedCounter'

interface StatsCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  change?: {
    value: string
    positive: boolean
  }
  color?: 'primary' | 'accent' | 'secondary' | 'warning'
  className?: string
}

const colorMap: Record<NonNullable<StatsCardProps['color']>, {
  wrapper: string
  icon: string
  accent: string
  value: string
}> = {
  primary:   {
    wrapper: 'bg-lime-500/8 ring-lime-500/15',
    icon:    'text-lime-400',
    accent:  '#8FD43A',
    value:   '#8FD43A',
  },
  accent:    {
    wrapper: 'bg-emerald-500/8 ring-emerald-500/15',
    icon:    'text-emerald-400',
    accent:  '#10B981',
    value:   '#F1F5F9',
  },
  secondary: {
    wrapper: 'bg-violet-500/8 ring-violet-500/15',
    icon:    'text-violet-400',
    accent:  '#7C3AED',
    value:   '#F1F5F9',
  },
  warning:   {
    wrapper: 'bg-amber-500/8 ring-amber-500/15',
    icon:    'text-amber-400',
    accent:  '#F59E0B',
    value:   '#F1F5F9',
  },
}

export default function StatsCard({
  label,
  value,
  icon,
  change,
  color = 'primary',
  className,
}: StatsCardProps) {
  const { wrapper, icon: iconText, accent, value: valueColor } = colorMap[color]

  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 overflow-hidden group cursor-default',
        'rounded-xl border border-border bg-surface',
        'px-5 py-4',
        'shadow-card',
        'transition-all duration-200 ease-smooth-out',
        'hover:-translate-y-1 hover:border-border-bright hover:shadow-card-hover',
        className,
      )}
    >
      {/* Colored top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px rounded-t-xl"
        style={{ background: accent }}
        aria-hidden="true"
      />

      {/* Label + icon */}
      <div className="flex items-start justify-between gap-2 mt-1">
        <span className="text-slate-500 text-xs font-medium leading-none pt-0.5">
          {label}
        </span>
        <div
          className={cn(
            'flex items-center justify-center',
            'w-8 h-8 rounded-lg shrink-0 ring-1',
            'transition-transform duration-200 group-hover:scale-105',
            wrapper,
            iconText,
            '[&>svg]:w-4 [&>svg]:h-4',
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <p
        className="font-display text-kpi font-bold leading-none tracking-tight"
        style={{ color: valueColor }}
      >
        {typeof value === 'number'
          ? <AnimatedCounter value={value} />
          : value}
      </p>

      {/* Change badge */}
      {change && (
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5',
              'text-[11px] font-medium ring-1 ring-inset',
              change.positive
                ? 'bg-emerald-500/8 text-emerald-400 ring-emerald-500/15'
                : 'bg-red-500/8     text-red-400     ring-red-500/15',
            )}
          >
            {change.positive
              ? <TrendingUp size={10} strokeWidth={2.5} aria-hidden="true" />
              : <TrendingDown size={10} strokeWidth={2.5} aria-hidden="true" />}
            {change.value}
          </span>
          <span className="text-slate-600 text-[11px]">vs. mes anterior</span>
        </div>
      )}
    </div>
  )
}
