'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUnreadMessages(userId: string | null) {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabaseRef = useRef(createClient())
  const instanceId = useRef(Math.random().toString(36).slice(2, 9))

  const fetchCount = useCallback(async () => {
    if (!userId) return
    const { count } = await supabaseRef.current
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false)
    setUnreadCount(count ?? 0)
  }, [userId])

  useEffect(() => {
    fetchCount()

    if (!userId) return

    const client = supabaseRef.current
    const channel = client
      .channel(`unread:${userId}:${instanceId.current}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        () => fetchCount(),
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        () => fetchCount(),
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [userId, fetchCount])

  return unreadCount
}
