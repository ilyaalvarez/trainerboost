import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

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
        'rounded-xl border border-dashed border-border',
        'px-6 py-14 gap-4',
        className,
      )}
      style={{ background: 'rgba(30,41,59,0.4)' }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center w-14 h-14 rounded-2xl shadow-card"
        style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(124,58,237,0.08))', border: '1px solid rgba(14,165,233,0.15)' }}
        aria-hidden="true"
      >
        <span className="[&>svg]:w-6 [&>svg]:h-6 text-slate-400">{icon}</span>
      </div>

      {/* Text */}
      <div className="space-y-1.5 max-w-xs">
        <h3 className="text-white font-semibold text-sm leading-snug">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>

      {/* CTA */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 btn-primary text-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
