import { cn } from '@/lib/utils'

// ─── Status types ──────────────────────────────────────────────────────────────

/** Session / client status values */
export type StatusVariant =
  | 'active'
  | 'paused'
  | 'ended'
  | 'pending'
  | 'confirmed'
  | 'done'
  | 'cancelled'
  | 'archived'
  | 'inactive'
  | 'past_due'
  | 'presencial'
  | 'online'
  | 'llamada'

interface BadgeProps {
  status: StatusVariant
  /** Override the display label; defaults to capitalised status name */
  label?: string
  className?: string
}

// ─── Colour map ────────────────────────────────────────────────────────────────

const variantMap: Record<StatusVariant, { dot: string; pill: string; label: string }> = {
  // Client / plan states
  active:     { dot: 'bg-emerald-400', pill: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30', label: 'Activo'      },
  paused:     { dot: 'bg-amber-400',   pill: 'bg-amber-500/15   text-amber-400   ring-amber-500/30',   label: 'Pausado'     },
  ended:      { dot: 'bg-red-400',     pill: 'bg-red-500/15     text-red-400     ring-red-500/30',     label: 'Finalizado'  },
  pending:    { dot: 'bg-slate-400',   pill: 'bg-slate-500/15   text-slate-400   ring-slate-500/30',   label: 'Pendiente'   },
  // Session states
  confirmed:  { dot: 'bg-sky-400',     pill: 'bg-sky-500/15     text-sky-400     ring-sky-500/30',     label: 'Confirmada'  },
  done:       { dot: 'bg-emerald-400', pill: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30', label: 'Realizada'   },
  cancelled:  { dot: 'bg-red-400',     pill: 'bg-red-500/15     text-red-400     ring-red-500/30',     label: 'Cancelada'   },
  // Session modality
  presencial: { dot: 'bg-sky-400',     pill: 'bg-sky-500/15     text-sky-400     ring-sky-500/30',     label: 'Presencial'  },
  online:     { dot: 'bg-violet-400',  pill: 'bg-violet-500/15  text-violet-400  ring-violet-500/30',  label: 'Online'      },
  llamada:    { dot: 'bg-amber-400',   pill: 'bg-amber-500/15   text-amber-400   ring-amber-500/30',   label: 'Llamada'     },
  archived:   { dot: 'bg-slate-400',  pill: 'bg-slate-500/15   text-slate-400   ring-slate-500/30',   label: 'Archivada'   },
  inactive:   { dot: 'bg-slate-400',  pill: 'bg-slate-500/15   text-slate-400   ring-slate-500/30',   label: 'Inactivo'    },
  past_due:   { dot: 'bg-amber-400',  pill: 'bg-amber-500/15   text-amber-400   ring-amber-500/30',   label: 'Vencido'     },
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Badge({ status, label, className }: BadgeProps) {
  const { dot, pill, label: defaultLabel } = variantMap[status]
  const displayLabel = label ?? defaultLabel

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        pill,
        className,
      )}
    >
      {/* Pulsing dot for "live" states, static for terminal ones */}
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {(status === 'active' || status === 'confirmed') && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-60',
              dot,
            )}
          />
        )}
        <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dot)} />
      </span>
      {displayLabel}
    </span>
  )
}
