'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  CalendarDays, Plus, Loader2, Clock, MapPin, FileText,
  CheckCircle2, XCircle, ChevronDown, List, ChevronLeft, ChevronRight, Video,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, formatRelative } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import type {
  AppointmentWithProfiles, AppointmentStatus, AppointmentType,
  ClientWithProfile,
} from '@/types/database'

// ─── Skeleton ────────────────────────────────────────────────────────────────

function AppointmentSkeleton() {
  return (
    <div className="card px-5 py-4 flex items-center gap-4 flex-wrap">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-36 rounded" />
        <Skeleton className="h-3 w-52 rounded" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

type TabValue = 'upcoming' | 'history'

const DURATION_OPTIONS = [30, 45, 60, 90] as const

const TYPE_OPTIONS: { value: AppointmentType; label: string }[] = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'online',     label: 'Online'     },
  { value: 'llamada',    label: 'Llamada'    },
]

// ─── Form state ───────────────────────────────────────────────────────────────

interface AppointmentForm {
  client_id:        string
  date:             string
  time:             string
  duration_minutes: number
  type:             AppointmentType
  location:         string
  notes:            string
}

const EMPTY_FORM: AppointmentForm = {
  client_id:        '',
  date:             '',
  time:             '',
  duration_minutes: 60,
  type:             'presencial',
  location:         '',
  notes:            '',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const supabase = createClient()

  // Auth
  const [userId, setUserId] = useState<string | null>(null)

  // Data
  const [appointments, setAppointments]   = useState<AppointmentWithProfiles[]>([])
  const [clients, setClients]             = useState<ClientWithProfile[]>([])
  const [dataLoading, setDataLoading]     = useState(true)

  // Tabs
  const [tab, setTab] = useState<TabValue>('upcoming')

  // View: list ↔ calendar
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  // Week navigation (calendar view) — start on Monday of the current week
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
    return new Date(d.setDate(diff))
  })

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const prevWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(d.getDate() - 7); return n })
  const nextWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(d.getDate() + 7); return n })
  const goToday = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    setWeekStart(new Date(d.setDate(diff)))
  }

  // Open an appointment from the calendar → switch to the list view,
  // select the right tab and scroll/highlight the matching card.
  function openAppointment(apt: AppointmentWithProfiles) {
    const isHistory = apt.scheduled_at < new Date().toISOString()
      || apt.status === 'done' || apt.status === 'cancelled'
    setTab(isHistory ? 'history' : 'upcoming')
    setView('list')
    setHighlightedId(apt.id)
    requestAnimationFrame(() => {
      document.getElementById(`apt-${apt.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    window.setTimeout(() => setHighlightedId(null), 2000)
  }

  // Modal
  const [modalOpen, setModalOpen]   = useState(false)
  const [form, setForm]             = useState<AppointmentForm>(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState<string | null>(null)

  // Inline action loading
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setDataLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [{ data: apts }, { data: clientsData }] = await Promise.all([
        supabase
          .from('appointments')
          .select('*, client:client_id(*), trainer:trainer_id(*)')
          .eq('trainer_id', user.id)
          .order('scheduled_at', { ascending: true }),
        supabase
          .from('trainer_clients')
          .select('*, profile:client_id(*)')
          .eq('trainer_id', user.id)
          .eq('status', 'active'),
      ])

      setAppointments((apts ?? []) as AppointmentWithProfiles[])
      setClients((clientsData ?? []) as ClientWithProfile[])
    } catch (err: unknown) {
      toast.error('Error al cargar las citas')
      console.error(err)
    } finally {
      setDataLoading(false)
    }
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Derived lists ────────────────────────────────────────────────────────

  const now = new Date().toISOString()

  const upcoming = appointments
    .filter(a => a.scheduled_at >= now && a.status !== 'cancelled' && a.status !== 'done')
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))

  const history = appointments
    .filter(a => a.scheduled_at < now || a.status === 'done' || a.status === 'cancelled')
    .sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at))

  const displayed = tab === 'upcoming' ? upcoming : history

  // ── Inline status change ─────────────────────────────────────────────────

  async function changeStatus(id: string, status: AppointmentStatus) {
    if (!userId) return
    setActionLoading(id + status)
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .eq('trainer_id', userId)

      if (error) throw error

      setAppointments(prev =>
        prev.map(a => a.id === id ? { ...a, status } : a)
      )

      const labels: Record<AppointmentStatus, string> = {
        confirmed: 'Cita confirmada',
        cancelled: 'Cita cancelada',
        done:      'Cita marcada como realizada',
        pending:   'Cita marcada como pendiente',
      }
      toast.success(labels[status])
    } catch (err: unknown) {
      toast.error('Error al actualizar la cita')
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  // ── Create appointment ───────────────────────────────────────────────────

  function openCreateModal() {
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) })
    setFormError(null)
    setModalOpen(true)
  }

  function setField<K extends keyof AppointmentForm>(key: K, value: AppointmentForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setFormError(null)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    if (!form.client_id) { setFormError('Selecciona un cliente'); return }
    if (!form.date)       { setFormError('Selecciona una fecha');  return }
    if (!form.time)       { setFormError('Selecciona una hora');   return }

    setSaving(true)
    setFormError(null)

    try {
      const scheduledAt = `${form.date}T${form.time}:00`

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          trainer_id:       userId,
          client_id:        form.client_id,
          scheduled_at:     scheduledAt,
          duration_minutes: form.duration_minutes,
          type:             form.type,
          status:           'pending',
          location:         form.location || null,
          notes:            form.notes    || null,
        })
        .select('*, client:client_id(*), trainer:trainer_id(*)')
        .single()

      if (error) throw error

      // Notify the client — fire-and-forget, don't block UX on failure
      const formattedDate = new Date(scheduledAt).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
      supabase.from('notifications').insert({
        user_id: form.client_id,
        type: 'appointment',
        title: 'Nueva cita programada',
        body: `Tienes una cita el ${formattedDate}`,
        link: '/client/appointments',
      }).then(({ error: notifError }) => {
        if (notifError) console.error('Error sending appointment notification:', notifError)
      })

      // Fire push notification to client (fire-and-forget)
      fetch('/api/push/notify-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: form.client_id,
          title: 'Nueva cita programada',
          body: `Tienes una cita el ${formattedDate}`,
          url: '/client/appointments',
        }),
      }).catch(() => {})

      setAppointments(prev => [...prev, data as AppointmentWithProfiles])
      toast.success('Cita creada correctamente')
      setModalOpen(false)
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Error al crear la cita'
      setFormError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg-primary">Citas</h1>
          <p className="text-fg-secondary text-sm mt-0.5">
            {upcoming.length} próxima{upcoming.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nueva cita
        </button>
      </div>

      {/* View toggle */}
      <div className="inline-flex rounded-lg border border-border/60 p-1 bg-surface">
        <button onClick={() => setView('list')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-semantic-info text-white' : 'text-fg-secondary hover:text-fg-primary'}`}>
          <List className="w-4 h-4 inline mr-1.5" />Lista
        </button>
        <button onClick={() => setView('calendar')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-semantic-info text-white' : 'text-fg-secondary hover:text-fg-primary'}`}>
          <CalendarDays className="w-4 h-4 inline mr-1.5" />Calendario
        </button>
      </div>

      {/* ── List view ── */}
      {view === 'list' && (
        <div className="space-y-6">

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#334155]">
        {([
          { value: 'upcoming', label: `Próximas (${upcoming.length})` },
          { value: 'history',  label: `Historial (${history.length})`  },
        ] as { value: TabValue; label: string }[]).map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              tab === t.value
                ? 'text-[#0EA5E9] border-[#0EA5E9]'
                : 'text-fg-secondary border-transparent hover:text-fg-primary'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {dataLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <AppointmentSkeleton key={i} />)}
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={<CalendarDays />}
          title={tab === 'upcoming' ? 'Sin próximas citas' : 'Sin historial'}
          description={
            tab === 'upcoming'
              ? 'Crea una nueva cita con un cliente para que aparezca aquí.'
              : 'El historial de citas pasadas aparecerá aquí.'
          }
          action={tab === 'upcoming' ? { label: 'Nueva cita', onClick: openCreateModal } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {displayed.map(apt => {
            const client  = apt.client
            const isLoadingConfirm = actionLoading === apt.id + 'confirmed'
            const isLoadingCancel  = actionLoading === apt.id + 'cancelled'
            const isLoadingDone    = actionLoading === apt.id + 'done'
            const canConfirm = apt.status === 'pending'
            const canCancel  = apt.status === 'pending' || apt.status === 'confirmed'
            const canMarkDone = apt.status === 'confirmed' && tab === 'upcoming'

            return (
              <div
                key={apt.id}
                id={`apt-${apt.id}`}
                className={cn(
                  'card px-5 py-4 flex items-center gap-4 flex-wrap transition-shadow',
                  highlightedId === apt.id && 'ring-2 ring-semantic-info'
                )}
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar
                    name={client?.full_name ?? '?'}
                    url={client?.avatar_url}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-fg-primary text-sm leading-tight truncate">
                      {client?.full_name ?? '—'}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-fg-secondary">
                        <Clock className="w-3 h-3" />
                        {formatRelative(apt.scheduled_at)}
                      </span>
                      <span className="text-fg-disabled text-xs">·</span>
                      <span className="text-xs text-fg-secondary">{apt.duration_minutes} min</span>
                      {apt.location && (
                        <>
                          <span className="text-fg-disabled text-xs">·</span>
                          {apt.type === 'online' && apt.location.startsWith('http') ? (
                            <a
                              href={apt.location}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-semantic-info-text hover:text-semantic-info-text/80 font-medium transition-colors"
                              onClick={e => e.stopPropagation()}
                            >
                              <Video className="w-3 h-3" />
                              Unirse a videollamada
                            </a>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-fg-secondary">
                              <MapPin className="w-3 h-3" />
                              {apt.location}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {apt.notes && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-fg-muted">
                        <FileText className="w-3 h-3 shrink-0" />
                        <span className="truncate">{apt.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 shrink-0">
                  <Badge status={apt.type} />
                  <Badge status={apt.status} />
                </div>

                {/* Actions */}
                {tab === 'upcoming' && (apt.status === 'pending' || apt.status === 'confirmed') && (
                  <div className="flex items-center gap-2 shrink-0">
                    {canConfirm && (
                      <button
                        onClick={() => changeStatus(apt.id, 'confirmed')}
                        disabled={!!actionLoading}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
                          'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
                          'hover:bg-[#10B981]/20 transition-colors disabled:opacity-50'
                        )}
                      >
                        {isLoadingConfirm
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <CheckCircle2 className="w-3.5 h-3.5" />
                        }
                        Confirmar
                      </button>
                    )}
                    {canMarkDone && (
                      <button
                        onClick={() => changeStatus(apt.id, 'done')}
                        disabled={!!actionLoading}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
                          'bg-semantic-info/10 text-semantic-info-text border border-semantic-info/20',
                          'hover:bg-semantic-info/20 transition-colors disabled:opacity-50'
                        )}
                      >
                        {isLoadingDone
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <CheckCircle2 className="w-3.5 h-3.5" />
                        }
                        Realizada
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => changeStatus(apt.id, 'cancelled')}
                        disabled={!!actionLoading}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
                          'bg-semantic-error/10 text-semantic-error-text border border-semantic-error/20',
                          'hover:bg-semantic-error/20 transition-colors disabled:opacity-50'
                        )}
                      >
                        {isLoadingCancel
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <XCircle className="w-3.5 h-3.5" />
                        }
                        Cancelar
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

        </div>
      )}

      {/* ── Calendar view ── */}
      {view === 'calendar' && (
        <div className="card p-4">
          {dataLoading ? (
            <div className="space-y-2 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {/* Week navigation */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevWeek} className="btn-ghost p-2" aria-label="Semana anterior">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <p className="text-sm font-semibold text-fg-primary">
                    {weekDays[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </p>
                  <button onClick={goToday} className="text-xs text-semantic-info-text hover:text-semantic-info-text/80">Hoy</button>
                </div>
                <button onClick={nextWeek} className="btn-ghost p-2" aria-label="Semana siguiente">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Days grid */}
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                  {weekDays.map(day => {
                    const dayApts = appointments
                      .filter(a => new Date(a.scheduled_at).toDateString() === day.toDateString())
                      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                    const isToday = day.toDateString() === new Date().toDateString()
                    return (
                      <div key={day.toISOString()} className="min-h-[120px]">
                        <div className={cn('text-center mb-2 pb-2 border-b', isToday ? 'border-sky-500' : 'border-border/40')}>
                          <p className="text-xs text-fg-muted uppercase">{day.toLocaleDateString('es-ES', { weekday: 'short' })}</p>
                          <p className={cn('text-lg font-bold', isToday ? 'text-semantic-info-text' : 'text-fg-primary')}>{day.getDate()}</p>
                        </div>
                        <div className="space-y-1.5">
                          {dayApts.length === 0 && (
                            <p className="text-[10px] text-fg-disabled text-center pt-2">Sin citas</p>
                          )}
                          {dayApts.map(apt => {
                            const colorMap: Record<AppointmentType, string> = {
                              presencial: 'rgba(14,165,233,0.15)',
                              online:     'rgba(124,58,237,0.15)',
                              llamada:    'rgba(245,158,11,0.15)',
                            }
                            const borderMap: Record<AppointmentType, string> = {
                              presencial: '#0EA5E9',
                              online:     '#7C3AED',
                              llamada:    '#F59E0B',
                            }
                            return (
                              <button
                                key={apt.id}
                                onClick={() => openAppointment(apt)}
                                className="w-full text-left p-2 rounded-lg text-xs transition-transform hover:scale-[1.02]"
                                style={{ background: colorMap[apt.type], borderLeft: `2px solid ${borderMap[apt.type]}` }}
                              >
                                <p className="font-semibold text-fg-primary truncate">
                                  {new Date(apt.scheduled_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-fg-secondary truncate">{apt.client?.full_name ?? '—'}</p>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Create Appointment Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva cita"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-5">

          {/* Client selector */}
          <div>
            <label className="label">Cliente *</label>
            <div className="relative">
              <select
                value={form.client_id}
                onChange={e => setField('client_id', e.target.value)}
                className="input appearance-none pr-8"
                required
              >
                <option value="">Selecciona un cliente...</option>
                {clients.map(c => (
                  <option key={c.client_id} value={c.client_id}>
                    {c.profile?.full_name ?? c.client_id}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted pointer-events-none" />
            </div>
            {clients.length === 0 && (
              <p className="text-xs text-semantic-warning-text mt-1">No tienes clientes activos.</p>
            )}
          </div>

          {/* Date + time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Fecha *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setField('date', e.target.value)}
                className="input"
                required
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div>
              <label className="label">Hora *</label>
              <input
                type="time"
                value={form.time}
                onChange={e => setField('time', e.target.value)}
                className="input"
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="label">Duración</label>
            <div className="flex gap-2 flex-wrap">
              {DURATION_OPTIONS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setField('duration_minutes', d)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                    form.duration_minutes === d
                      ? 'bg-[#0EA5E9] border-[#0EA5E9] text-white'
                      : 'bg-surface border-border text-fg-secondary hover:border-fg-secondary'
                  )}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="label">Tipo</label>
            <div className="flex gap-2">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setField('type', opt.value)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                    form.type === opt.value
                      ? 'bg-[#0EA5E9] border-[#0EA5E9] text-white'
                      : 'bg-surface border-border text-fg-secondary hover:border-fg-secondary'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="label">Lugar / enlace</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setField('location', e.target.value)}
              placeholder={form.type === 'online' ? 'https://meet.google.com/…' : 'Gimnasio Center, sala 2'}
              className="input"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notas</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              placeholder="Objetivos, recordatorios..."
              className="input resize-none"
            />
          </div>

          {/* Error */}
          {formError && (
            <p className="text-sm text-semantic-error-text bg-semantic-error/10 border border-semantic-error/20 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Guardando…' : 'Crear cita'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
