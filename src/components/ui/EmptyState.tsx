import { cn } from '@/lib/utils'

interface EmptyStateProps {
  /** Icon node — pass a Lucide icon or any SVG element */
  icon: React.ReactNode
  title: string
  description: string
  /** Optional primary call-to-action button */
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * Centered empty-state card used when a list or section has no data yet.
 * Renders inside the caller's container — wrap it in a `min-h` div if you need
 * vertical centering within the full viewport.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'rounded-xl border border-border border-dashed bg-surface/40',
        'px-6 py-14 gap-4',
        className,
      )}
    >
      {/* Icon wrapper — gives it a subtle glow ring */}
      <div
        className={cn(
          'flex items-center justify-center',
          'w-14 h-14 rounded-2xl',
          'bg-surface border border-border',
          'text-[#94A3B8]', // muted colour
          'shadow-card',
        )}
        aria-hidden="true"
      >
        {/* Ensure icon renders at a consistent 24 px size */}
        <span className="[&>svg]:w-6 [&>svg]:h-6">{icon}</span>
      </div>

      {/* Text */}
      <div className="space-y-1 max-w-xs">
        <h3 className="text-[#F1F5F9] font-semibold text-sm leading-snug">{title}</h3>
        <p className="text-[#94A3B8] text-sm leading-relaxed">{description}</p>
      </div>

      {/* Optional CTA */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            'mt-2 inline-flex items-center gap-2',
            'rounded-lg px-4 py-2 text-sm font-medium',
            'bg-[#0EA5E9] text-white',
            'hover:bg-sky-400 active:bg-sky-600',
            'transition-colors duration-150',
            'shadow-glow-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]',
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
