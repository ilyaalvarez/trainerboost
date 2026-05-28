import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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
}> = {
  primary:   {
    wrapper: 'bg-sky-500/10 ring-sky-500/20',
    icon:    'text-sky-400',
    accent:  'linear-gradient(90deg, #0EA5E9, #7C3AED)',
  },
  accent:    {
    wrapper: 'bg-emerald-500/10 ring-emerald-500/20',
    icon:    'text-emerald-400',
    accent:  'linear-gradient(90deg, #10B981, #0EA5E9)',
  },
  secondary: {
    wrapper: 'bg-violet-500/10 ring-violet-500/20',
    icon:    'text-violet-400',
    accent:  'linear-gradient(90deg, #7C3AED, #EC4899)',
  },
  warning:   {
    wrapper: 'bg-amber-500/10 ring-amber-500/20',
    icon:    'text-amber-400',
    accent:  'linear-gradient(90deg, #F59E0B, #EF4444)',
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
  const { wrapper, icon: iconText, accent } = colorMap[color]

  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 overflow-hidden',
        'rounded-xl border border-[#334155] bg-[#1E293B]',
        'px-5 py-4',
        'shadow-card hover:shadow-card-hover',
        'transition-shadow duration-200',
        className,
      )}
    >
      {/* Colored top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
        style={{ background: accent }}
        aria-hidden="true"
      />

      {/* Label + icon */}
      <div className="flex items-start justify-between gap-2 mt-1">
        <span className="text-[#94A3B8] text-xs font-medium uppercase tracking-wider leading-none pt-0.5">
          {label}
        </span>
        <div
          className={cn(
            'flex items-center justify-center',
            'w-9 h-9 rounded-lg shrink-0 ring-1',
            wrapper,
            iconText,
            '[&>svg]:w-[18px] [&>svg]:h-[18px]',
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <p
        className="font-mono text-[1.75rem] font-bold leading-none tracking-tight text-[#F1F5F9]"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {value}
      </p>

      {/* Change badge */}
      {change && (
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
              'text-[11px] font-semibold ring-1 ring-inset',
              change.positive
                ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
                : 'bg-red-500/10     text-red-400     ring-red-500/20',
            )}
          >
            {change.positive
              ? <TrendingUp size={11} strokeWidth={2.5} aria-hidden="true" />
              : <TrendingDown size={11} strokeWidth={2.5} aria-hidden="true" />}
            {change.value}
          </span>
          <span className="text-[#94A3B8] text-[11px]">vs. mes anterior</span>
        </div>
      )}
    </div>
  )
}
