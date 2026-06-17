'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Algo ha salido mal</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            Ha ocurrido un error inesperado. El equipo ha sido notificado automáticamente.
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-[#8FD43A] text-black text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  )
}
