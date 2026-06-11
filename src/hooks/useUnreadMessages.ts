'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUnreadMessages(userId: string | null) {
  const [unreadCount, setUnreadCount] = useState(0)
  // Stable reference — createBrowserClient is not a singleton, pin it in a ref
  // to prevent effects from re-running and re-subscribing on every render.
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const fetchCount = useCallback(async () => {
    if (!userId) return
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false)
    setUnreadCount(count ?? 0)
  }, [userId, supabase])

  useEffect(() => {
    fetchCount()

    if (!userId) return

    const channel = supabase
      .channel(`unread-${userId}`)
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
      supabase.removeChannel(channel)
    }
  }, [userId, fetchCount, supabase])

  return unreadCount
}
