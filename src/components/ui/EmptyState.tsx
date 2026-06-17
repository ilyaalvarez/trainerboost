import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  /** Pass a ReactNode directly, or an object {label, onClick} for the default button style */
  action?: React.ReactNode | { label: string; onClick: () => void }
  className?: string
}

function isActionObject(action: NonNullable<EmptyStateProps['action']>): action is { label: string; onClick: () => void } {
  return typeof action === 'object' && !Array.isArray(action) && 'label' in (action as object) && 'onClick' in (action as object)
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'rounded-lg border border-dashed border-gray-200 bg-gray-50',
        'px-6 py-14 gap-4',
        className,
      )}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 border border-gray-200"
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
        isActionObject(action)
          ? <button type="button" onClick={action.onClick} className="mt-1 btn-secondary text-sm">{action.label}</button>
          : <div className="mt-1">{action}</div>
      )}
    </div>
  )
}
