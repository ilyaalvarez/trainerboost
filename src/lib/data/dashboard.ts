import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const getUnreadMessageCount = cache(async (userId: string): Promise<number> => {
  const supabase = await createClient()
  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .is('read_at', null)
  return count ?? 0
})

export const getPendingAppointmentsCount = cache(async (userId: string): Promise<number> => {
  const supabase = await createClient()
  const { count } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('trainer_id', userId)
    .eq('status', 'pending')
    .gte('scheduled_at', new Date().toISOString())
  return count ?? 0
})
