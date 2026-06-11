import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarDays, MessageSquare, Dumbbell, ChevronRight, Flame, Apple, TrendingUp } from 'lucide-react'
import { formatDate, formatRelative } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import type { Profile } from '@/types/database'
import ProgressChart from './_components/ProgressChart'
import { DailyCheckinCard } from '@/components/ui/DailyCheckinCard'
import { QuickLogButton } from './_components/QuickLogButton'

export default async function ClientHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]
  const checkinQuery = supabase.from('daily_checkins')
    .select('energy,mood,sleep_hours,note')
    .eq('client_id', user.id)
    .eq('checkin_date', today)
    .maybeSingle()

  const [
    { data: profile },
    { data: trainerRel },
    { data: progressLogs },
    { data: nextApt },
    { data: _unreadMessages },
    { data: activeRoutine },
    { data: todayCheckin },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('trainer_clients')
      .select('*, trainer:trainer_id(id, full_name, avatar_url, bio, specialties)')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .maybeSingle(),
    supabase.from('progress_logs')
      .select('*')
      .eq('client_id', user.id)
      .order('logged_at', { ascending: true })
      .limit(12),
    supabase.from('appointments')
      .select('*, trainer:trainer_id(full_name)')
      .eq('client_id', user.id)
      .gte('scheduled_at', new Date().toISOString())
      .neq('status', 'cancelled')
      .order('scheduled_at')
      .limit(1)
      .maybeSingle(),
    supabase.from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .is('read_at', null),
    supabase.from('routines')
      .select('*, exercises:routine_exercises(id, name, sets, reps, order_index)')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    checkinQuery,
  ])

  const trainer = trainerRel?.trainer as Profile | null
  const trainerId = (trainerRel as { trainer_id?: string } | null)?.trainer_id ?? null
  const latestLog = progressLogs?.at(-1)
  const prevLog   = progressLogs?.at(-2)
  const weightChange = latestLog && prevLog && latestLog.weight_kg && prevLog.weight_kg
    ? (latestLog.weight_kg - prevLog.weight_kg).toFixed(1)
    : null

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 13 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  // Weekly streak: count distinct days with logs in the current week (Mon–Sun)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
  startOfWeek.setHours(0, 0, 0, 0)
  const daysWithLogsThisWeek = new Set(
    (progressLogs ?? [])
      .filter(l => new Date(l.logged_at) >= startOfWeek)
      .map(l => l.logged_at.slice(0, 10))
  ).size

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-fg-primary">
          {greeting}, {profile?.full_name?.split(' ')[0]} 💪
        </h1>
        <p className="text-fg-muted text-sm mt-0.5 capitalize">{formatDate(now, "EEEE, d MMMM")}</p>
      </div>

      {/* Daily check-in */}
      <DailyCheckinCard clientId={user.id} trainerId={trainerId} existingCheckin={todayCheckin} />

      {/* Trainer info */}
      {trainer ? (
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <Avatar name={trainer.full_name} url={trainer.avatar_url} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-fg-muted mb-0.5">Tu entrenador</div>
              <div className="font-semibold text-fg-primary">{trainer.full_name}</div>
              {trainer.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {trainer.specialties.slice(0, 3).map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-surface-2 border border-border text-fg-muted">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Link href="/client/messages" className="btn-secondary text-xs py-1.5 px-3 shrink-0">
              <MessageSquare className="w-3.5 h-3.5" />
              Mensaje
            </Link>
          </div>
          {trainer.bio && (
            <p className="mt-3 text-xs text-fg-muted leading-relaxed line-clamp-2 border-t border-border/40 pt-3">
              {trainer.bio}
            </p>
          )}
        </div>
      ) : (
        <div className="card p-5 flex items-center gap-4 opacity-70 border-dashed border-fg-muted/60">
          <div className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-fg-disabled" />
          </div>
          <div>
            <div className="text-sm font-medium text-fg-muted">Sin entrenador asignado</div>
            <div className="text-xs text-fg-disabled mt-0.5">Cuando tu entrenador te añada, aparecerá aquí.</div>
          </div>
        </div>
      )}

      {/* Weekly streak */}
      {(() => {
        const motivations = [
          'Registra tu progreso hoy para empezar tu racha',
          '¡Un día es el inicio de algo grande!',
          '¡Buen comienzo! Sigue así 💪',
          '¡Vas por buen camino! No pares ahora',
          '¡A mitad de semana, increíble!',
          '¡Casi perfecto, sigue fuerte! 🔥',
          '¡Semana impecable! 🏆 Eres imparable',
          '¡7/7 — Semana perfecta! 🌟',
        ]
        const msg = motivations[Math.min(daysWithLogsThisWeek, motivations.length - 1)]
        const streakPct = Math.round((daysWithLogsThisWeek / 7) * 100)
        return (
          <div className="card p-4 space-y-3 bg-brand-accent/5 border-brand-accent/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-brand-accent/15">
                <Flame className={`w-6 h-6 ${daysWithLogsThisWeek >= 5 ? 'text-semantic-warning-text' : 'text-brand-accent'}`} />
              </div>
              <div>
                <div className="text-sm font-semibold text-fg-primary">Racha semanal</div>
                <div className="text-xs text-fg-muted mt-0.5">{msg}</div>
              </div>
              <div className="ml-auto text-3xl font-bold text-brand-accent shrink-0">{daysWithLogsThisWeek}/7</div>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${daysWithLogsThisWeek >= 7 ? 'bg-semantic-warning' : 'bg-brand-accent'}`}
                style={{ width: `${streakPct}%` }}
              />
            </div>
          </div>
        )
      })()}

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 text-center flex flex-col items-center gap-1">
          <div className="font-mono text-2xl font-bold text-fg-primary">
            {latestLog?.weight_kg ?? '—'}
          </div>
          <div className="text-xs text-fg-muted">Peso (kg)</div>
          {weightChange ? (
            <div className={`text-xs font-semibold ${parseFloat(weightChange) < 0 ? 'text-semantic-success-text' : 'text-semantic-warning-text'}`}>
              {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange} kg
            </div>
          ) : null}
          <QuickLogButton clientId={user.id} trainerId={trainerId} />
        </div>
        <div className="card p-4 text-center">
          <div className="font-mono text-2xl font-bold text-fg-primary">
            {latestLog?.body_fat_pct ?? '—'}
          </div>
          <div className="text-xs text-fg-muted mt-0.5">Grasa %</div>
        </div>
        <div className="card p-4 text-center">
          <div className="font-mono text-2xl font-bold text-fg-primary">
            {latestLog?.muscle_mass_kg ?? '—'}
          </div>
          <div className="text-xs text-fg-muted mt-0.5">Masa muscular</div>
        </div>
        <div className="card p-4 text-center">
          <div className="font-mono text-2xl font-bold text-fg-primary">
            {progressLogs?.length ?? 0}
          </div>
          <div className="text-xs text-fg-muted mt-0.5">Registros</div>
        </div>
      </div>

      {/* Progress chart */}
      {progressLogs && progressLogs.length >= 2 && (
        <div className="card p-5">
          <h2 className="font-semibold text-fg-primary mb-4">Evolución</h2>
          <ProgressChart logs={progressLogs} />
        </div>
      )}

      {/* Next appointment */}
      {nextApt && (
        <div className="card p-5">
          <h2 className="font-semibold text-fg-primary mb-3">Próxima cita</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-brand-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-fg-primary">{formatRelative(nextApt.scheduled_at)}</div>
              <div className="text-sm text-fg-muted">
                {nextApt.duration_minutes}min · {nextApt.type}
                {nextApt.location && ` · ${nextApt.location}`}
              </div>
            </div>
            <Badge status={nextApt.status} />
          </div>
        </div>
      )}

      {/* Active routine preview */}
      {activeRoutine && (() => {
        const exList = (activeRoutine.exercises as { id: string; name: string; sets: number | null; reps: string | null; order_index: number }[])
          .sort((a, b) => a.order_index - b.order_index)
        const preview = exList.slice(0, 3)
        const remaining = exList.length - 3
        return (
          <Link href="/client/routine" className="card p-5 hover:border-brand-accent/30 transition-colors block space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center shrink-0">
                <Dumbbell className="w-5 h-5 text-brand-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-fg-primary text-sm">{activeRoutine.title}</div>
                <div className="text-xs text-fg-muted">{exList.length} ejercicios{activeRoutine.frequency ? ` · ${activeRoutine.frequency}` : ''}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-fg-muted shrink-0" />
            </div>
            {preview.length > 0 && (
              <div className="space-y-1.5">
                {preview.map((ex, i) => (
                  <div key={ex.id} className="flex items-center gap-2 text-xs text-fg-muted">
                    <span className="w-5 h-5 rounded-md bg-surface-2 border border-border flex items-center justify-center text-[10px] font-bold text-fg-muted shrink-0">{i + 1}</span>
                    <span className="flex-1 truncate">{ex.name}</span>
                    {ex.sets && ex.reps && (
                      <span className="text-fg-disabled shrink-0">{ex.sets}×{ex.reps}</span>
                    )}
                  </div>
                ))}
                {remaining > 0 && (
                  <p className="text-xs text-fg-disabled pl-7">+{remaining} más…</p>
                )}
              </div>
            )}
          </Link>
        )
      })()}

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-fg-muted mb-3 uppercase tracking-wide">Accesos rápidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/client/routine',      label: 'Mi Rutina',   icon: <Dumbbell className="w-6 h-6" />,    iconClass: 'bg-brand-accent/10 text-brand-accent' },
            { href: '/client/nutrition',    label: 'Nutrición',   icon: <Apple className="w-6 h-6" />,        iconClass: 'bg-semantic-info/10 text-semantic-info-text' },
            { href: '/client/progress',     label: 'Mi Progreso', icon: <TrendingUp className="w-6 h-6" />,   iconClass: 'bg-brand-secondary/10 text-brand-secondary-text' },
            { href: '/client/appointments', label: 'Mis Citas',   icon: <CalendarDays className="w-6 h-6" />, iconClass: 'bg-semantic-warning/10 text-semantic-warning-text' },
          ].map(({ href, label, icon, iconClass }) => (
            <Link
              key={href}
              href={href}
              className="card p-4 flex flex-col items-center gap-2 text-center hover:border-border-strong transition-colors group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${iconClass}`}>
                {icon}
              </div>
              <span className="text-xs font-medium text-fg-secondary group-hover:text-fg-primary transition-colors">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
