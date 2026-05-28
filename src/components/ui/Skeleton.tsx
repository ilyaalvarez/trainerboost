import { cn } from '@/lib/utils'

// ─── Base shimmer block ────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string
}

/**
 * Single shimmer block. Accepts any Tailwind size / shape classes via className.
 * Example: <Skeleton className="h-4 w-48 rounded-md" />
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        // Base surface colour matching dark theme
        'bg-surface-2 rounded-md overflow-hidden relative',
        // Shimmer animation layer
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
        'before:translate-x-[-100%] before:animate-shimmer',
        className,
      )}
      aria-hidden="true"
    />
  )
}

// ─── Card placeholder ──────────────────────────────────────────────────────────

/**
 * Simulates a typical content card: avatar + header line, two body lines,
 * and a footer line.
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-surface rounded-xl border border-border p-4 space-y-4',
        className,
      )}
      aria-hidden="true"
    >
      {/* Header row: avatar + two title lines */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/5 rounded" />
          <Skeleton className="h-3   w-1/3 rounded" />
        </div>
      </div>

      {/* Body rows */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-4/5 rounded" />
      </div>

      {/* Footer / action row */}
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-1/4 rounded" />
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
    </div>
  )
}

// ─── Table placeholder ─────────────────────────────────────────────────────────

interface SkeletonTableProps {
  rows?: number
  cols?: number
  className?: string
}

/**
 * Renders a full table skeleton with a header row and `rows` body rows,
 * each having `cols` columns.
 */
export function SkeletonTable({ rows = 5, cols = 4, className }: SkeletonTableProps) {
  // Column widths cycle to make the skeleton look more natural
  const colWidths = ['w-1/4', 'w-1/3', 'w-1/5', 'w-1/4', 'w-1/6', 'w-1/3']

  return (
    <div
      className={cn('w-full rounded-xl border border-border overflow-hidden bg-surface', className)}
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-surface-2">
        {Array.from({ length: cols }).map((_, ci) => (
          <Skeleton
            key={`th-${ci}`}
            className={cn('h-3 rounded', colWidths[ci % colWidths.length])}
          />
        ))}
      </div>

      {/* Body rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, ri) => (
          <div key={`tr-${ri}`} className="flex items-center gap-4 px-4 py-3.5">
            {Array.from({ length: cols }).map((_, ci) => (
              <Skeleton
                key={`td-${ri}-${ci}`}
                className={cn(
                  'h-3.5 rounded',
                  ci === 0
                    ? 'w-8 rounded-full shrink-0' // first col as avatar-like circle
                    : colWidths[(ci + 1) % colWidths.length],
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tailwind shimmer keyframe (added via globals.css or inline style fallback) ─
// In tailwind.config.ts, add under theme.extend.keyframes:
//   shimmer: { '100%': { transform: 'translateX(100%)' } }
// and under theme.extend.animation:
//   shimmer: 'shimmer 1.6s infinite'
//
// If you haven't yet, you can also drop this one-liner into globals.css:
//   @keyframes shimmer { 100% { transform: translateX(100%); } }
//   .animate-shimmer { animation: shimmer 1.6s infinite; }
