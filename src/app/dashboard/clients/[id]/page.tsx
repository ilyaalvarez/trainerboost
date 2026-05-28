'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  User, Dumbbell, Apple, TrendingUp, CalendarDays, MessageSquare,
  Phone, Plus, ChevronDown, ChevronUp, ArrowLeft, Clock, Send,
  Scale, Percent, Zap,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import StatsCard from '@/components/ui/StatsCard'
import EmptyState from '@/components/ui/EmptyState'
import { cn, formatDate, formatRelative, timeAgo } from '@/lib/utils'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import type {
  Profile, TrainerClient, Routine, RoutineExercise,
  MealPlan, ProgressLog, Appointment, Message,
} from '@/types/database'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'resumen' | 'rutinas' | 'nutricion' | 'progreso' | 'citas' | 'mensajes'

interface ClientData {
  profile: Profile
  relation: TrainerClient
  routines: (Routine & { exercises: RoutineExercise[] })[]
  mealPlans: MealPlan[]
  progressLogs: ProgressLog[]
  appointments: Appointment[]
  messages: Message[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function TabButton({ tab, active, icon, label, onClick }: {
  tab: Tab; active: boolean; icon: React.ReactNode; label: string; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-150',
        active
          ? 'bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20'
          : 'text-slate-400 hover:text-slate-200 hover:bg-[#334155]/40',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  const supabase = createClient()

  const [data, setData] = useState<ClientData | null>(null)
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('resumen')

  // Modal states
  const [showRoutineModal, setShowRoutineModal] = useState(false)
  const [showMealModal, setShowMealModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)

  // Notes auto-save
  const [notes, setNotes] = useState('')
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Expandable routines
  const [expandedRoutines, setExpandedRoutines] = useState<Set<string>>(new Set())

  // Message state
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ── Load data ──────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setTrainerId(user.id)

    const [
      { data: profileData },
      { data: relationData },
      { data: routinesData },
      { data: exercisesData },
      { data: mealPlansData },
      { data: progressData },
      { data: appointmentsData },
      { data: messagesData },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', clientId).single(),
      supabase.from('trainer_clients').select('*')
        .eq('client_id', clientId).eq('trainer_id', user.id).single(),
      supabase.from('routines').select('*')
        .eq('client_id', clientId).eq('trainer_id', user.id).order('created_at', { ascending: false }),
      supabase.from('routine_exercises').select('*')
        .in('routine_id',
          (await supabase.from('routines').select('id').eq('client_id', clientId)).data?.map(r => r.id) ?? []
        ).order('order_index'),
      supabase.from('meal_plans').select('*')
        .eq('client_id', clientId).eq('trainer_id', user.id).order('created_at', { ascending: false }),
      supabase.from('progress_logs').select('*')
        .eq('client_id', clientId).order('logged_at', { ascending: true }),
      supabase.from('appointments').select('*')
        .eq('client_id', clientId).eq('trainer_id', user.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at'),
      supabase.from('messages').select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${clientId}),and(sender_id.eq.${clientId},receiver_id.eq.${user.id})`)
        .order('created_at'),
    ])

    if (!profileData || !relationData) { router.push('/dashboard/clients'); return }

    const routinesWithExercises = (routinesData ?? []).map(r => ({
      ...r,
      exercises: (exercisesData ?? []).filter(e => e.routine_id === r.id),
    }))

    setData({
      profile: profileData as Profile,
      relation: relationData as TrainerClient,
      routines: routinesWithExercises,
      mealPlans: (mealPlansData ?? []) as MealPlan[],
      progressLogs: (progressData ?? []) as ProgressLog[],
      appointments: (appointmentsData ?? []) as Appointment[],
      messages: (messagesData ?? []) as Message[],
    })
    setNotes(relationData.notes ?? '')
    setLoading(false)
  }, [clientId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    if (tab === 'mensajes' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [tab, data?.messages])

  // ── Auto-save notes ────────────────────────────────────────────────────────

  const handleNotesChange = (value: string) => {
    setNotes(value)
    if (notesTimer.current) clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(async () => {
      const { error } = await supabase.from('trainer_clients')
        .update({ notes: value })
        .eq('client_id', clientId)
        .eq('trainer_id', trainerId!)
      if (error) toast.error('Error guardando notas')
      else toast.success('Notas guardadas', { duration: 1500 })
    }, 1200)
  }

  // ── Send message ───────────────────────────────────────────────────────────

  const sendMessage = async () => {
    if (!messageText.trim() || !trainerId) return
    setSendingMessage(true)
    const { error } = await supabase.from('messages').insert({
      sender_id: trainerId,
      receiver_id: clientId,
      content: messageText.trim(),
    })
    if (error) toast.error('Error al enviar mensaje')
    else {
      setMessageText('')
      await loadData()
    }
    setSendingMessage(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[#0EA5E9] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const { profile, relation, routines, mealPlans, progressLogs, appointments, messages } = data
  const weightData = progressLogs.filter(l => l.weight_kg != null)

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.push('/dashboard/clients')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft size={16} /> Volver a clientes
      </button>

      {/* Client header */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar name={profile.full_name} url={profile.avatar_url} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
              <Badge status={relation.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
              {profile.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} /> {profile.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} /> Cliente desde {formatDate(relation.started_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: 'resumen',   icon: <User size={15} />,          label: 'Resumen'   },
          { id: 'rutinas',   icon: <Dumbbell size={15} />,      label: 'Rutinas'   },
          { id: 'nutricion', icon: <Apple size={15} />,         label: 'Nutrición' },
          { id: 'progreso',  icon: <TrendingUp size={15} />,    label: 'Progreso'  },
          { id: 'citas',     icon: <CalendarDays size={15} />,  label: 'Citas'     },
          { id: 'mensajes',  icon: <MessageSquare size={15} />, label: 'Mensajes'  },
        ] as { id: Tab; icon: React.ReactNode; label: string }[]).map(t => (
          <TabButton key={t.id} tab={t.id} active={tab === t.id} icon={t.icon} label={t.label} onClick={() => setTab(t.id)} />
        ))}
      </div>

      {/* ── Tab: Resumen ── */}
      {tab === 'resumen' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard label="Rutinas activas" value={routines.filter(r => r.status === 'active').length} icon={<Dumbbell className="w-5 h-5" />} color="primary" />
            <StatsCard label="Planes de comida" value={mealPlans.filter(m => m.status === 'active').length} icon={<Apple className="w-5 h-5" />} color="accent" />
            <StatsCard label="Registros de progreso" value={progressLogs.length} icon={<TrendingUp className="w-5 h-5" />} color="secondary" />
            <StatsCard label="Próximas citas" value={appointments.length} icon={<CalendarDays className="w-5 h-5" />} color="warning" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic info */}
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-white">Información básica</h2>
              <dl className="space-y-3 text-sm">
                {[
                  { label: 'Nombre',   value: profile.full_name },
                  { label: 'Teléfono', value: profile.phone ?? '—' },
                  { label: 'Estado',   value: <Badge status={relation.status} /> },
                  { label: 'Desde',    value: formatDate(relation.started_at) },
                  { label: 'Bio',      value: profile.bio ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="text-slate-400 shrink-0">{label}</dt>
                    <dd className="text-slate-200 text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Notes */}
            <div className="card p-5 space-y-3">
              <h2 className="font-semibold text-white">Notas del entrenador</h2>
              <textarea
                value={notes}
                onChange={e => handleNotesChange(e.target.value)}
                rows={7}
                placeholder="Escribe notas sobre este cliente..."
                className="input resize-none"
              />
              <p className="text-xs text-slate-500">Guardado automáticamente</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Rutinas ── */}
      {tab === 'rutinas' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Rutinas ({routines.length})</h2>
            <button type="button" className="btn-primary" onClick={() => setShowRoutineModal(true)}>
              <Plus size={16} /> Nueva rutina
            </button>
          </div>
          {routines.length === 0 ? (
            <EmptyState icon={<Dumbbell />} title="Sin rutinas" description="Crea la primera rutina para este cliente." action={{ label: 'Nueva rutina', onClick: () => setShowRoutineModal(true) }} />
          ) : (
            <div className="space-y-3">
              {routines.map(routine => {
                const expanded = expandedRoutines.has(routine.id)
                return (
                  <div key={routine.id} className="card overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#334155]/20 transition-colors"
                      onClick={() => setExpandedRoutines(prev => {
                        const next = new Set(prev)
                        if (next.has(routine.id)) next.delete(routine.id)
                        else next.add(routine.id)
                        return next
                      })}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-white">{routine.title}</span>
                          <Badge status={routine.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                          {routine.frequency && <span>{routine.frequency}</span>}
                          <span>{routine.exercises.length} ejercicios</span>
                          <span>{formatDate(routine.created_at)}</span>
                        </div>
                      </div>
                      {expanded ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                    </button>
                    {expanded && (
                      <div className="border-t border-[#334155] px-4 pb-4 pt-3 space-y-2">
                        {routine.description && (
                          <p className="text-sm text-slate-300 mb-3">{routine.description}</p>
                        )}
                        {routine.exercises.length === 0 ? (
                          <p className="text-sm text-slate-500 text-center py-3">Sin ejercicios añadidos</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-[#334155]">
                                  {['Ejercicio', 'Series', 'Reps', 'Descanso', 'Notas'].map(h => (
                                    <th key={h} className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide pr-4">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#334155]/50">
                                {routine.exercises.map(ex => (
                                  <tr key={ex.id}>
                                    <td className="py-2 pr-4 font-medium text-slate-200">{ex.name}</td>
                                    <td className="py-2 pr-4 text-slate-400">{ex.sets ?? '—'}</td>
                                    <td className="py-2 pr-4 text-slate-400">{ex.reps ?? '—'}</td>
                                    <td className="py-2 pr-4 text-slate-400">{ex.rest_seconds ? `${ex.rest_seconds}s` : '—'}</td>
                                    <td className="py-2 text-slate-400 truncate max-w-[160px]">{ex.notes ?? '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
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

      {/* ── Tab: Nutrición ── */}
      {tab === 'nutricion' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Planes de nutrición ({mealPlans.length})</h2>
            <button type="button" className="btn-primary" onClick={() => setShowMealModal(true)}>
              <Plus size={16} /> Nuevo plan
            </button>
          </div>
          {mealPlans.length === 0 ? (
            <EmptyState icon={<Apple />} title="Sin planes nutricionales" description="Crea el primer plan de nutrición para este cliente." action={{ label: 'Nuevo plan', onClick: () => setShowMealModal(true) }} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mealPlans.map(plan => {
                const totalMacroCalories = (plan.protein_target ?? 0) * 4 + (plan.carbs_target ?? 0) * 4 + (plan.fat_target ?? 0) * 9
                const pPct = totalMacroCalories > 0 ? ((plan.protein_target ?? 0) * 4 / totalMacroCalories) * 100 : 0
                const cPct = totalMacroCalories > 0 ? ((plan.carbs_target ?? 0) * 4 / totalMacroCalories) * 100 : 0
                const fPct = totalMacroCalories > 0 ? ((plan.fat_target ?? 0) * 9 / totalMacroCalories) * 100 : 0
                return (
                  <div key={plan.id} className="card p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-white">{plan.title}</h3>
                        {plan.calories_target && (
                          <p className="text-sm text-slate-400 mt-0.5">{plan.calories_target} kcal / día</p>
                        )}
                      </div>
                      <Badge status={plan.status} />
                    </div>
                    {totalMacroCalories > 0 && (
                      <div className="space-y-2">
                        {[
                          { label: 'Proteína', value: plan.protein_target ?? 0, pct: pPct, color: 'bg-sky-500', unit: 'g' },
                          { label: 'Carbos',   value: plan.carbs_target ?? 0,   pct: cPct, color: 'bg-amber-500', unit: 'g' },
                          { label: 'Grasa',    value: plan.fat_target ?? 0,     pct: fPct, color: 'bg-violet-500', unit: 'g' },
                        ].map(m => (
                          <div key={m.label}>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>{m.label}</span>
                              <span>{m.value}{m.unit} · {Math.round(m.pct)}%</span>
                            </div>
                            <div className="h-1.5 bg-[#334155] rounded-full overflow-hidden">
                              <div className={cn('h-full rounded-full transition-all', m.color)} style={{ width: `${m.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {plan.notes && <p className="text-xs text-slate-400">{plan.notes}</p>}
                    <p className="text-xs text-slate-500">{formatDate(plan.created_at)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Progreso ── */}
      {tab === 'progreso' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Registros de progreso ({progressLogs.length})</h2>
            <button type="button" className="btn-primary" onClick={() => setShowProgressModal(true)}>
              <Plus size={16} /> Registrar medida
            </button>
          </div>

          {progressLogs.length === 0 ? (
            <EmptyState icon={<TrendingUp />} title="Sin registros" description="Empieza a registrar las medidas de progreso del cliente." action={{ label: 'Registrar medida', onClick: () => setShowProgressModal(true) }} />
          ) : (
            <>
              {weightData.length >= 2 && (
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">Evolución del peso (kg)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={weightData.map(l => ({ date: formatDate(l.logged_at, 'dd/MM'), kg: l.weight_kg }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
                        labelStyle={{ color: '#94A3B8', fontSize: 11 }}
                        itemStyle={{ color: '#0EA5E9' }}
                      />
                      <Line type="monotone" dataKey="kg" stroke="#0EA5E9" strokeWidth={2} dot={{ fill: '#0EA5E9', r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#334155]">
                        {['Fecha', 'Peso (kg)', 'Grasa corp.', 'Masa musc.', 'Notas'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]/50">
                      {[...progressLogs].reverse().map(log => (
                        <tr key={log.id} className="hover:bg-[#334155]/20 transition-colors">
                          <td className="px-4 py-3 text-slate-200">{formatDate(log.logged_at)}</td>
                          <td className="px-4 py-3 text-slate-200">{log.weight_kg != null ? `${log.weight_kg} kg` : '—'}</td>
                          <td className="px-4 py-3 text-slate-200">{log.body_fat_pct != null ? `${log.body_fat_pct}%` : '—'}</td>
                          <td className="px-4 py-3 text-slate-200">{log.muscle_mass_kg != null ? `${log.muscle_mass_kg} kg` : '—'}</td>
                          <td className="px-4 py-3 text-slate-400 truncate max-w-[200px]">{log.notes ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tab: Citas ── */}
      {tab === 'citas' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Próximas citas ({appointments.length})</h2>
            <button type="button" className="btn-primary" onClick={() => setShowAppointmentModal(true)}>
              <Plus size={16} /> Agendar cita
            </button>
          </div>
          {appointments.length === 0 ? (
            <EmptyState icon={<CalendarDays />} title="Sin citas programadas" description="Agenda la próxima sesión con este cliente." action={{ label: 'Agendar cita', onClick: () => setShowAppointmentModal(true) }} />
          ) : (
            <div className="space-y-3">
              {appointments.map(apt => (
                <div key={apt.id} className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-[#0EA5E9]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-200">{formatRelative(apt.scheduled_at)}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {apt.duration_minutes} min · {apt.location ?? 'Sin ubicación'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge status={apt.type} />
                    <Badge status={apt.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Mensajes ── */}
      {tab === 'mensajes' && (
        <div className="animate-fade-in">
          <div className="card flex flex-col" style={{ height: '520px' }}>
            <div className="px-5 py-4 border-b border-[#334155] shrink-0">
              <h2 className="font-semibold text-white">Chat con {profile.full_name}</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-slate-500">Todavía no hay mensajes. ¡Escribe el primero!</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.sender_id === trainerId
                  return (
                    <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                      {!isMine && (
                        <Avatar name={profile.full_name} url={profile.avatar_url} size="sm" className="shrink-0 mr-2 mt-0.5" />
                      )}
                      <div className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                        isMine
                          ? 'bg-[#0EA5E9] text-white rounded-br-sm'
                          : 'bg-[#334155] text-slate-200 rounded-bl-sm',
                      )}>
                        <p>{msg.content}</p>
                        <p className={cn('text-[10px] mt-1', isMine ? 'text-sky-200/70 text-right' : 'text-slate-400')}>
                          {timeAgo(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="px-5 py-3 border-t border-[#334155] shrink-0 flex gap-3">
              <input
                type="text"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder={`Mensaje a ${profile.full_name}...`}
                className="input"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!messageText.trim() || sendingMessage}
                className="btn-primary shrink-0 px-4"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <NewRoutineModal
        isOpen={showRoutineModal}
        onClose={() => setShowRoutineModal(false)}
        clientId={clientId}
        trainerId={trainerId!}
        onSuccess={() => { setShowRoutineModal(false); loadData() }}
      />
      <NewMealPlanModal
        isOpen={showMealModal}
        onClose={() => setShowMealModal(false)}
        clientId={clientId}
        trainerId={trainerId!}
        onSuccess={() => { setShowMealModal(false); loadData() }}
      />
      <NewProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        clientId={clientId}
        trainerId={trainerId!}
        onSuccess={() => { setShowProgressModal(false); loadData() }}
      />
      <NewAppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        clientId={clientId}
        trainerId={trainerId!}
        onSuccess={() => { setShowAppointmentModal(false); loadData() }}
      />
    </div>
  )
}

// ─── New Routine Modal ─────────────────────────────────────────────────────────

function NewRoutineModal({ isOpen, onClose, clientId, trainerId, onSuccess }: {
  isOpen: boolean; onClose: () => void; clientId: string; trainerId: string; onSuccess: () => void
}) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', frequency: '',
    starts_at: '', ends_at: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return }
    setSaving(true)
    const { error } = await supabase.from('routines').insert({
      trainer_id: trainerId,
      client_id: clientId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      frequency: form.frequency.trim() || null,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      status: 'active',
    })
    setSaving(false)
    if (error) { toast.error('Error creando rutina: ' + error.message); return }
    toast.success('Rutina creada')
    setForm({ title: '', description: '', frequency: '', starts_at: '', ends_at: '' })
    onSuccess()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva rutina" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Título *</label>
          <input className="input" placeholder="Ej: Fuerza semana 1" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
        </div>
        <div>
          <label className="label">Descripción</label>
          <textarea className="input resize-none" rows={3} placeholder="Descripción opcional" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div>
          <label className="label">Frecuencia</label>
          <input className="input" placeholder="Ej: 3 días/semana" value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Fecha inicio</label>
            <input type="date" className="input" value={form.starts_at} onChange={e => setForm(p => ({ ...p, starts_at: e.target.value }))} />
          </div>
          <div>
            <label className="label">Fecha fin</label>
            <input type="date" className="input" value={form.ends_at} onChange={e => setForm(p => ({ ...p, ends_at: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Guardando...' : 'Crear rutina'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── New Meal Plan Modal ───────────────────────────────────────────────────────

function NewMealPlanModal({ isOpen, onClose, clientId, trainerId, onSuccess }: {
  isOpen: boolean; onClose: () => void; clientId: string; trainerId: string; onSuccess: () => void
}) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', calories_target: '', protein_target: '',
    carbs_target: '', fat_target: '', notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return }
    setSaving(true)
    const { error } = await supabase.from('meal_plans').insert({
      trainer_id: trainerId,
      client_id: clientId,
      title: form.title.trim(),
      calories_target: form.calories_target ? Number(form.calories_target) : null,
      protein_target: form.protein_target ? Number(form.protein_target) : null,
      carbs_target: form.carbs_target ? Number(form.carbs_target) : null,
      fat_target: form.fat_target ? Number(form.fat_target) : null,
      notes: form.notes.trim() || null,
      status: 'active',
    })
    setSaving(false)
    if (error) { toast.error('Error: ' + error.message); return }
    toast.success('Plan creado')
    setForm({ title: '', calories_target: '', protein_target: '', carbs_target: '', fat_target: '', notes: '' })
    onSuccess()
  }

  const p = Number(form.protein_target) || 0
  const c = Number(form.carbs_target) || 0
  const f = Number(form.fat_target) || 0
  const totalCal = p * 4 + c * 4 + f * 9

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo plan nutricional" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Título *</label>
          <input className="input" placeholder="Ej: Plan volumen Q1" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
        </div>
        <div>
          <label className="label">Objetivo calórico (kcal)</label>
          <input type="number" className="input" placeholder="2200" value={form.calories_target} onChange={e => setForm(p => ({ ...p, calories_target: e.target.value }))} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { field: 'protein_target', label: 'Proteína (g)' },
            { field: 'carbs_target', label: 'Carbos (g)' },
            { field: 'fat_target', label: 'Grasa (g)' },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="label">{label}</label>
              <input type="number" className="input" placeholder="0" value={form[field as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))} />
            </div>
          ))}
        </div>
        {totalCal > 0 && (
          <div className="rounded-lg bg-[#334155]/30 p-3 text-xs text-slate-300 space-y-1">
            <p className="font-semibold mb-2">Distribución de macros ({totalCal} kcal calculadas)</p>
            {[
              { label: 'Proteína', kcal: p * 4, color: 'bg-sky-500' },
              { label: 'Carbos',   kcal: c * 4, color: 'bg-amber-500' },
              { label: 'Grasa',    kcal: f * 9, color: 'bg-violet-500' },
            ].map(m => (
              <div key={m.label} className="flex items-center gap-2">
                <span className="w-16 text-slate-400">{m.label}</span>
                <div className="flex-1 h-1.5 bg-[#334155] rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', m.color)} style={{ width: `${Math.round((m.kcal / totalCal) * 100)}%` }} />
                </div>
                <span className="w-8 text-right">{Math.round((m.kcal / totalCal) * 100)}%</span>
              </div>
            ))}
          </div>
        )}
        <div>
          <label className="label">Notas</label>
          <textarea className="input resize-none" rows={2} placeholder="Observaciones..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Guardando...' : 'Crear plan'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── New Progress Modal ────────────────────────────────────────────────────────

function NewProgressModal({ isOpen, onClose, clientId, trainerId, onSuccess }: {
  isOpen: boolean; onClose: () => void; clientId: string; trainerId: string; onSuccess: () => void
}) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    logged_at: new Date().toISOString().split('T')[0],
    weight_kg: '', body_fat_pct: '', muscle_mass_kg: '', notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('progress_logs').insert({
      client_id: clientId,
      trainer_id: trainerId,
      logged_at: form.logged_at,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      body_fat_pct: form.body_fat_pct ? Number(form.body_fat_pct) : null,
      muscle_mass_kg: form.muscle_mass_kg ? Number(form.muscle_mass_kg) : null,
      notes: form.notes.trim() || null,
      photos: [],
    })
    setSaving(false)
    if (error) { toast.error('Error: ' + error.message); return }
    toast.success('Registro guardado')
    setForm({ logged_at: new Date().toISOString().split('T')[0], weight_kg: '', body_fat_pct: '', muscle_mass_kg: '', notes: '' })
    onSuccess()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar medida" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Fecha</label>
          <input type="date" className="input" value={form.logged_at} onChange={e => setForm(p => ({ ...p, logged_at: e.target.value }))} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label flex items-center gap-1"><Scale size={11} /> Peso (kg)</label>
            <input type="number" step="0.1" className="input" placeholder="70.5" value={form.weight_kg} onChange={e => setForm(p => ({ ...p, weight_kg: e.target.value }))} />
          </div>
          <div>
            <label className="label flex items-center gap-1"><Percent size={11} /> Grasa %</label>
            <input type="number" step="0.1" className="input" placeholder="18.0" value={form.body_fat_pct} onChange={e => setForm(p => ({ ...p, body_fat_pct: e.target.value }))} />
          </div>
          <div>
            <label className="label flex items-center gap-1"><Zap size={11} /> Músculo kg</label>
            <input type="number" step="0.1" className="input" placeholder="35.0" value={form.muscle_mass_kg} onChange={e => setForm(p => ({ ...p, muscle_mass_kg: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="label">Notas</label>
          <textarea className="input resize-none" rows={2} placeholder="Observaciones..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── New Appointment Modal ─────────────────────────────────────────────────────

function NewAppointmentModal({ isOpen, onClose, clientId, trainerId, onSuccess }: {
  isOpen: boolean; onClose: () => void; clientId: string; trainerId: string; onSuccess: () => void
}) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    scheduled_at: '',
    duration_minutes: '60',
    type: 'presencial' as 'presencial' | 'online' | 'llamada',
    location: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.scheduled_at) { toast.error('La fecha es obligatoria'); return }
    setSaving(true)
    const { error } = await supabase.from('appointments').insert({
      trainer_id: trainerId,
      client_id: clientId,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      duration_minutes: Number(form.duration_minutes),
      type: form.type,
      status: 'pending',
      location: form.location.trim() || null,
      notes: form.notes.trim() || null,
    })
    setSaving(false)
    if (error) { toast.error('Error: ' + error.message); return }
    toast.success('Cita agendada')
    setForm({ scheduled_at: '', duration_minutes: '60', type: 'presencial', location: '', notes: '' })
    onSuccess()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agendar cita" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Fecha y hora *</label>
          <input type="datetime-local" className="input" value={form.scheduled_at} onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Duración (min)</label>
            <input type="number" className="input" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))} />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as typeof form.type }))}>
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
              <option value="llamada">Llamada</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Ubicación / enlace</label>
          <input className="input" placeholder="Ej: Gym Centro / meet.google.com/..." value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
        </div>
        <div>
          <label className="label">Notas</label>
          <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Guardando...' : 'Agendar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
