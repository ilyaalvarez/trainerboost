'use client'
import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { usePushSubscription } from '@/hooks/usePushSubscription'

interface Props { userId: string }

export function PushPrompt({ userId }: Props) {
  const { permission, subscribed, loading, requestAndSubscribe } = usePushSubscription(userId)
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDismissed(!!localStorage.getItem('push-prompt-dismissed'))
  }, [])

  const swSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window

  if (!mounted || !swSupported || dismissed || subscribed || permission === 'granted' || permission === 'denied') return null

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-40 card p-4 shadow-2xl border-sky-500/20 animate-fade-in-up"
         style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)' }}>
      <button onClick={() => { setDismissed(true); localStorage.setItem('push-prompt-dismissed', '1') }}
        className="absolute top-3 right-3 text-slate-500 hover:text-slate-400">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Activa las notificaciones</p>
          <p className="text-xs text-slate-400 mt-0.5 mb-3">Recibe avisos de citas, rutinas y mensajes en tiempo real</p>
          <button onClick={requestAndSubscribe} disabled={loading} className="btn-primary text-xs py-1.5 px-4 w-full">
            {loading ? 'Activando...' : 'Activar notificaciones'}
          </button>
        </div>
      </div>
    </div>
  )
}
