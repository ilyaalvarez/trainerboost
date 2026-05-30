'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Image from 'next/image'
import {
  User, Dumbbell, Apple, TrendingUp, CalendarDays, MessageSquare,
  Phone, Plus, ChevronDown, ArrowLeft, Clock, Send,
  Scale, Percent, Zap, CheckCircle2, AlertTriangle, Bell,
  Activity, MapPin, Video, FileDown, X, ChevronLeft, ChevronRight,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { cn, formatDate, formatRelative, timeAgo } from '@/lib/utils'
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area,
} from 'recharts'
import type {
  Profile, TrainerClient, Routine, RoutineExercise,
  MealPlan, ProgressLog, Appointment, Message, DailyCheckin,
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
  checkins: DailyCheckin[]
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ClientDetailPage() {
  const params   = useParams()
  const router   = useRouter()
  const clientId = params.id as string
  const supabase = createClient()

  const [data,      setData]      = useState<ClientData | null>(null)
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState<Tab>('resumen')

  // Modal states
  const [showRoutineModal,     setShowRoutineModal]     = useState(false)
  const [showMealModal,        setShowMealModal]        = useState(false)
  const [showProgressModal,    setShowProgressModal]    = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)

  // Notes auto-save
  const [notes,      setNotes]      = useState('')
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Expandable routines
  const [expandedRoutines, setExpandedRoutines] = useState<Set<string>>(new Set())

  // Message state
  const [messageText,    setMessageText]    = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // PDF report export
  const [exporting, setExporting] = useState(false)

  // Photo lightbox
  const [lightbox, setLightbox] = useState<{ urls: string[]; idx: number } | null>(null)

  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox(lb => lb ? { ...lb, idx: (lb.idx + 1) % lb.urls.length } : null)
      if (e.key === 'ArrowLeft') setLightbox(lb => lb ? { ...lb, idx: (lb.idx - 1 + lb.urls.length) % lb.urls.length } : null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox])

  // ── Load data ──────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setTrainerId(user.id)

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
    const [
      { data: profileData },
      { data: relationData },
      { data: routinesData },
      { data: exercisesData },
      { data: mealPlansData },
      { data: progressData },
      { data: appointmentsData },
      { data: messagesData },
      { data: checkinsData },
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
        .eq('client_id', clientId).eq('trainer_id', user.id).order('logged_at', { ascending: true }),
      supabase.from('appointments').select('*')
        .eq('client_id', clientId).eq('trainer_id', user.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at'),
      supabase.from('messages').select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${clientId}),and(sender_id.eq.${clientId},receiver_id.eq.${user.id})`)
        .order('created_at'),
      supabase.from('daily_checkins').select('*')
        .eq('client_id', clientId)
        .gte('checkin_date', sevenDaysAgo)
        .order('checkin_date', { ascending: false }),
    ])

    if (!profileData || !relationData) { router.push('/dashboard/clients'); return }

    const routinesWithExercises = (routinesData ?? []).map(r => ({
      ...r,
      exercises: (exercisesData ?? []).filter(e => e.routine_id === r.id),
    }))

    setData({
      profile:      profileData as Profile,
      relation:     relationData as TrainerClient,
      routines:     routinesWithExercises,
      mealPlans:    (mealPlansData ?? []) as MealPlan[],
      progressLogs: (progressData ?? []) as ProgressLog[],
      appointments: (appointmentsData ?? []) as Appointment[],
      messages:     (messagesData ?? []) as Message[],
      checkins:     (checkinsData ?? []) as DailyCheckin[],
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

  const sendMessage = async () => {
    if (!messageText.trim() || !trainerId) return
    setSendingMessage(true)
    const { error } = await supabase.from('messages').insert({
      sender_id:   trainerId,
      receiver_id: clientId,
      content:     messageText.trim(),
    })
    if (error) toast.error('Error al enviar mensaje')
    else {
      setMessageText('')
      await loadData()
    }
    setSendingMessage(false)
  }

  const handleExportPdf = async () => {
    if (!data) return
    setExporting(true)
    try {
      const { exportProgressReportPdf } = await import('@/lib/exportPdf')
      const activeMeal = data.mealPlans.find(m => m.status === 'active') ?? null
      await exportProgressReportPdf(
        data.profile,
        data.relation,
        data.progressLogs,
        data.routines,
        activeMeal,
      )
      toast.success('Informe PDF generado')
    } catch {
      toast.error('Error al generar el informe')
    } finally {
      setExporting(false)
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-brand-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-brand-primary animate-spin" />
        </div>
        <p className="text-sm text-slate-500 animate-pulse">Cargando perfil del cliente...</p>
      </div>
    )
  }

  if (!data) return null

  const { profile, relation, routines, mealPlans, progressLogs, appointments, messages, checkins } = data
  const weightData = progressLogs.filter(l => l.weight_kg != null)

  // ── Smart alerts ───────────────────────────────────────────────────────────
  const activeRoutine  = routines.find(r => r.status === 'active')
  const activeMealPlan = mealPlans.find(m => m.status === 'active')
  const lastLog        = progressLogs.length > 0 ? progressLogs[progressLogs.length - 1] : null
  const daysSinceLastLog = lastLog
    ? Math.floor((Date.now() - new Date(lastLog.logged_at).getTime()) / 86400000)
    : null
  const nextAppt       = appointments[0] ?? null
  const hoursToNextAppt = nextAppt
    ? Math.floor((new Date(nextAppt.scheduled_at).getTime() - Date.now()) / 3600000)
    : null

  interface SmartAlert { type: 'warn' | 'info' | 'good'; msg: string }
  const smartAlerts: SmartAlert[] = [
    ...(!activeRoutine ? [{ type: 'warn' as const, msg: 'Sin rutina activa asignada' }] : []),
    ...(!activeMealPlan ? [{ type: 'info' as const, msg: 'Sin plan nutricional activo' }] : []),
    ...(daysSinceLastLog !== null && daysSinceLastLog > 30
      ? [{ type: 'warn' as const, msg: `Sin registrar progreso hace ${daysSinceLastLog} días` }]
      : []),
    ...(appointments.length === 0 ? [{ type: 'info' as const, msg: 'No hay citas próximas' }] : []),
    ...(hoursToNextAppt !== null && hoursToNextAppt >= 0 && hoursToNextAppt <= 24
      ? [{ type: 'good' as const, msg: `Cita hoy en ${hoursToNextAppt < 1 ? 'menos de 1h' : hoursToNextAppt + 'h'}: ${formatRelative(nextAppt!.scheduled_at)}` }]
      : []),
  ]

  const TABS: { id: Tab; icon: React.ReactNode; label: string; count?: number }[] = [
    { id: 'resumen',   icon: <User size={14} />,          label: 'Resumen'    },
    { id: 'rutinas',   icon: <Dumbbell size={14} />,      label: 'Rutinas',   count: routines.length },
    { id: 'nutricion', icon: <Apple size={14} />,         label: 'Nutrición', count: mealPlans.length },
    { id: 'progreso',  icon: <TrendingUp size={14} />,    label: 'Progreso',  count: progressLogs.length },
    { id: 'citas',     icon: <CalendarDays size={14} />,  label: 'Citas',     count: appointments.length },
    { id: 'mensajes',  icon: <MessageSquare size={14} />, label: 'Mensajes',  count: messages.length },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-5">

      {/* Back */}
      <button
        type="button"
        onClick={() => router.push('/dashboard/clients')}
        className="group inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-200 transition-colors duration-150"
      >
        <ArrowLeft size={15} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
        Volver a clientes
      </button>

      {/* ═══════════════════════════════════════════════════════════
          HERO CARD
      ═══════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl overflow-hidden border border-border/60 shadow-card-elevated"
           style={{ background: '#1A2744' }}>

        {/* Cover strip */}
        <div className="h-32 relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.25) 0%, rgba(124,58,237,0.2) 50%, rgba(16,185,129,0.12) 100%)' }}>
          {/* Grid texture */}
          <div className="absolute inset-0"
               style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          {/* Floating orbs */}
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full blur-2xl opacity-30"
               style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }} />
          <div className="absolute left-1/3 -top-4 w-28 h-28 rounded-full blur-xl opacity-25"
               style={{ background: 'radial-gradient(circle, #0EA5E9 0%, transparent 70%)' }} />
          <div className="absolute right-1/4 bottom-0 w-20 h-20 rounded-full blur-xl opacity-20"
               style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }} />
        </div>

        <div className="px-6 pb-5 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

            {/* Avatar + Name */}
            <div className="flex items-end gap-4">
              <div className="ring-[3px] ring-[#1A2744] rounded-full shrink-0"
                   style={{ filter: 'drop-shadow(0 4px 16px rgba(14,165,233,0.3))' }}>
                <Avatar name={profile.full_name} url={profile.avatar_url} size="xl" />
              </div>
              <div className="pb-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-white tracking-tight">{profile.full_name}</h1>
                  <Badge status={relation.status} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  {profile.phone && (
                    <span className="flex items-center gap-1"><Phone size={11} /> {profile.phone}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <CalendarDays size={11} /> Desde {formatDate(relation.started_at)}
                  </span>
                </div>
                {(relation.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {(relation.tags ?? []).map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border bg-sky-500/10 text-sky-300 border-sky-500/25">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pb-1 flex-wrap">
              <button type="button" onClick={() => setTab('mensajes')}
                      className="btn-secondary text-xs py-1.5 px-3 gap-1.5">
                <MessageSquare size={13} /> Mensaje
              </button>
              <button type="button" onClick={() => setShowAppointmentModal(true)}
                      className="btn-secondary text-xs py-1.5 px-3 gap-1.5">
                <CalendarDays size={13} /> Cita
              </button>
              <button type="button" onClick={handleExportPdf} disabled={exporting}
                      className="btn-secondary text-xs py-1.5 px-3 gap-1.5 disabled:opacity-60">
                <FileDown size={13} /> {exporting ? 'Generando...' : 'Informe PDF'}
              </button>
              <button type="button" onClick={() => setShowRoutineModal(true)}
                      className="btn-gradient text-xs py-1.5 px-3 gap-1.5">
                <Plus size={13} /> Rutina
              </button>
            </div>
          </div>

          {/* ── KPI strip ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Rutinas activas',  value: routines.filter(r => r.status === 'active').length,   icon: <Dumbbell size={15} />,   color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)',   border: 'rgba(14,165,233,0.2)' },
              { label: 'Planes nutric.',   value: mealPlans.filter(m => m.status === 'active').length,  icon: <Apple size={15} />,       color: '#10B981', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.2)' },
              { label: 'Registros peso',   value: progressLogs.length,                                  icon: <Activity size={15} />,    color: '#7C3AED', bg: 'rgba(124,58,237,0.1)',  border: 'rgba(124,58,237,0.2)' },
              { label: 'Próximas citas',   value: appointments.length,                                  icon: <CalendarDays size={15} />, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
            ].map(stat => (
              <div key={stat.label}
                   className="rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                   style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
                <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ background: `${stat.color}20`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-white leading-none">{stat.value}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Last measurement badges ───────────────────────────── */}
          {progressLogs.length > 0 && (() => {
            const latest = [...progressLogs].sort((a, b) =>
              new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
            )[0]
            return (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Última medición</span>
                {latest.weight_kg != null && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-sky-400"
                        style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
                    <Scale size={10} /> {latest.weight_kg} kg
                  </span>
                )}
                {latest.body_fat_pct != null && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-400"
                        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <Percent size={10} /> {latest.body_fat_pct}%
                  </span>
                )}
                {latest.muscle_mass_kg != null && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-400"
                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <Zap size={10} /> {latest.muscle_mass_kg} kg músculo
                  </span>
                )}
                <span className="text-[11px] text-slate-500">{timeAgo(latest.logged_at)}</span>
              </div>
            )
          })()}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SMART ALERTS
      ═══════════════════════════════════════════════════════════ */}
      {smartAlerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {smartAlerts.map((alert, i) => {
            const cfg = alert.type === 'warn'
              ? { icon: <AlertTriangle size={12} />, color: 'text-amber-400',  bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  bar: '#F59E0B' }
              : alert.type === 'good'
              ? { icon: <CheckCircle2 size={12} />, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)',  bar: '#10B981' }
              : { icon: <Bell size={12} />,         color: 'text-sky-400',     bg: 'rgba(14,165,233,0.08)',  border: 'rgba(14,165,233,0.2)',  bar: '#0EA5E9' }
            return (
              <div key={i}
                   className="flex items-center gap-2 pl-0 pr-3 py-1.5 rounded-lg overflow-hidden text-xs font-medium transition-all duration-200 hover:-translate-y-0.5"
                   style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <div className="w-1 self-stretch rounded-full mr-1" style={{ background: cfg.bar }} />
                <span className={cfg.color}>{cfg.icon}</span>
                <span className={cfg.color}>{alert.msg}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          QUICK ACTIONS
      ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: 'Nueva rutina',      sub: 'Asignar ejercicios',  icon: <Dumbbell size={22} />,    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)', glow: 'rgba(14,165,233,0.2)',  onClick: () => setShowRoutineModal(true)     },
          { label: 'Plan nutricional',  sub: 'Crear o editar dieta', icon: <Apple size={22} />,        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', glow: 'rgba(16,185,129,0.2)',  onClick: () => setShowMealModal(true)        },
          { label: 'Agendar cita',      sub: 'Programar sesión',    icon: <CalendarDays size={22} />, gradient: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)', glow: 'rgba(124,58,237,0.2)', onClick: () => setShowAppointmentModal(true) },
          { label: 'Registrar progreso',sub: 'Nueva medición',      icon: <TrendingUp size={22} />,  gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)', glow: 'rgba(245,158,11,0.2)', onClick: () => setShowProgressModal(true)    },
        ] as { label: string; sub: string; icon: React.ReactNode; gradient: string; glow: string; onClick: () => void }[]).map(action => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="group relative card border overflow-hidden text-center p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
            style={{ borderColor: 'rgba(51,65,85,0.8)' }}
          >
            {/* Hover background reveal */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                 style={{ background: `radial-gradient(circle at 50% 0%, ${action.glow} 0%, transparent 70%)` }} />
            <div
              className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white relative transition-transform duration-200 group-hover:scale-110"
              style={{ background: action.gradient, boxShadow: `0 6px 20px -4px ${action.glow}` }}
            >
              {action.icon}
            </div>
            <div className="font-semibold text-sm text-white leading-tight relative">{action.label}</div>
            <div className="text-[11px] text-slate-400 mt-0.5 relative">{action.sub}</div>
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB NAVIGATION
      ═══════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-20 -mx-1 px-1">
        <div className="flex gap-0.5 border-b overflow-x-auto scrollbar-none"
             style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)', borderColor: 'rgba(51,65,85,0.5)' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0',
                tab === t.id ? 'text-sky-300' : 'text-slate-400 hover:text-slate-200',
              )}
            >
              <span className={cn('transition-transform duration-200', tab === t.id ? 'scale-110' : '')}>
                {t.icon}
              </span>
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none transition-all duration-200',
                  tab === t.id
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'bg-surface-2 text-slate-500 border border-border/50',
                )}>{t.count}</span>
              )}
              {/* Active underline */}
              {tab === t.id && (
                <span
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full animate-scale-in"
                  style={{ background: 'linear-gradient(90deg, #0EA5E9, #7C3AED)', boxShadow: '0 0 8px rgba(14,165,233,0.5)' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB: RESUMEN
      ═══════════════════════════════════════════════════════════ */}
      {tab === 'resumen' && (
        <div className="space-y-5 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left: Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #0EA5E9, #7C3AED)' }} />
                <h2 className="font-semibold text-white text-sm">Información básica</h2>
              </div>
              <dl className="space-y-0">
                {[
                  { label: 'Nombre',        value: profile.full_name },
                  { label: 'Teléfono',      value: profile.phone ?? '—' },
                  { label: 'Estado',        value: <Badge status={relation.status} /> },
                  { label: 'Cliente desde', value: formatDate(relation.started_at) },
                  ...(profile.bio ? [{ label: 'Bio', value: profile.bio }] : []),
                  ...(activeRoutine ? [{ label: 'Rutina activa', value: (
                    <span className="flex items-center gap-1 text-sky-400 text-xs font-medium">
                      <Dumbbell size={11} /> {activeRoutine.title}
                    </span>
                  )}] : []),
                  ...(activeMealPlan ? [{ label: 'Plan activo', value: (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                      <Apple size={11} /> {activeMealPlan.title}
                    </span>
                  )}] : []),
                ].map(({ label, value }, idx, arr) => (
                  <div key={label}
                       className={cn(
                         'flex items-start justify-between gap-4 py-2.5 text-sm',
                         idx < arr.length - 1 ? 'border-b border-border/40' : '',
                       )}>
                    <dt className="text-slate-500 shrink-0 text-xs uppercase tracking-wide font-medium">{label}</dt>
                    <dd className="text-slate-200 text-right text-xs">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Next appointment widget */}
            {nextAppt && (
              <div className="rounded-xl p-4 border"
                   style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(14,165,233,0.04) 100%)', borderColor: 'rgba(124,58,237,0.25)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={13} className="text-violet-400" />
                  <span className="text-xs font-semibold text-violet-300">Próxima cita</span>
                </div>
                <div className="font-semibold text-white text-sm">{formatRelative(nextAppt.scheduled_at)}</div>
                <div className="text-xs text-slate-400 mt-0.5">{nextAppt.duration_minutes} min · {nextAppt.type}</div>
                {nextAppt.location && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <MapPin size={10} /> {nextAppt.location}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Notes */}
          <div className="lg:col-span-3 card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #10B981, #0EA5E9)' }} />
                <h2 className="font-semibold text-white text-sm">Notas del entrenador</h2>
              </div>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <CheckCircle2 size={10} className="text-emerald-500" /> Guardado automático
              </span>
            </div>
            <textarea
              value={notes}
              onChange={e => handleNotesChange(e.target.value)}
              rows={10}
              placeholder="Escribe notas, observaciones, objetivos o recordatorios sobre este cliente..."
              className="input resize-none flex-1 text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Check-ins de la última semana */}
        {checkins.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #F59E0B, #EF4444)' }} />
              <h2 className="font-semibold text-white text-sm">Check-ins (últimos 7 días)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50">
                    {['Fecha', 'Energía', 'Ánimo', 'Sueño'].map(h => (
                      <th key={h} className="text-left pb-2 text-slate-500 font-medium uppercase tracking-wide pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {checkins.map(c => {
                    const energyEmoji = c.energy ? ['😴','😕','😐','😊','🔥'][c.energy - 1] : '—'
                    const moodEmoji   = c.mood   ? ['😴','😕','😐','😊','🔥'][c.mood - 1]   : '—'
                    return (
                      <tr key={c.id} className="hover:bg-surface-2/40 transition-colors">
                        <td className="py-2 pr-4 text-slate-300">{new Date(c.checkin_date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                        <td className="py-2 pr-4">
                          <span className="mr-1">{energyEmoji}</span>
                          {c.energy != null && <span className="font-mono text-white">{c.energy}/5</span>}
                        </td>
                        <td className="py-2 pr-4">
                          <span className="mr-1">{moodEmoji}</span>
                          {c.mood != null && <span className="font-mono text-white">{c.mood}/5</span>}
                        </td>
                        <td className="py-2 pr-4 font-mono text-slate-300">
                          {c.sleep_hours != null ? `${c.sleep_hours}h` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: RUTINAS
      ═══════════════════════════════════════════════════════════ */}
      {tab === 'rutinas' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Rutinas de entrenamiento</h2>
              <p className="text-xs text-slate-500 mt-0.5">{routines.length} {routines.length === 1 ? 'rutina asignada' : 'rutinas asignadas'}</p>
            </div>
            <button type="button" className="btn-primary" onClick={() => setShowRoutineModal(true)}>
              <Plus size={15} /> Nueva rutina
            </button>
          </div>

          {routines.length === 0 ? (
            <EmptyState icon={<Dumbbell />} title="Sin rutinas" description="Crea la primera rutina para este cliente."
                        action={{ label: 'Nueva rutina', onClick: () => setShowRoutineModal(true) }} />
          ) : (
            <div className="space-y-3">
              {routines.map(routine => {
                const expanded = expandedRoutines.has(routine.id)
                const isActive = routine.status === 'active'
                return (
                  <div key={routine.id}
                       className={cn(
                         'card overflow-hidden transition-all duration-200',
                         isActive ? 'border-sky-500/20' : 'hover:border-border-bright',
                       )}
                       style={isActive ? { background: 'linear-gradient(135deg, rgba(14,165,233,0.04) 0%, #1E293B 60%)' } : undefined}>

                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="h-0.5 w-full"
                           style={{ background: 'linear-gradient(90deg, #0EA5E9, #7C3AED)' }} />
                    )}

                    <button
                      type="button"
                      className="w-full flex items-center gap-3 p-4 text-left transition-colors group hover:bg-surface-2/30"
                      onClick={() => setExpandedRoutines(prev => {
                        const next = new Set(prev)
                        if (next.has(routine.id)) next.delete(routine.id); else next.add(routine.id)
                        return next
                      })}
                    >
                      <div className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105',
                        isActive ? 'text-sky-400' : 'text-slate-500',
                      )}
                           style={{ background: isActive ? 'rgba(14,165,233,0.12)' : 'rgba(51,65,85,0.4)' }}>
                        <Dumbbell size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-white text-sm">{routine.title}</span>
                          <Badge status={routine.status} />
                          {routine.exercises.length > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400">
                              {routine.exercises.length} ejercicios
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-slate-500">
                          {routine.frequency && <span>{routine.frequency}</span>}
                          <span>{formatDate(routine.created_at)}</span>
                        </div>
                      </div>
                      <ChevronDown
                        size={15}
                        className={cn('text-slate-500 shrink-0 transition-transform duration-200', expanded ? 'rotate-180' : '')}
                      />
                    </button>

                    {expanded && (
                      <div className="border-t border-border/50 px-4 pb-4 pt-3 space-y-3 animate-fade-in">
                        {routine.description && (
                          <p className="text-sm text-slate-300 bg-surface-2/30 rounded-lg p-3">{routine.description}</p>
                        )}
                        {routine.exercises.length === 0 ? (
                          <p className="text-sm text-slate-500 text-center py-4">Sin ejercicios añadidos aún</p>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-border/40">
                            <table className="w-full text-sm">
                              <thead>
                                <tr style={{ background: 'rgba(51,65,85,0.3)' }}>
                                  {['#', 'Ejercicio', 'Series', 'Reps', 'Descanso', 'Notas'].map(h => (
                                    <th key={h} className="text-left px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {routine.exercises.map((ex, idx) => (
                                  <tr key={ex.id}
                                      className="border-t border-border/30 transition-colors hover:bg-surface-2/30"
                                      style={idx % 2 === 0 ? { background: 'rgba(30,41,59,0.3)' } : undefined}>
                                    <td className="px-3 py-2.5 text-xs text-slate-600 font-mono">{idx + 1}</td>
                                    <td className="px-3 py-2.5 font-semibold text-slate-200 text-sm">{ex.name}</td>
                                    <td className="px-3 py-2.5 text-slate-400 text-xs font-mono">{ex.sets ?? '—'}</td>
                                    <td className="px-3 py-2.5 text-slate-400 text-xs font-mono">{ex.reps ?? '—'}</td>
                                    <td className="px-3 py-2.5 text-slate-400 text-xs">{ex.rest_seconds ? `${ex.rest_seconds}s` : '—'}</td>
                                    <td className="px-3 py-2.5 text-slate-500 text-xs truncate max-w-[140px]">{ex.notes ?? '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const { exportRoutinePdf } = await import('@/lib/exportPdf')
                                await exportRoutinePdf({ ...routine, exercises: routine.exercises }, profile.full_name)
                              } catch { toast.error('Error al generar PDF') }
                            }}
                            className="btn-ghost text-xs py-1 px-2 flex items-center gap-1"
                          >
                            <FileDown size={13} /> Exportar PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: NUTRICIÓN
      ═══════════════════════════════════════════════════════════ */}
      {tab === 'nutricion' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Planes de nutrición</h2>
              <p className="text-xs text-slate-500 mt-0.5">{mealPlans.length} {mealPlans.length === 1 ? 'plan asignado' : 'planes asignados'}</p>
            </div>
            <button type="button" className="btn-primary" onClick={() => setShowMealModal(true)}>
              <Plus size={15} /> Nuevo plan
            </button>
          </div>

          {mealPlans.length === 0 ? (
            <EmptyState icon={<Apple />} title="Sin planes nutricionales"
                        description="Crea el primer plan de nutrición para este cliente."
                        action={{ label: 'Nuevo plan', onClick: () => setShowMealModal(true) }} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mealPlans.map(plan => {
                const totalMacroCalories = (plan.protein_target ?? 0) * 4 + (plan.carbs_target ?? 0) * 4 + (plan.fat_target ?? 0) * 9
                const pPct = totalMacroCalories > 0 ? ((plan.protein_target ?? 0) * 4 / totalMacroCalories) * 100 : 0
                const cPct = totalMacroCalories > 0 ? ((plan.carbs_target ?? 0) * 4 / totalMacroCalories) * 100 : 0
                const fPct = totalMacroCalories > 0 ? ((plan.fat_target ?? 0) * 9 / totalMacroCalories) * 100 : 0
                const isActive = plan.status === 'active'
                return (
                  <div key={plan.id} className="card p-5 space-y-4"
                       style={isActive ? { borderColor: 'rgba(16,185,129,0.25)', background: 'linear-gradient(135deg, rgba(16,185,129,0.04) 0%, #1E293B 60%)' } : undefined}>
                    {isActive && <div className="h-0.5 -mx-5 -mt-5 mb-0 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #10B981, #0EA5E9)' }} />}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-white">{plan.title}</h3>
                        {plan.calories_target && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <Zap size={11} className="text-amber-400" />
                            <span className="text-sm font-bold text-amber-400">{plan.calories_target}</span>
                            <span className="text-xs text-slate-500">kcal / día</span>
                          </div>
                        )}
                      </div>
                      <Badge status={plan.status} />
                    </div>

                    {totalMacroCalories > 0 && (
                      <div className="space-y-3">
                        {[
                          { label: 'Proteína', value: plan.protein_target ?? 0, pct: pPct, color: '#0EA5E9', bg: 'rgba(14,165,233,0.15)' },
                          { label: 'Carbos',   value: plan.carbs_target ?? 0,   pct: cPct, color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
                          { label: 'Grasa',    value: plan.fat_target ?? 0,     pct: fPct, color: '#7C3AED', bg: 'rgba(124,58,237,0.15)' },
                        ].map(m => (
                          <div key={m.label}>
                            <div className="flex justify-between items-center text-xs mb-1.5">
                              <span className="text-slate-400 font-medium">{m.label}</span>
                              <span className="font-semibold" style={{ color: m.color }}>{m.value}g · {Math.round(m.pct)}%</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(51,65,85,0.5)' }}>
                              <div className="h-full rounded-full transition-all duration-700"
                                   style={{ width: `${m.pct}%`, background: `linear-gradient(90deg, ${m.color}, ${m.color}cc)`, boxShadow: `0 0 8px ${m.color}40` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {plan.notes && (
                      <p className="text-xs text-slate-400 bg-surface-2/40 rounded-lg p-2.5">{plan.notes}</p>
                    )}
                    <p className="text-[11px] text-slate-600">{formatDate(plan.created_at)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: PROGRESO
      ═══════════════════════════════════════════════════════════ */}
      {tab === 'progreso' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Registros de progreso</h2>
              <p className="text-xs text-slate-500 mt-0.5">{progressLogs.length} {progressLogs.length === 1 ? 'registro guardado' : 'registros guardados'}</p>
            </div>
            <button type="button" className="btn-primary" onClick={() => setShowProgressModal(true)}>
              <Plus size={15} /> Registrar medida
            </button>
          </div>

          {progressLogs.length === 0 ? (
            <EmptyState icon={<TrendingUp />} title="Sin registros"
                        description="Empieza a registrar las medidas de progreso del cliente."
                        action={{ label: 'Registrar medida', onClick: () => setShowProgressModal(true) }} />
          ) : (
            <>
              {/* Stats trio */}
              {weightData.length >= 2 && (() => {
                const first = weightData[0]
                const last  = weightData[weightData.length - 1]
                const diff  = (last.weight_kg ?? 0) - (first.weight_kg ?? 0)
                const isLoss = diff < 0
                return (
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Peso inicial', value: `${first.weight_kg} kg`, sub: formatDate(first.logged_at), accent: '#94A3B8', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.15)' },
                      { label: 'Variación total', value: `${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg`, sub: `${isLoss ? '▼ Bajada' : '▲ Subida'} en ${weightData.length} registros`, accent: isLoss ? '#10B981' : '#EF4444', bg: isLoss ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: isLoss ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' },
                      { label: 'Peso actual',   value: `${last.weight_kg} kg`,  sub: formatDate(last.logged_at),  accent: '#0EA5E9', bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.2)' },
                    ].map(stat => (
                      <div key={stat.label}
                           className="rounded-xl p-4 text-center transition-all duration-200 hover:-translate-y-0.5"
                           style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
                        <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
                        <div className="text-2xl font-bold font-mono leading-none" style={{ color: stat.accent }}>{stat.value}</div>
                        <div className="text-[11px] text-slate-500 mt-1">{stat.sub}</div>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {/* Area chart */}
              {weightData.length >= 2 && (
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #0EA5E9, #7C3AED)' }} />
                    <h3 className="text-sm font-semibold text-white">Evolución del peso</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={weightData.map(l => ({ date: formatDate(l.logged_at, 'dd/MM'), kg: l.weight_kg }))}>
                      <defs>
                        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#0EA5E9" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
                      <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} width={36} />
                      <Tooltip
                        contentStyle={{ background: '#1E293B', border: '1px solid rgba(51,65,85,0.8)', borderRadius: 10, fontSize: 12 }}
                        labelStyle={{ color: '#94A3B8' }}
                        itemStyle={{ color: '#0EA5E9', fontWeight: 600 }}
                        cursor={{ stroke: 'rgba(14,165,233,0.3)', strokeWidth: 1 }}
                      />
                      <Area type="monotone" dataKey="kg" stroke="#0EA5E9" strokeWidth={2}
                            fill="url(#weightGradient)"
                            dot={{ fill: '#0EA5E9', r: 3, strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: '#0EA5E9', stroke: '#0F172A', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Before / After */}
              {(() => {
                const withPhotos = progressLogs.filter(l => (l.photos ?? []).length > 0)
                if (withPhotos.length < 2) return null
                const before = withPhotos[0]
                const after  = withPhotos[withPhotos.length - 1]
                const allPhotos = progressLogs.flatMap(l => l.photos ?? [])
                return (
                  <div className="card p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #7C3AED, #0EA5E9)' }} />
                      <h3 className="text-sm font-semibold text-white">Antes y ahora</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[{ log: before, label: 'Antes' }, { log: after, label: 'Ahora' }].map(({ log, label }) => (
                        <button key={log.id} onClick={() => {
                          const url = (log.photos ?? [])[0]
                          const idx = allPhotos.indexOf(url)
                          setLightbox({ urls: allPhotos, idx: idx >= 0 ? idx : 0 })
                        }} className="text-left group">
                          <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-2 border border-border group-hover:border-sky-500/50 transition-colors">
                            <Image src={(log.photos ?? [])[0]} alt={label} fill className="object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                              <p className="text-xs font-semibold text-white">{label}</p>
                              <p className="text-[10px] text-slate-300">{formatDate(log.logged_at)}</p>
                            </div>
                          </div>
                          {log.weight_kg != null && (
                            <div className="text-center mt-1">
                              <span className="font-mono text-xs font-bold text-white">{log.weight_kg} kg</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Table */}
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'rgba(51,65,85,0.25)' }}>
                        {['Fecha', 'Peso (kg)', 'Grasa corp.', 'Masa musc.', 'Cintura', 'Pecho', 'Brazo', 'Notas', 'Fotos'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...progressLogs].reverse().map((log, idx) => (
                        <tr key={log.id}
                            className="border-t border-border/30 transition-colors hover:bg-surface-2/40"
                            style={idx % 2 === 0 ? { background: 'rgba(30,41,59,0.2)' } : undefined}>
                          <td className="px-4 py-3 text-slate-300 text-xs font-medium">{formatDate(log.logged_at)}</td>
                          <td className="px-4 py-3 text-sky-400 font-mono font-semibold text-xs">{log.weight_kg != null ? `${log.weight_kg}` : <span className="text-slate-600">—</span>}</td>
                          <td className="px-4 py-3 text-amber-400 font-mono text-xs">{log.body_fat_pct != null ? `${log.body_fat_pct}%` : <span className="text-slate-600">—</span>}</td>
                          <td className="px-4 py-3 text-emerald-400 font-mono text-xs">{log.muscle_mass_kg != null ? `${log.muscle_mass_kg}` : <span className="text-slate-600">—</span>}</td>
                          <td className="px-4 py-3 text-violet-400 font-mono text-xs">{log.waist_cm != null ? `${log.waist_cm}cm` : <span className="text-slate-600">—</span>}</td>
                          <td className="px-4 py-3 text-pink-400 font-mono text-xs">{log.chest_cm != null ? `${log.chest_cm}cm` : <span className="text-slate-600">—</span>}</td>
                          <td className="px-4 py-3 text-cyan-400 font-mono text-xs">{log.arm_cm != null ? `${log.arm_cm}cm` : <span className="text-slate-600">—</span>}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-[180px]">{log.notes ?? <span className="text-slate-600">—</span>}</td>
                          <td className="px-4 py-3">
                            {(log.photos ?? []).length > 0 ? (
                              <div className="flex gap-1">
                                {(log.photos ?? []).slice(0, 3).map((url, pi) => (
                                  <button key={pi} onClick={() => {
                                    const allPhotos = progressLogs.flatMap(l => l.photos ?? [])
                                    const idx = allPhotos.indexOf(url)
                                    setLightbox({ urls: allPhotos, idx: idx >= 0 ? idx : 0 })
                                  }}>
                                    <Image src={url} alt="Foto" width={32} height={32} className="object-cover rounded-lg border border-slate-700 hover:border-sky-500 transition-colors cursor-zoom-in" />
                                  </button>
                                ))}
                                {(log.photos ?? []).length > 3 && (
                                  <span className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-[9px] text-slate-400">+{(log.photos ?? []).length - 3}</span>
                                )}
                              </div>
                            ) : <span className="text-slate-600">—</span>}
                          </td>
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

      {/* ═══════════════════════════════════════════════════════════
          TAB: CITAS
      ═══════════════════════════════════════════════════════════ */}
      {tab === 'citas' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Próximas citas</h2>
              <p className="text-xs text-slate-500 mt-0.5">{appointments.length} {appointments.length === 1 ? 'cita programada' : 'citas programadas'}</p>
            </div>
            <button type="button" className="btn-primary" onClick={() => setShowAppointmentModal(true)}>
              <Plus size={15} /> Agendar cita
            </button>
          </div>

          {appointments.length === 0 ? (
            <EmptyState icon={<CalendarDays />} title="Sin citas programadas"
                        description="Agenda la próxima sesión con este cliente."
                        action={{ label: 'Agendar cita', onClick: () => setShowAppointmentModal(true) }} />
          ) : (
            <div className="space-y-3">
              {appointments.map((apt, idx) => {
                const typeColor = apt.type === 'presencial'
                  ? { color: '#7C3AED', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.25)', icon: <MapPin size={14} /> }
                  : apt.type === 'online'
                  ? { color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)',  border: 'rgba(14,165,233,0.25)',  icon: <Video size={14} /> }
                  : { color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', icon: <Phone size={14} /> }
                return (
                  <div key={apt.id}
                       className="card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover flex"
                       style={idx === 0 ? { borderColor: 'rgba(14,165,233,0.2)' } : undefined}>
                    {/* Left accent */}
                    <div className="w-1 shrink-0 rounded-l-2xl" style={{ background: typeColor.color }} />
                    <div className="flex-1 p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105"
                           style={{ background: typeColor.bg, color: typeColor.color }}>
                        {typeColor.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm">{formatRelative(apt.scheduled_at)}</div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                          <Clock size={10} /> {apt.duration_minutes} min
                          {apt.location && <><span className="text-slate-600">·</span> <MapPin size={10} /> {apt.location}</>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge status={apt.type} />
                        <Badge status={apt.status} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: MENSAJES
      ═══════════════════════════════════════════════════════════ */}
      {tab === 'mensajes' && (
        <div className="animate-fade-in">
          <div className="card flex flex-col overflow-hidden" style={{ height: '520px' }}>
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-border/60 shrink-0 flex items-center gap-3"
                 style={{ background: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(10px)' }}>
              <Avatar name={profile.full_name} url={profile.avatar_url} size="sm" />
              <div>
                <div className="font-semibold text-white text-sm">{profile.full_name}</div>
                <div className="text-[11px] text-slate-500">Chat directo</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                       style={{ background: 'rgba(51,65,85,0.5)' }}>
                    <MessageSquare size={20} className="text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-500">Todavía no hay mensajes. ¡Escribe el primero!</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.sender_id === trainerId
                  return (
                    <div key={msg.id} className={cn('flex items-end gap-2 animate-message-in', isMine ? 'justify-end' : 'justify-start')}>
                      {!isMine && (
                        <Avatar name={profile.full_name} url={profile.avatar_url} size="sm" className="shrink-0 mb-0.5" />
                      )}
                      <div className={cn('max-w-[72%] flex flex-col', isMine ? 'items-end' : 'items-start')}>
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                            isMine ? 'text-white rounded-br-sm' : 'rounded-bl-sm text-slate-200',
                          )}
                          style={isMine
                            ? { background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)', boxShadow: '0 4px 12px rgba(14,165,233,0.25)' }
                            : { background: 'rgba(51,65,85,0.6)', border: '1px solid rgba(71,85,105,0.5)' }}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-600 mt-0.5 px-1">{timeAgo(msg.created_at)}</span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Compose */}
            <div className="px-4 py-3 border-t border-border/60 shrink-0 flex gap-2"
                 style={{ background: 'rgba(30,41,59,0.4)' }}>
              <input
                type="text"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder={`Mensaje a ${profile.full_name}...`}
                className="input flex-1 text-sm"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!messageText.trim() || sendingMessage}
                className="btn-gradient shrink-0 px-4 active:scale-95 transition-transform duration-100"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {trainerId && (
        <>
          <NewRoutineModal
            isOpen={showRoutineModal}
            onClose={() => setShowRoutineModal(false)}
            clientId={clientId}
            trainerId={trainerId}
            onSuccess={() => { setShowRoutineModal(false); loadData() }}
          />
          <NewMealPlanModal
            isOpen={showMealModal}
            onClose={() => setShowMealModal(false)}
            clientId={clientId}
            trainerId={trainerId}
            onSuccess={() => { setShowMealModal(false); loadData() }}
          />
          <NewProgressModal
            isOpen={showProgressModal}
            onClose={() => setShowProgressModal(false)}
            clientId={clientId}
            trainerId={trainerId}
            onSuccess={() => { setShowProgressModal(false); loadData() }}
          />
          <NewAppointmentModal
            isOpen={showAppointmentModal}
            onClose={() => setShowAppointmentModal(false)}
            clientId={clientId}
            trainerId={trainerId}
            onSuccess={() => { setShowAppointmentModal(false); loadData() }}
          />
        </>
      )}

      {/* ── Photo lightbox ──────────────────────────────────────────────── */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
             onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          {lightbox.urls.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setLightbox(lb => lb ? { ...lb, idx: (lb.idx - 1 + lb.urls.length) % lb.urls.length } : null) }}
                className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button onClick={e => { e.stopPropagation(); setLightbox(lb => lb ? { ...lb, idx: (lb.idx + 1) % lb.urls.length } : null) }}
                className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}
          <div className="relative max-w-3xl max-h-[85vh] w-full mx-20" onClick={e => e.stopPropagation()}>
            <Image src={lightbox.urls[lightbox.idx]} alt="Foto de progreso"
              width={900} height={900} className="object-contain max-h-[85vh] w-full rounded-xl" />
          </div>
        </div>
      )}
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
      trainer_id:  trainerId,
      client_id:   clientId,
      title:       form.title.trim(),
      description: form.description.trim() || null,
      frequency:   form.frequency.trim() || null,
      starts_at:   form.starts_at || null,
      ends_at:     form.ends_at || null,
      status:      'active',
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
      trainer_id:      trainerId,
      client_id:       clientId,
      title:           form.title.trim(),
      calories_target: form.calories_target ? Number(form.calories_target) : null,
      protein_target:  form.protein_target ? Number(form.protein_target) : null,
      carbs_target:    form.carbs_target ? Number(form.carbs_target) : null,
      fat_target:      form.fat_target ? Number(form.fat_target) : null,
      notes:           form.notes.trim() || null,
      status:          'active',
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
            { field: 'carbs_target',   label: 'Carbos (g)' },
            { field: 'fat_target',     label: 'Grasa (g)' },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="label">{label}</label>
              <input type="number" className="input" placeholder="0" value={form[field as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))} />
            </div>
          ))}
        </div>
        {totalCal > 0 && (
          <div className="rounded-xl p-3 text-xs space-y-2"
               style={{ background: 'rgba(51,65,85,0.25)', border: '1px solid rgba(51,65,85,0.5)' }}>
            <p className="font-semibold text-slate-300 mb-2">Distribución de macros ({totalCal} kcal calculadas)</p>
            {[
              { label: 'Proteína', kcal: p * 4, color: '#0EA5E9' },
              { label: 'Carbos',   kcal: c * 4, color: '#F59E0B' },
              { label: 'Grasa',    kcal: f * 9, color: '#7C3AED' },
            ].map(m => (
              <div key={m.label} className="flex items-center gap-2">
                <span className="w-16 text-slate-400">{m.label}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(51,65,85,0.6)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                       style={{ width: `${Math.round((m.kcal / totalCal) * 100)}%`, background: m.color }} />
                </div>
                <span className="w-8 text-right font-bold" style={{ color: m.color }}>{Math.round((m.kcal / totalCal) * 100)}%</span>
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
    weight_kg: '', body_fat_pct: '', muscle_mass_kg: '',
    waist_cm: '', chest_cm: '', arm_cm: '', thigh_cm: '', hip_cm: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('progress_logs').insert({
      client_id:       clientId,
      trainer_id:      trainerId,
      logged_at:       form.logged_at,
      weight_kg:       form.weight_kg ? Number(form.weight_kg) : null,
      body_fat_pct:    form.body_fat_pct ? Number(form.body_fat_pct) : null,
      muscle_mass_kg:  form.muscle_mass_kg ? Number(form.muscle_mass_kg) : null,
      waist_cm:        form.waist_cm ? Number(form.waist_cm) : null,
      chest_cm:        form.chest_cm ? Number(form.chest_cm) : null,
      arm_cm:          form.arm_cm ? Number(form.arm_cm) : null,
      thigh_cm:        form.thigh_cm ? Number(form.thigh_cm) : null,
      hip_cm:          form.hip_cm ? Number(form.hip_cm) : null,
      notes:           form.notes.trim() || null,
      photos:          [],
    })
    setSaving(false)
    if (error) { toast.error('Error: ' + error.message); return }
    toast.success('Registro guardado')
    setForm({ logged_at: new Date().toISOString().split('T')[0], weight_kg: '', body_fat_pct: '', muscle_mass_kg: '', waist_cm: '', chest_cm: '', arm_cm: '', thigh_cm: '', hip_cm: '', notes: '' })
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
        <details className="mt-1">
          <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">Medidas corporales (opcional)</summary>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {([
              { key: 'waist_cm', label: 'Cintura (cm)' },
              { key: 'chest_cm', label: 'Pecho (cm)' },
              { key: 'arm_cm',   label: 'Brazo (cm)' },
              { key: 'thigh_cm', label: 'Muslo (cm)' },
              { key: 'hip_cm',   label: 'Cadera (cm)' },
            ] as const).map(m => (
              <div key={m.key}>
                <label className="text-xs text-slate-500">{m.label}</label>
                <input type="number" step="0.1" className="input text-sm py-1.5"
                  value={form[m.key]} onChange={e => setForm(p => ({ ...p, [m.key]: e.target.value }))} />
              </div>
            ))}
          </div>
        </details>
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
    scheduled_at:     '',
    duration_minutes: '60',
    type:             'presencial' as 'presencial' | 'online' | 'llamada',
    location:         '',
    notes:            '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.scheduled_at) { toast.error('La fecha es obligatoria'); return }
    setSaving(true)
    const { error } = await supabase.from('appointments').insert({
      trainer_id:       trainerId,
      client_id:        clientId,
      scheduled_at:     new Date(form.scheduled_at).toISOString(),
      duration_minutes: Number(form.duration_minutes),
      type:             form.type,
      status:           'pending',
      location:         form.location.trim() || null,
      notes:            form.notes.trim() || null,
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
