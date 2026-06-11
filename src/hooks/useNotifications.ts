'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types/database'

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  // createBrowserClient is a singleton in the browser — pin a unique instance ID
  // so multiple mounted copies of this hook use distinct channel names and avoid
  // the "cannot add callbacks after subscribe()" error from Supabase's registry.
  const supabaseRef = useRef(createClient())
  const instanceId = useRef(Math.random().toString(36).slice(2, 9))

  const load = useCallback(async () => {
    if (!userId) return
    const { data } = await supabaseRef.current
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) setNotifications(data as Notification[])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!userId) return
    const client = supabaseRef.current
    const channel = client
      .channel(`notifications:${userId}:${instanceId.current}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
      })
      .subscribe()
    return () => { client.removeChannel(channel) }
  }, [userId])

  const markRead = useCallback(async (id: string) => {
    await supabaseRef.current.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
  }, [])

  const markAllRead = useCallback(async () => {
    if (!userId) return
    const now = new Date().toISOString()
    await supabaseRef.current.from('notifications').update({ read_at: now }).eq('user_id', userId).is('read_at', null)
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? now })))
  }, [userId])

  const unreadCount = notifications.filter(n => !n.read_at).length

  return { notifications, loading, unreadCount, markRead, markAllRead }
}
