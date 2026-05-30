'use client'
import { useEffect, useState, useCallback } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from(Array.from(rawData).map(c => c.charCodeAt(0)))
}

export function usePushSubscription(userId: string | null) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof Notification !== 'undefined') setPermission(Notification.permission)
  }, [])

  const subscribe = useCallback(async () => {
    if (!userId || !VAPID_PUBLIC_KEY) return
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as string,
      })
      const json = sub.toJSON()
      const keys = json.keys as { p256dh: string; auth: string }
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, p256dh: keys.p256dh, auth: keys.auth }),
      })
      setSubscribed(true)
      setPermission('granted')
    } catch {
      // User denied or browser unsupported
    }
    setLoading(false)
  }, [userId])

  const requestAndSubscribe = useCallback(async () => {
    if (typeof Notification === 'undefined') return
    const perm = await Notification.requestPermission()
    setPermission(perm)
    if (perm === 'granted') await subscribe()
  }, [subscribe])

  return { permission, subscribed, loading, requestAndSubscribe }
}
