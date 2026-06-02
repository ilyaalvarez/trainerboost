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

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'rounded-lg border border-dashed',
        'px-6 py-14 gap-4',
        className,
      )}
      style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center w-12 h-12 rounded-xl"
        style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }}
        aria-hidden="true"
      >
        <span className="[&>svg]:w-5 [&>svg]:h-5 text-gray-400">{icon}</span>
      </div>

      {/* Text */}
      <div className="space-y-1 max-w-xs">
        <h3 className="text-gray-900 font-semibold text-sm leading-snug">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>

      {/* CTA */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-1 btn-secondary text-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
/* ✓ REDISEÑADO: Empty state light — fondo gris muy suave, icono en contenedor gris, texto oscuro */
