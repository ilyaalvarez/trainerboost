'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Subscription } from '@/types/database'

interface UseProfileReturn {
  profile: Profile | null
  subscription: Subscription | null
  loading: boolean
  isTrainer: boolean
  isClient: boolean
  refresh: () => Promise<void>
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setProfile(null); return }

      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
      ])

      setProfile(p)
      setSubscription(s)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchProfile()
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile()
    })
    return () => authSub.unsubscribe()
  }, [fetchProfile, supabase])

  return {
    profile,
    subscription,
    loading,
    isTrainer: profile?.role === 'trainer',
    isClient: profile?.role === 'client',
    refresh: fetchProfile,
  }
}
