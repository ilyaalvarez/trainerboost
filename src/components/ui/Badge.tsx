import { cn } from '@/lib/utils'

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
  label?: string
  className?: string
}

const variantMap: Record<StatusVariant, { dot: string; pill: string; label: string }> = {
  active:     { dot: 'bg-semantic-success',   pill: 'bg-semantic-success/10  text-semantic-success-text border border-semantic-success/20',  label: 'Activo'     },
  paused:     { dot: 'bg-semantic-warning',   pill: 'bg-semantic-warning/10  text-semantic-warning-text border border-semantic-warning/20',  label: 'Pausado'    },
  ended:      { dot: 'bg-semantic-error',     pill: 'bg-semantic-error/10    text-semantic-error-text   border border-semantic-error/20',    label: 'Finalizado' },
  pending:    { dot: 'bg-fg-disabled',        pill: 'bg-surface-3 text-fg-muted    border border-border-strong',                             label: 'Pendiente'  },
  confirmed:  { dot: 'bg-semantic-info',      pill: 'bg-semantic-info/10     text-semantic-info-text    border border-semantic-info/20',     label: 'Confirmada' },
  done:       { dot: 'bg-semantic-success',   pill: 'bg-semantic-success/10  text-semantic-success-text border border-semantic-success/20',  label: 'Realizada'  },
  cancelled:  { dot: 'bg-semantic-error',     pill: 'bg-semantic-error/10    text-semantic-error-text   border border-semantic-error/20',    label: 'Cancelada'  },
  presencial: { dot: 'bg-semantic-info',      pill: 'bg-semantic-info/10     text-semantic-info-text    border border-semantic-info/20',     label: 'Presencial' },
  online:     { dot: 'bg-brand-secondary',    pill: 'bg-brand-secondary/10   text-[#C4B5FD]             border border-brand-secondary/20',   label: 'Online'     },
  llamada:    { dot: 'bg-semantic-warning',   pill: 'bg-semantic-warning/10  text-semantic-warning-text border border-semantic-warning/20',  label: 'Llamada'    },
  archived:   { dot: 'bg-fg-disabled',        pill: 'bg-surface-3 text-fg-disabled border border-border-strong',                             label: 'Archivada'  },
  inactive:   { dot: 'bg-fg-disabled',        pill: 'bg-surface-3 text-fg-disabled border border-border-strong',                             label: 'Inactivo'   },
  past_due:   { dot: 'bg-semantic-warning',   pill: 'bg-semantic-warning/10  text-semantic-warning-text border border-semantic-warning/20',  label: 'Vencido'    },
}

export default function Badge({ status, label, className }: BadgeProps) {
  const { dot, pill, label: defaultLabel } = variantMap[status]
  const displayLabel = label ?? defaultLabel

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2 py-0.5',
        'text-xs font-medium whitespace-nowrap',
        pill,
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {(status === 'active' || status === 'confirmed') && (
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-60', dot)} />
        )}
        <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dot)} />
      </span>
      {displayLabel}
    </span>
  )
}
