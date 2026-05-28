import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarDays, MessageSquare, TrendingUp, Dumbbell, ChevronRight } from 'lucide-react'
import { formatDate, formatRelative } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import type { Profile, Appointment } from '@/types/database'
import ProgressChart from './_components/ProgressChart'

export default async function ClientHomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: trainerRel },
    { data: progressLogs },
    { data: nextApt },
    { data: unreadMessages },
    { data: activeRoutine },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('trainer_clients')
      .select('*, trainer:trainer_id(id, full_name, avatar_url, bio, specialties)')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .single(),
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
      .single(),
    supabase.from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .is('read_at', null),
    supabase.from('routines')
      .select('*, exercises:routine_exercises(count)')
      .eq('client_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  const trainer = trainerRel?.trainer as Profile | null
  const latestLog = progressLogs?.at(-1)
  const prevLog   = progressLogs?.at(-2)
  const weightChange = latestLog && prevLog && latestLog.weight_kg && prevLog.weight_kg
    ? (latestLog.weight_kg - prevLog.weight_kg).toFixed(1)
    : null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Hola, {profile?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">{formatDate(new Date(), "EEEE, d MMMM")}</p>
      </div>

      {/* Trainer info */}
      {trainer && (
        <div className="card p-5 flex items-center gap-4">
          <Avatar name={trainer.full_name} url={trainer.avatar_url} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-400 mb-0.5">Tu entrenador</div>
            <div className="font-semibold text-white">{trainer.full_name}</div>
            {trainer.specialties?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {trainer.specialties.slice(0, 3).map(s => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-surface-2 border border-border text-slate-400">
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
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 text-center">
          <div className="font-mono text-2xl font-bold text-white">
            {latestLog?.weight_kg ?? '—'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Peso (kg)</div>
          {weightChange && (
            <div className={`text-xs font-semibold mt-1 ${parseFloat(weightChange) < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange} kg
            </div>
          )}
        </div>
        <div className="card p-4 text-center">
          <div className="font-mono text-2xl font-bold text-white">
            {latestLog?.body_fat_pct ?? '—'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Grasa %</div>
        </div>
        <div className="card p-4 text-center">
          <div className="font-mono text-2xl font-bold text-white">
            {latestLog?.muscle_mass_kg ?? '—'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Masa muscular</div>
        </div>
        <div className="card p-4 text-center">
          <div className="font-mono text-2xl font-bold text-white">
            {progressLogs?.length ?? 0}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Registros</div>
        </div>
      </div>

      {/* Progress chart */}
      {progressLogs && progressLogs.length >= 2 && (
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Evolución de peso</h2>
          <ProgressChart logs={progressLogs} />
        </div>
      )}

      {/* Next appointment */}
      {nextApt && (
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-3">Próxima cita</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-brand-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-white">{formatRelative(nextApt.scheduled_at)}</div>
              <div className="text-sm text-slate-400">
                {nextApt.duration_minutes}min · {nextApt.type}
                {nextApt.location && ` · ${nextApt.location}`}
              </div>
            </div>
            <Badge status={nextApt.status} />
          </div>
        </div>
      )}

      {/* Active routine preview */}
      {activeRoutine && (
        <Link href="/client/routine" className="card p-5 flex items-center gap-4 hover:border-brand-primary/30 transition-colors block">
          <div className="w-12 h-12 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-brand-accent" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-white">{activeRoutine.title}</div>
            <div className="text-sm text-slate-400">
              {(activeRoutine.exercises as { count: number }[])?.[0]?.count ?? 0} ejercicios · {activeRoutine.frequency}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </Link>
      )}
    </div>
  )
}
