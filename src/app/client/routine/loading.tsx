import { Skeleton } from '@/components/ui/Skeleton'

export default function RoutineLoading() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Progress bar */}
      <div className="card p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-2.5 w-full rounded-full" />
      </div>

      {/* Exercise groups */}
      {Array.from({ length: 3 }).map((_, g) => (
        <div key={g} className="card overflow-hidden">
          <div className="p-4 border-b border-border">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
