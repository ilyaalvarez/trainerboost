'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types/database'

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  // Stable reference — createBrowserClient is not a singleton, so we pin
  // the instance in a ref to prevent effects from re-running on every render.
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const load = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) setNotifications(data as Notification[])
    setLoading(false)
  }, [userId, supabase])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('notifications:' + userId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  const markRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
  }, [supabase])

  const markAllRead = useCallback(async () => {
    if (!userId) return
    const now = new Date().toISOString()
    await supabase.from('notifications').update({ read_at: now }).eq('user_id', userId).is('read_at', null)
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? now })))
  }, [userId, supabase])

  const unreadCount = notifications.filter(n => !n.read_at).length

  return { notifications, loading, unreadCount, markRead, markAllRead }
}
