'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Algo ha ido mal</h2>
      <p className="text-slate-400 text-sm mb-6 max-w-sm">
        {error.message || 'Error inesperado. Por favor, recarga la página.'}
      </p>
      <button onClick={reset} className="btn-primary">
        <RefreshCw className="w-4 h-4" /> Reintentar
      </button>
    </div>
  )
}
