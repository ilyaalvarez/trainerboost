import { cn } from '@/lib/utils'

interface SkeletonProps { className?: string }

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-gray-100 rounded-md overflow-hidden relative',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        'before:translate-x-[-100%] before:animate-shimmer',
        className,
      )}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-xl border border-gray-200 p-4 space-y-4 bg-white shadow-sm', className)}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/5 rounded" />
          <Skeleton className="h-3 w-1/3 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-4/5 rounded" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-1/4 rounded" />
        <Skeleton className="h-7 w-20 rounded-md" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  const colWidths = ['w-1/4', 'w-1/3', 'w-1/5', 'w-1/4', 'w-1/6', 'w-1/3']

  return (
    <div
      className={cn('w-full rounded-xl border border-gray-200 overflow-hidden bg-white', className)}
      aria-hidden="true"
    >
      <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-gray-50">
        {Array.from({ length: cols }).map((_, ci) => (
          <Skeleton key={`th-${ci}`} className={cn('h-3 rounded', colWidths[ci % colWidths.length])} />
        ))}
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, ri) => (
          <div key={`tr-${ri}`} className="flex items-center gap-4 px-4 py-3.5">
            {Array.from({ length: cols }).map((_, ci) => (
              <Skeleton
                key={`td-${ri}-${ci}`}
                className={cn('h-3.5 rounded', ci === 0 ? 'w-8 rounded-full shrink-0' : colWidths[(ci + 1) % colWidths.length])}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
