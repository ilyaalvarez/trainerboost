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
  valueColor: string
}> = {
  primary:   {
    wrapper:    'bg-brand-primary/8 ring-brand-primary/15',
    icon:       'text-brand-primary',
    accent:     '#8FD43A',
    valueColor: '#8FD43A',
  },
  accent:    {
    wrapper:    'bg-brand-accent/8 ring-brand-accent/15',
    icon:       'text-brand-accent',
    accent:     '#10B981',
    valueColor: '#EAEAEA',
  },
  secondary: {
    wrapper:    'bg-brand-secondary/8 ring-brand-secondary/15',
    icon:       'text-[#C4B5FD]',
    accent:     '#7C3AED',
    valueColor: '#EAEAEA',
  },
  warning:   {
    wrapper:    'bg-semantic-warning/8 ring-semantic-warning/15',
    icon:       'text-semantic-warning-text',
    accent:     '#F59E0B',
    valueColor: '#EAEAEA',
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
  const { wrapper, icon: iconText, accent, valueColor } = colorMap[color]

  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 overflow-hidden group cursor-default',
        'rounded-xl border border-border bg-surface',
        'px-5 py-4',
        'shadow-card',
        'transition-all duration-200 ease-smooth-out',
        'hover:-translate-y-1 hover:border-border-strong hover:shadow-card-hover',
        className,
      )}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px rounded-t-xl"
        style={{ background: accent }}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-2 mt-1">
        <span className="text-fg-muted text-xs font-medium leading-none pt-0.5">
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

      <p
        className="font-display text-kpi font-bold leading-none tracking-tight"
        style={{ color: valueColor }}
      >
        {typeof value === 'number'
          ? <AnimatedCounter value={value} />
          : value}
      </p>

      {change && (
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5',
              'text-[11px] font-medium ring-1 ring-inset',
              change.positive
                ? 'bg-semantic-success/8 text-semantic-success-text ring-semantic-success/15'
                : 'bg-semantic-error/8   text-semantic-error-text   ring-semantic-error/15',
            )}
          >
            {change.positive
              ? <TrendingUp size={10} strokeWidth={2.5} aria-hidden="true" />
              : <TrendingDown size={10} strokeWidth={2.5} aria-hidden="true" />}
            {change.value}
          </span>
          <span className="text-fg-disabled text-[11px]">vs. mes anterior</span>
        </div>
      )}
    </div>
  )
}
