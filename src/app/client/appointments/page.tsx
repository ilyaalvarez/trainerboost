'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, CalendarDays, X, Plus } from 'lucide-react'
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
  const [acting,        setActing]        = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [userId,   setUserId]   = useState<string | null>(null)
  const [trainerId, setTrainerId] = useState<string | null>(null)

  const [showRequest, setShowRequest] = useState(false)
  const [reqForm, setReqForm] = useState({ date: '', time: '', type: 'presencial' as 'presencial' | 'online' | 'llamada', notes: '' })
  const [requesting, setRequesting] = useState(false)

  const fetchApts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUserId(user.id)

    const now = new Date().toISOString()
    const [{ data: up }, { data: p }, { data: tc }] = await Promise.all([
      supabase.from('appointments')
        .select('*, trainer:trainer_id(full_name)')
        .eq('client_id', user.id)
        .gte('scheduled_at', now)
        .neq('status', 'cancelled')
        .neq('status', 'done')
        .order('scheduled_at'),
      supabase.from('appointments')
        .select('*, trainer:trainer_id(full_name)')
        .eq('client_id', user.id)
        .or(`scheduled_at.lt.${now},status.eq.cancelled,status.eq.done`)
        .order('scheduled_at', { ascending: false })
        .limit(20),
      supabase.from('trainer_clients')
        .select('trainer_id')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .single(),
    ])

    setUpcoming((up || []) as AptWithTrainer[])
    setPast((p || []) as AptWithTrainer[])
    setTrainerId(tc?.trainer_id ?? null)
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchApts() }, [fetchApts])

  // Realtime: re-fetch when any appointment for this client changes
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`client-appointments:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `client_id=eq.${userId}`,
      }, () => fetchApts())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase, fetchApts])

  async function cancelApt(id: string) {
    if (confirmCancel !== id) { setConfirmCancel(id); return }
    setConfirmCancel(null)
    setActing(id)
    const { error } = await supabase.from('appointments')
      .update({ status: 'cancelled' }).eq('id', id)
    setActing(null)
    if (error) { toast.error(error.message); return }
    toast.success('Cita cancelada')
    fetchApts()
  }

  async function submitRequest() {
    if (!reqForm.date || !reqForm.time) {
      toast.error('Selecciona fecha y hora')
      return
    }
    if (!trainerId || !userId) {
      toast.error('No se encontró tu entrenador asignado')
      return
    }
    setRequesting(true)
    const { error } = await supabase.from('appointments').insert({
      trainer_id: trainerId,
      client_id: userId,
      scheduled_at: `${reqForm.date}T${reqForm.time}:00`,
      duration_minutes: 60,
      type: reqForm.type,
      status: 'pending',
      notes: reqForm.notes || null,
    })
    setRequesting(false)
    if (error) { toast.error(error.message); return }
    toast.success('Solicitud enviada. Tu entrenador la confirmará pronto.')
    try {
      await fetch('/api/push/notify-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: trainerId,
          title: 'Nueva solicitud de cita',
          body: 'Un cliente ha solicitado una nueva cita.',
          url: '/dashboard/appointments',
        }),
      })
    } catch {
      // push notification is best-effort
    }
    setShowRequest(false)
    setReqForm({ date: '', time: '', type: 'presencial', notes: '' })
  }

  const currentList = tab === 'upcoming' ? upcoming : past

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-fg-primary">Mis Citas</h1>
        <p className="text-fg-muted text-sm mt-0.5">Sesiones con tu entrenador</p>
      </div>

      {/* Request new appointment */}
      <button
        onClick={() => setShowRequest(true)}
        className="btn-gradient w-full flex items-center justify-center gap-2 py-3"
      >
        <Plus className="w-4 h-4" /> Solicitar nueva cita
      </button>

      {/* Request form modal */}
      {showRequest && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-fg-primary">Solicitar cita</h2>
              <button
                onClick={() => setShowRequest(false)}
                className="p-1.5 rounded-lg text-fg-muted hover:text-fg-primary hover:bg-surface-2 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-fg-muted mb-1 block">Fecha</label>
                <input
                  type="date"
                  value={reqForm.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setReqForm(f => ({ ...f, date: e.target.value }))}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-fg-muted mb-1 block">Hora</label>
                <input
                  type="time"
                  value={reqForm.time}
                  onChange={e => setReqForm(f => ({ ...f, time: e.target.value }))}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-fg-muted mb-1 block">Tipo de sesión</label>
                <select
                  value={reqForm.type}
                  onChange={e => setReqForm(f => ({ ...f, type: e.target.value as 'presencial' | 'online' | 'llamada' }))}
                  className="input w-full"
                >
                  <option value="presencial">Presencial</option>
                  <option value="online">Online</option>
                  <option value="llamada">Llamada</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-fg-muted mb-1 block">Notas (opcional)</label>
                <textarea
                  value={reqForm.notes}
                  onChange={e => setReqForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Ej. quiero trabajar pierna, tengo molestia en la rodilla…"
                  rows={3}
                  className="input w-full resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowRequest(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={submitRequest}
                disabled={requesting}
                className="btn-gradient flex-1 flex items-center justify-center gap-2"
              >
                {requesting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</>
                  : 'Enviar solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-2 rounded-xl w-fit">
        {(['upcoming', 'past'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-surface text-fg-primary shadow-sm' : 'text-fg-muted hover:text-fg-primary'
            }`}
          >
            {t === 'upcoming' ? `Próximas (${upcoming.length})` : 'Historial'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
        </div>
      ) : currentList.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="w-8 h-8 text-fg-muted" />}
          title={tab === 'upcoming' ? 'Sin citas próximas' : 'Sin historial'}
          description={tab === 'upcoming' ? 'Solicita una nueva cita con tu entrenador.' : 'Las citas pasadas aparecerán aquí.'}
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
                    <div className="font-semibold text-fg-primary">{formatRelative(apt.scheduled_at)}</div>
                    <div className="text-sm text-fg-muted mt-0.5">
                      {apt.trainer?.full_name} · {apt.duration_minutes}min · {apt.type}
                      {apt.location && apt.type === 'online' && apt.location.startsWith('http') ? (
                        <> · <a href={apt.location} target="_blank" rel="noopener noreferrer"
                          className="text-semantic-info-text hover:text-semantic-info-text/80 font-medium transition-colors">
                          Unirse a videollamada
                        </a></>
                      ) : apt.location ? ` · ${apt.location}` : null}
                    </div>
                    {/* Only show client-facing notes (notes field, not trainer_notes) */}
                    {apt.notes && (
                      <div className="text-xs text-fg-muted mt-1 italic">{apt.notes}</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge status={apt.status} />
                  {/* Clients can cancel pending or confirmed upcoming appointments */}
                  {tab === 'upcoming' && (apt.status === 'pending' || apt.status === 'confirmed') && (
                    <div className="flex gap-2 items-center">
                      {confirmCancel === apt.id ? (
                        <>
                          <span className="text-xs font-medium text-semantic-warning-text">¿Seguro?</span>
                          <button
                            onClick={() => cancelApt(apt.id)}
                            disabled={acting === apt.id}
                            className="flex items-center gap-1 text-xs text-semantic-error-text hover:text-semantic-error-text/80 transition-colors font-semibold"
                          >
                            {acting === apt.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sí, cancelar'}
                          </button>
                          <button
                            onClick={() => setConfirmCancel(null)}
                            className="flex items-center gap-1 text-xs text-fg-muted hover:text-fg-primary transition-colors"
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => cancelApt(apt.id)}
                          disabled={acting === apt.id}
                          className="flex items-center gap-1 text-xs text-semantic-error-text hover:text-semantic-error-text/80 transition-colors"
                        >
                          <X className="w-3 h-3" /> Cancelar
                        </button>
                      )}
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
