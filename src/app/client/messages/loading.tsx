import { Skeleton } from '@/components/ui/Skeleton'

export default function ClientMessagesLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4">
        {[60, 44, 56, 72, 48, 64, 40].map((w, i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <Skeleton className={`h-11 rounded-2xl`} style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border flex gap-2">
        <Skeleton className="h-11 flex-1 rounded-lg" />
        <Skeleton className="h-11 w-11 rounded-lg" />
      </div>
    </div>
  )
}
