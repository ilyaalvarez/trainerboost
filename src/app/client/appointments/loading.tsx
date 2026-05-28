import { Skeleton } from '@/components/ui/Skeleton'

export default function AppointmentsLoading() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Skeleton className="h-7 w-40" />

      {/* Upcoming */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card p-5 flex items-center gap-4">
            <div className="text-center p-3 rounded-xl bg-surface-elevated space-y-1">
              <Skeleton className="h-3 w-8 mx-auto" />
              <Skeleton className="h-6 w-6 mx-auto" />
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="card overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
