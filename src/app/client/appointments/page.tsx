'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, CalendarDays, CheckCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Appointment } from '@/types/database'
import { formatRelative } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'

interface AptWithTrainer extends Appointment {
  trainer: { full_name: string }
}

export default function ClientAppointmentsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [upcoming, setUpcoming] = useState<AptWithTrainer[]>([])
  const [past,     setPast]     = useState<AptWithTrainer[]>([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<'upcoming' | 'past'>('upcoming')
  const [acting,   setActing]   = useState<string | null>(null)

  const fetchApts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const now = new Date().toISOString()
    const [{ data: up }, { data: p }] = await Promise.all([
      supabase.from('appointments')
        .select('*, trainer:trainer_id(full_name)')
        .eq('client_id', user.id)
        .gte('scheduled_at', now)
        .neq('status', 'cancelled')
        .order('scheduled_at'),
      supabase.from('appointments')
        .select('*, trainer:trainer_id(full_name)')
        .eq('client_id', user.id)
        .or(`scheduled_at.lt.${now},status.eq.cancelled,status.eq.done`)
        .order('scheduled_at', { ascending: false })
        .limit(20),
    ])

    setUpcoming((up || []) as AptWithTrainer[])
    setPast((p || []) as AptWithTrainer[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchApts() }, [fetchApts])

  async function confirmApt(id: string) {
    setActing(id)
    const { error } = await supabase.from('appointments')
      .update({ status: 'confirmed' }).eq('id', id)
    setActing(null)
    if (error) { toast.error(error.message); return }
    toast.success('Cita confirmada ✓')
    fetchApts()
  }

  async function cancelApt(id: string) {
    if (!confirm('¿Cancelar esta cita?')) return
    setActing(id)
    const { error } = await supabase.from('appointments')
      .update({ status: 'cancelled' }).eq('id', id)
    setActing(null)
    if (error) { toast.error(error.message); return }
    toast.success('Cita cancelada')
    fetchApts()
  }

  const currentList = tab === 'upcoming' ? upcoming : past

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Mis Citas</h1>
        <p className="text-slate-400 text-sm mt-0.5">Sesiones con tu entrenador</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-2 rounded-xl w-fit">
        {(['upcoming', 'past'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-surface text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t === 'upcoming' ? `Próximas (${upcoming.length})` : 'Historial'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
        </div>
      ) : currentList.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="w-8 h-8 text-slate-500" />}
          title={tab === 'upcoming' ? 'Sin citas próximas' : 'Sin historial'}
          description={tab === 'upcoming' ? 'Tu entrenador agendará la próxima sesión.' : 'Las citas pasadas aparecerán aquí.'}
        />
      ) : (
        <div className="space-y-3">
          {currentList.map(apt => (
            <div key={apt.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{formatRelative(apt.scheduled_at)}</div>
                    <div className="text-sm text-slate-400 mt-0.5">
                      {apt.trainer?.full_name} · {apt.duration_minutes}min · {apt.type}
                      {apt.location && ` · ${apt.location}`}
                    </div>
                    {apt.notes && (
                      <div className="text-xs text-slate-500 mt-1 italic">{apt.notes}</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge status={apt.status} />
                  {tab === 'upcoming' && apt.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmApt(apt.id)}
                        disabled={acting === apt.id}
                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        {acting === apt.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <CheckCircle className="w-3 h-3" />}
                        Confirmar
                      </button>
                      <button
                        onClick={() => cancelApt(apt.id)}
                        disabled={acting === apt.id}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-3 h-3" /> Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
