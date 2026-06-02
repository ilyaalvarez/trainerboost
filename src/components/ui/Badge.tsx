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
  active:     { dot: 'bg-success',         pill: 'bg-[#ECFDF5]  text-[#065F46]  ring-1 ring-inset ring-[#059669]/25', label: 'Activo'      },
  paused:     { dot: 'bg-warning',         pill: 'bg-[#FFFBEB]  text-[#92400E]  ring-1 ring-inset ring-[#D97706]/25', label: 'Pausado'     },
  ended:      { dot: 'bg-danger',          pill: 'bg-[#FEF2F2]  text-[#991B1B]  ring-1 ring-inset ring-[#DC2626]/25', label: 'Finalizado'  },
  pending:    { dot: 'bg-gray-400',        pill: 'bg-gray-100   text-gray-600   ring-1 ring-inset ring-gray-300',      label: 'Pendiente'   },
  confirmed:  { dot: 'bg-brand-primary',   pill: 'bg-[#EEF2FF]  text-[#1B4FD8]  ring-1 ring-inset ring-[#1B4FD8]/25', label: 'Confirmada'  },
  done:       { dot: 'bg-success',         pill: 'bg-[#ECFDF5]  text-[#065F46]  ring-1 ring-inset ring-[#059669]/25', label: 'Realizada'   },
  cancelled:  { dot: 'bg-danger',          pill: 'bg-[#FEF2F2]  text-[#991B1B]  ring-1 ring-inset ring-[#DC2626]/25', label: 'Cancelada'   },
  presencial: { dot: 'bg-brand-primary',   pill: 'bg-[#EEF2FF]  text-[#1B4FD8]  ring-1 ring-inset ring-[#1B4FD8]/25', label: 'Presencial'  },
  online:     { dot: 'bg-[#7C3AED]',       pill: 'bg-[#EDE9FE]  text-[#5B21B6]  ring-1 ring-inset ring-[#7C3AED]/25', label: 'Online'      },
  llamada:    { dot: 'bg-warning',         pill: 'bg-[#FFFBEB]  text-[#92400E]  ring-1 ring-inset ring-[#D97706]/25', label: 'Llamada'     },
  archived:   { dot: 'bg-gray-400',        pill: 'bg-gray-100   text-gray-500   ring-1 ring-inset ring-gray-300',      label: 'Archivada'   },
  inactive:   { dot: 'bg-gray-400',        pill: 'bg-gray-100   text-gray-500   ring-1 ring-inset ring-gray-300',      label: 'Inactivo'    },
  past_due:   { dot: 'bg-warning',         pill: 'bg-[#FFFBEB]  text-[#92400E]  ring-1 ring-inset ring-[#D97706]/25', label: 'Vencido'     },
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
/* ✓ REDISEÑADO: Badges light — fondos pasteles, texto oscuro semántico, ring sutil, radius cuadrado */
