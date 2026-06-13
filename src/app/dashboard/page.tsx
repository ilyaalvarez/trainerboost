import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUnreadMessageCount, getPendingAppointmentsCount } from '@/lib/data/dashboard'
import { Users, CalendarDays, MessageSquare, TrendingUp, Plus, Clock, Zap, Calendar, ChevronRight, Rocket, CheckCircle2, Dumbbell, Apple, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { formatRelative, formatDate, timeAgo } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import StatsCard from '@/components/ui/StatsCard'


export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today    = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString()
  const lastMonthEnd   = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59).toISOString()

  const [
    { data: clients },
    { data: todayAppointments },
    unreadCount,
    { data: recentMessages },
    { data: subscription },
    { data: profile },
    { count: thisMonthNewClients },
    { count: lastMonthNewClients },
    { count: thisMonthApts },
    { count: lastMonthApts },
  ] = await Promise.all([
    supabase.from('trainer_clients')
      .select('*, profile:client_id(id, full_name, avatar_url)')
      .eq('trainer_id', user.id)
      .eq('status', 'active'),
    supabase.from('appointments')
      .select('*, client:client_id(full_name, avatar_url)')
      .eq('trainer_id', user.id)
      .gte('scheduled_at', `${todayStr}T00:00:00`)
      .lte('scheduled_at', `${todayStr}T23:59:59`)
      .neq('status', 'cancelled')
      .order('scheduled_at'),
    getUnreadMessageCount(user.id),
    supabase.from('messages')
      .select('*, sender:sender_id(full_name, avatar_url)')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('subscriptions').select('status, max_clients').eq('user_id', user.id).single(),
    supabase.from('profiles').select('bio, phone, specialties').eq('id', user.id).single(),
    supabase.from('trainer_clients').select('id', { count: 'exact', head: true })
      .eq('trainer_id', user.id).gte('started_at', thisMonthStart),
    supabase.from('trainer_clients').select('id', { count: 'exact', head: true })
      .eq('trainer_id', user.id).gte('started_at', lastMonthStart).lte('started_at', lastMonthEnd),
    supabase.from('appointments').select('id', { count: 'exact', head: true })
      .eq('trainer_id', user.id).gte('scheduled_at', thisMonthStart).neq('status', 'cancelled'),
    supabase.from('appointments').select('id', { count: 'exact', head: true })
      .eq('trainer_id', user.id).gte('scheduled_at', lastMonthStart).lte('scheduled_at', lastMonthEnd).neq('status', 'cancelled'),
  ])

  const [pendingApts, { data: todayActivity }] = await Promise.all([
    getPendingAppointmentsCount(user.id),
    supabase
      .from('progress_logs')
      .select('client_id, logged_at, weight_kg, profiles!client_id(full_name, avatar_url)')
      .eq('trainer_id', user.id)
      .gte('logged_at', `${todayStr}T00:00:00`)
      .order('logged_at', { ascending: false })
      .limit(5),
  ])

  const activeClientsList = (clients ?? []) as Array<{ client_id: string; status: string }>
  const activeClientIds = activeClientsList.filter(c => c.status === 'active').map(c => c.client_id)

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 3600000).toISOString()
  let inactiveClientsCount = 0

  let todayCheckins: Array<{ client_id: string; energy: number | null; mood: number | null; sleep_hours: number | null; note: string | null; profile: { full_name: string; avatar_url: string | null } | null }> = []

  if (activeClientIds.length > 0) {
    const [{ data: recentLogs }, { data: checkinData }] = await Promise.all([
      supabase
        .from('progress_logs')
        .select('client_id')
        .in('client_id', activeClientIds)
        .gte('logged_at', fourteenDaysAgo),
      supabase
        .from('daily_checkins')
        .select('client_id, energy, mood, sleep_hours, note, profiles!client_id(full_name, avatar_url)')
        .in('client_id', activeClientIds)
        .eq('checkin_date', todayStr),
    ])

    const clientsWithRecentLogs = new Set((recentLogs ?? []).map((l: { client_id: string }) => l.client_id))
    inactiveClientsCount = activeClientIds.filter(id => !clientsWithRecentLogs.has(id)).length

    todayCheckins = (checkinData ?? []).map(c => ({
      client_id: c.client_id,
      energy: c.energy,
      mood: c.mood,
      sleep_hours: c.sleep_hours,
      note: c.note as string | null ?? null,
      profile: (Array.isArray(c.profiles) ? c.profiles[0] : c.profiles) as { full_name: string; avatar_url: string | null } | null,
    }))
  }

  const activeClients = clients?.length ?? 0
  const maxClients    = subscription?.max_clients ?? 0

  const clientChangeValue = thisMonthNewClients !== null
    ? { value: `+${thisMonthNewClients} este mes`, positive: (thisMonthNewClients ?? 0) >= (lastMonthNewClients ?? 0) }
    : undefined

  const aptDiff = (thisMonthApts ?? 0) - (lastMonthApts ?? 0)
  const aptChangePct = lastMonthApts ? Math.round((aptDiff / lastMonthApts) * 100) : null
  const aptChangeValue = aptChangePct !== null
    ? { value: `${aptDiff >= 0 ? '+' : ''}${aptChangePct}%`, positive: aptDiff >= 0 }
    : undefined

  const hasProfile = !!(profile?.bio || profile?.phone || (profile?.specialties && (profile.specialties as unknown[]).length > 0))
  const hasClients = (clients?.length ?? 0) > 0
  const hasSubscription = subscription?.status === 'active'
  const onboardingComplete = hasProfile && hasClients && hasSubscription

  return (
    <div className="space-y-8">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-fg-primary">Panel principal</h1>
          <p className="text-fg-muted text-sm mt-0.5 capitalize">
            {formatDate(today, "EEEE, d MMMM yyyy")}
          </p>
        </div>
        <Link href="/dashboard/clients" className="btn-primary">
          <Plus className="w-4 h-4" /> Añadir cliente
        </Link>
      </div>

      {/* ── Free plan CTA ─────────────────────────────────────────────── */}
      {(!subscription || subscription.status !== 'active') && (
        <div className="rounded-xl border p-4 flex items-center justify-between gap-4 animate-fade-in-up"
             style={{ background: 'rgba(143,212,58,0.04)', borderColor: 'rgba(143,212,58,0.16)' }}>
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-brand-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-fg-primary">Completa tu configuración para empezar</p>
              <p className="text-xs text-fg-muted mt-0.5">Empieza gratis con 3 clientes, o amplía tu plan desde 19€/mes</p>
            </div>
          </div>
          <Link href="/pricing" className="btn-gradient shrink-0 text-sm py-1.5 px-4 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Ver planes
          </Link>
        </div>
      )}

      {/* ── Onboarding checklist ──────────────────────────────────────── */}
      {!onboardingComplete && (
        <div className="card p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-[#C4B5FD]" />
            <div>
              <p className="text-sm font-semibold text-fg-primary">Empieza con TrainerBoost</p>
              <p className="text-xs text-fg-muted mt-0.5">{[hasSubscription, hasProfile, hasClients].filter(Boolean).length} de 3 pasos completados</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-surface-3 rounded-full h-1.5 mb-4">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-500"
                 style={{ width: `${([hasSubscription, hasProfile, hasClients].filter(Boolean).length / 3) * 100}%` }} />
          </div>
          <div className="space-y-2.5">
            {[
              { done: hasSubscription, label: 'Activa un plan', desc: 'Desbloquea todas las funciones', href: '/pricing' },
              { done: hasProfile, label: 'Completa tu perfil', desc: 'Añade bio, teléfono y especialidades', href: '/dashboard/settings' },
              { done: hasClients, label: 'Invita a tu primer cliente', desc: 'Genera un enlace de invitación', href: '/dashboard/clients' },
            ].map((step, i) => (
              <Link key={i} href={step.done ? '#' : step.href}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${step.done ? 'border-semantic-success/20 opacity-60' : 'border-border-strong hover:border-border'}`}
                    style={{ background: step.done ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)' }}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-semantic-success/10' : 'bg-surface-3'}`}>
                  {step.done
                    ? <CheckCircle2 className="w-4 h-4 text-semantic-success-text" />
                    : <span className="text-xs font-bold text-fg-disabled">{i + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${step.done ? 'text-fg-muted line-through' : 'text-fg-primary'}`}>{step.label}</p>
                  <p className="text-xs text-fg-disabled">{step.desc}</p>
                </div>
                {!step.done && <ChevronRight className="w-4 h-4 text-fg-disabled shrink-0" />}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Limit warning ─────────────────────────────────────────────── */}
      {subscription?.status === 'active' && maxClients < 999999 && activeClients >= maxClients && (
        <div className="p-4 rounded-xl border flex items-center justify-between gap-4"
             style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.25)' }}>
          <p className="text-semantic-warning-text text-sm font-medium">
            Has alcanzado el límite de {maxClients} clientes de tu plan.
          </p>
          <Link href="/pricing" className="text-xs font-bold text-semantic-warning-text hover:underline whitespace-nowrap">
            Actualizar plan →
          </Link>
        </div>
      )}

      {/* ── KPIs ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Link href="/dashboard/clients">
          <StatsCard
            label="Clientes activos"
            value={activeClients}
            icon={<Users className="w-5 h-5" />}
            color="primary"
            change={clientChangeValue}
          />
        </Link>
        <Link href="/dashboard/appointments">
          <StatsCard
            label="Citas hoy"
            value={todayAppointments?.length ?? 0}
            icon={<CalendarDays className="w-5 h-5" />}
            color="accent"
            change={aptChangeValue}
          />
        </Link>
        <Link href="/dashboard/messages">
          <StatsCard
            label="Mensajes sin leer"
            value={unreadCount ?? 0}
            icon={<MessageSquare className="w-5 h-5" />}
            color="secondary"
          />
        </Link>
        <StatsCard
          label="Capacidad usada"
          value={maxClients > 0 ? `${Math.round((activeClients / maxClients) * 100)}%` : '—'}
          icon={<TrendingUp className="w-5 h-5" />}
          color="warning"
        />
      </div>

      {/* ── Acciones rápidas ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([
          { label: 'Nueva rutina',    icon: Dumbbell,  href: '/dashboard/routines',     color: 'text-[#C4B5FD]',              bg: 'rgba(124,58,237,0.15)'  },
          { label: 'Nuevo plan',      icon: Apple,     href: '/dashboard/nutrition',    color: 'text-brand-accent',            bg: 'rgba(16,185,129,0.15)'  },
          { label: 'Nueva cita',      icon: Calendar,  href: '/dashboard/appointments', color: 'text-semantic-warning-text',   bg: 'rgba(245,158,11,0.15)'  },
          { label: 'Invitar cliente', icon: UserPlus,  href: '/dashboard/clients',      color: 'text-brand-primary',           bg: 'rgba(143,212,58,0.10)'  },
        ] as const).map(action => (
          <Link key={action.label} href={action.href}
            className="card card-interactive p-4 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: action.bg }}>
              <action.icon className={`w-5 h-5 ${action.color}`} />
            </div>
            <span className="text-xs font-medium text-fg-secondary">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* ── Appointments + Messages ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">

        {/* Today's appointments */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-brand-primary to-brand-secondary shrink-0" />
              <h2 className="font-semibold text-fg-primary">Citas de hoy</h2>
            </div>
            <Link href="/dashboard/appointments" className="text-xs text-brand-primary hover:underline font-medium">
              Ver todas →
            </Link>
          </div>

          {!todayAppointments?.length ? (
            <div className="text-center py-10 text-fg-muted text-sm">
              <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center mx-auto mb-3">
                <CalendarDays className="w-6 h-6 opacity-40" />
              </div>
              <p className="font-medium text-fg-secondary mb-1">Sin citas hoy</p>
              <p className="text-xs">Tus citas de hoy aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayAppointments.map(apt => (
                <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}
                  >
                    <Clock className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-fg-primary truncate">
                      {(apt.client as { full_name: string })?.full_name}
                    </div>
                    <div className="text-xs text-fg-muted">
                      {formatRelative(apt.scheduled_at)} · {apt.duration_minutes}min
                    </div>
                  </div>
                  <Badge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent messages */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-brand-primary to-brand-secondary shrink-0" />
              <h2 className="font-semibold text-fg-primary">Mensajes recientes</h2>
            </div>
            <Link href="/dashboard/messages" className="text-xs text-brand-primary hover:underline font-medium">
              Ver todos →
            </Link>
          </div>

          {!recentMessages?.length ? (
            <div className="text-center py-10 text-fg-muted text-sm">
              <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 opacity-40" />
              </div>
              <p className="font-medium text-fg-secondary mb-1">Sin mensajes</p>
              <p className="text-xs">Los mensajes de tus clientes aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentMessages.map(msg => {
                const sender = msg.sender as { full_name: string; avatar_url: string | null }
                return (
                  <Link
                    key={msg.id}
                    href="/dashboard/messages"
                    className="flex items-start gap-3 p-3 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors"
                  >
                    <Avatar name={sender?.full_name || '?'} url={sender?.avatar_url} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm text-fg-primary truncate">
                          {sender?.full_name}
                        </span>
                        <span className="text-[10px] text-fg-disabled shrink-0">{timeAgo(msg.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="text-xs text-fg-muted truncate flex-1">{msg.content}</div>
                        {!msg.read_at && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Smart alerts ──────────────────────────────────────────────── */}
      {((pendingApts ?? 0) > 0 || inactiveClientsCount > 0) && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wider mb-3">Acciones recomendadas</h3>
          <div className="space-y-2">
            {(pendingApts ?? 0) > 0 && (
              <Link href="/dashboard/appointments" className="flex items-center gap-3 p-3 rounded-xl border border-semantic-warning/20 hover:border-semantic-warning/40 transition-colors group"
                    style={{ background: 'rgba(245,158,11,0.04)' }}>
                <div className="w-8 h-8 rounded-lg bg-semantic-warning/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-semantic-warning-text" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-fg-primary">{pendingApts} {pendingApts === 1 ? 'cita pendiente de confirmar' : 'citas pendientes de confirmar'}</p>
                  <p className="text-xs text-fg-muted">Confirma o cancela para que tus clientes estén informados</p>
                </div>
                <ChevronRight className="w-4 h-4 text-fg-disabled group-hover:text-fg-muted transition-colors" />
              </Link>
            )}
            {inactiveClientsCount > 0 && (
              <Link href="/dashboard/clients" className="flex items-center gap-3 p-3 rounded-xl border border-semantic-error/20 hover:border-semantic-error/40 transition-colors group"
                    style={{ background: 'rgba(239,68,68,0.04)' }}>
                <div className="w-8 h-8 rounded-lg bg-semantic-error/10 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-semantic-error-text" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-fg-primary">{inactiveClientsCount} {inactiveClientsCount === 1 ? 'cliente sin actividad' : 'clientes sin actividad'} en 14 días</p>
                  <p className="text-xs text-fg-muted">Revisa su progreso y envíales un mensaje de motivación</p>
                </div>
                <ChevronRight className="w-4 h-4 text-fg-disabled group-hover:text-fg-muted transition-colors" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Today's check-ins ────────────────────────────────────────── */}
      {todayCheckins.length > 0 && (
        <div className="card p-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-semantic-warning to-brand-primary shrink-0" />
            <h2 className="font-semibold text-fg-primary">Check-ins de hoy</h2>
            <span className="ml-auto text-xs text-fg-disabled">{todayCheckins.length} {todayCheckins.length === 1 ? 'cliente' : 'clientes'}</span>
          </div>
          <div className="space-y-2">
            {todayCheckins.map(c => {
              const energyEmojis = ['😴','🪫','😐','⚡','🔥']
              const moodEmojis   = ['😞','😕','😐','😊','😄']
              return (
                <div key={c.client_id} className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.profile?.full_name ?? '?'} url={c.profile?.avatar_url} size="sm" />
                    <span className="text-sm font-medium text-fg-primary flex-1 min-w-0 truncate">{c.profile?.full_name ?? '—'}</span>
                    <div className="flex items-center gap-3 text-xs shrink-0">
                      {c.energy != null && (
                        <span className="flex items-center gap-1" title={`Energía: ${c.energy}/5`}>
                          <span>{energyEmojis[c.energy - 1]}</span>
                          <span className="text-fg-muted font-mono">{c.energy}/5</span>
                        </span>
                      )}
                      {c.mood != null && (
                        <span className="flex items-center gap-1" title={`Ánimo: ${c.mood}/5`}>
                          <span>{moodEmojis[c.mood - 1]}</span>
                          <span className="text-fg-muted font-mono">{c.mood}/5</span>
                        </span>
                      )}
                      {c.sleep_hours != null && (
                        <span className="text-fg-disabled">🌙 {c.sleep_hours}h</span>
                      )}
                    </div>
                  </div>
                  {c.note && (
                    <p className="text-xs text-fg-muted italic pl-9">&ldquo;{c.note}&rdquo;</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Today's client activity ───────────────────────────────────── */}
      {todayActivity && todayActivity.length > 0 && (
        <div className="card p-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-brand-accent to-brand-primary shrink-0" />
            <h2 className="font-semibold text-fg-primary">Actividad de hoy</h2>
          </div>
          <div className="space-y-2">
            {todayActivity.map((log, i) => {
              const p = (Array.isArray(log.profiles) ? log.profiles[0] : log.profiles) as { full_name: string; avatar_url: string | null } | null
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-brand-accent" />
                  </div>
                  <Avatar name={p?.full_name ?? '?'} url={p?.avatar_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-fg-primary">{p?.full_name ?? '—'}</span>
                    <span className="text-xs text-fg-muted ml-2">registró progreso</span>
                    {log.weight_kg != null && (
                      <span className="text-xs text-brand-primary ml-2 font-mono">{log.weight_kg} kg</span>
                    )}
                  </div>
                  <span className="text-xs text-fg-disabled">hoy</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Client list ───────────────────────────────────────────────── */}
      <div className="card p-6 animate-fade-in-up delay-300">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-brand-primary to-brand-secondary shrink-0" />
            <h2 className="font-semibold text-fg-primary">Mis clientes</h2>
          </div>
          <Link href="/dashboard/clients" className="text-xs text-brand-primary hover:underline font-medium">
            Gestionar →
          </Link>
        </div>

        {!clients?.length ? (
          <div className="text-center py-12 text-fg-muted text-sm">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 opacity-30" />
            </div>
            <p className="font-medium text-fg-secondary mb-1">Sin clientes todavía</p>
            <p className="mb-4">Invita a tu primer cliente para empezar</p>
            <Link href="/dashboard/clients" className="btn-primary text-xs px-4 py-2">
              <Plus className="w-3.5 h-3.5" /> Añadir cliente
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-3 text-xs font-semibold text-fg-muted uppercase tracking-wide">Cliente</th>
                  <th className="text-left pb-3 text-xs font-semibold text-fg-muted uppercase tracking-wide">Estado</th>
                  <th className="text-left pb-3 text-xs font-semibold text-fg-muted uppercase tracking-wide hidden sm:table-cell">Desde</th>
                  <th className="text-right pb-3 text-xs font-semibold text-fg-muted uppercase tracking-wide">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {clients.slice(0, 8).map(c => {
                  const clientProfile = c.profile as { id: string; full_name: string; avatar_url: string | null }
                  return (
                    <tr key={c.id} className="group hover:bg-surface-2/50 transition-colors rounded-lg">
                      <td className="py-3">
                        <Link href={`/dashboard/clients/${clientProfile?.id}`} className="flex items-center gap-3 hover:text-brand-primary transition-colors">
                          <Avatar name={clientProfile?.full_name || '?'} url={clientProfile?.avatar_url} size="sm" />
                          <span className="font-medium text-fg-primary group-hover:text-brand-primary transition-colors">{clientProfile?.full_name}</span>
                        </Link>
                      </td>
                      <td className="py-3"><Badge status={c.status} /></td>
                      <td className="py-3 text-fg-secondary hidden sm:table-cell">{formatDate(c.started_at)}</td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/dashboard/clients/${clientProfile?.id}`}
                          className="text-xs text-brand-primary hover:underline font-medium opacity-60 group-hover:opacity-100 transition-opacity"
                        >
                          Ver perfil →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
