import { Skeleton } from '@/components/ui/Skeleton'

export default function ClientSettingsLoading() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Skeleton className="h-8 w-32" />
      {/* Profile section */}
      <div className="card p-6 space-y-5">
        <Skeleton className="h-5 w-40" />
        <div className="border-t border-border/60" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>
      {/* Password section */}
      <div className="card p-6 space-y-5">
        <Skeleton className="h-5 w-40" />
        <div className="border-t border-border/60" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-36 mb-1" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
