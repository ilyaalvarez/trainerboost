export default function CheckinsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-surface-2 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="h-4 w-24 bg-surface-2 rounded" />
            <div className="h-8 w-16 bg-surface-2 rounded" />
          </div>
        ))}
      </div>
      <div className="card p-5 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-2 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-surface-2 rounded" />
              <div className="h-3 w-48 bg-surface-2 rounded" />
            </div>
            <div className="h-6 w-16 bg-surface-2 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
