'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CheckCircle2, Circle, Loader2, Flame, BarChart2 } from 'lucide-react'
import type { Habit, HabitLog } from '@/types/database'
import { cn } from '@/lib/utils'

interface HabitWithToday extends Habit {
  completedToday: boolean
  streak: number
  weekLogs: boolean[]
}

export default function ClientHabitsPage() {
  const supabase = createClient()
  const [habits, setHabits] = useState<HabitWithToday[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

    const { data: rawHabits } = await supabase
      .from('habits')
      .select('*')
      .eq('client_id', user.id)
      .eq('is_active', true)
      .order('created_at')

    if (!rawHabits?.length) { setHabits([]); setLoading(false); return }

    // Logs de los últimos 30 días para cálculos de racha
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
    const { data: logs } = await supabase
      .from('habit_logs')
      .select('habit_id, logged_date, completed')
      .eq('client_id', user.id)
      .gte('logged_date', thirtyDaysAgo)

    const logsByHabit = (logs ?? []).reduce((acc, l) => {
      if (!acc[l.habit_id]) acc[l.habit_id] = {}
      acc[l.habit_id][l.logged_date] = l.completed
      return acc
    }, {} as Record<string, Record<string, boolean>>)

    const withStats: HabitWithToday[] = rawHabits.map(h => {
      const hLogs = logsByHabit[h.id] ?? {}
      const completedToday = hLogs[today] === true

      // Racha: días consecutivos hacia atrás desde ayer (o hoy si completado)
      let streak = 0
      const startDay = completedToday ? 0 : 1
      for (let i = startDay; i < 60; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
        if (hLogs[d] === true) streak++
        else if (i > 0 || !completedToday) break
      }

      // Últimos 7 días para la barra visual
      const weekLogs = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0]
        return hLogs[d] === true
      })

      return { ...h, completedToday, streak, weekLogs }
    })

    setHabits(withStats)
    setLoading(false)
  }, [supabase, today])

  useEffect(() => { load() }, [load])

  async function toggle(habit: HabitWithToday) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || toggling) return
    setToggling(habit.id)

    if (habit.completedToday) {
      await supabase.from('habit_logs')
        .delete()
        .eq('habit_id', habit.id)
        .eq('client_id', user.id)
        .eq('logged_date', today)
      setHabits(h => h.map(x => x.id === habit.id ? { ...x, completedToday: false } : x))
    } else {
      const { error } = await supabase.from('habit_logs').upsert({
        habit_id: habit.id,
        client_id: user.id,
        logged_date: today,
        completed: true,
      }, { onConflict: 'habit_id,logged_date' })
      if (!error) {
        setHabits(h => h.map(x => x.id === habit.id ? { ...x, completedToday: true } : x))
        if (habit.streak > 0 && (habit.streak + 1) % 7 === 0) {
          toast.success(`🔥 ¡${habit.streak + 1} días de racha! Sigue así.`)
        } else {
          toast.success(`${habit.icon} ¡${habit.name} completado!`)
        }
      }
    }
    await load()
    setToggling(null)
  }

  const completedCount = habits.filter(h => h.completedToday).length
  const totalCount = habits.length

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-fg-muted" /></div>
  )

  if (habits.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 text-center px-6">
      <CheckCircle2 className="w-10 h-10 text-fg-disabled mb-3" />
      <h2 className="font-semibold text-fg-primary mb-1">Sin hábitos todavía</h2>
      <p className="text-sm text-fg-muted">Tu entrenador aún no ha asignado hábitos. ¡Pronto estarán aquí!</p>
    </div>
  )

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Resumen del día */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-fg-primary">Hábitos de hoy</h1>
          <span className={cn('text-sm font-bold font-mono',
            completedCount === totalCount ? 'text-emerald-400' : 'text-fg-muted')}>
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-brand-primary transition-all duration-700"
               style={{ width: totalCount ? `${(completedCount / totalCount) * 100}%` : '0%' }} />
        </div>
        {completedCount === totalCount && totalCount > 0 && (
          <p className="text-xs text-emerald-400 font-medium mt-2 text-center animate-fade-in-up">
            🎉 ¡Todos los hábitos completados hoy!
          </p>
        )}
      </div>

      {/* Lista de hábitos */}
      <div className="space-y-3">
        {habits.map(h => (
          <div key={h.id} className={cn(
            'card p-4 transition-all duration-200',
            h.completedToday && 'border-emerald-500/20 bg-emerald-500/3'
          )}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggle(h)}
                disabled={toggling === h.id}
                className={cn(
                  'w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl transition-all duration-200 shrink-0',
                  h.completedToday
                    ? 'border-emerald-500/40 bg-emerald-500/10 scale-95'
                    : 'border-border hover:border-brand-primary/40 hover:bg-brand-primary/5 hover:scale-105'
                )}
                aria-label={h.completedToday ? 'Desmarcar hábito' : 'Marcar hábito como completado'}
              >
                {toggling === h.id ? (
                  <Loader2 className="w-5 h-5 animate-spin text-fg-muted" />
                ) : h.completedToday ? (
                  '✅'
                ) : (
                  h.icon
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className={cn('font-medium text-sm',
                  h.completedToday ? 'text-emerald-400' : 'text-fg-primary')}>
                  {h.name}
                </div>
                <div className="text-xs text-fg-muted mt-0.5">{h.target_days_per_week}x por semana</div>

                {/* Últimos 7 días */}
                <div className="flex gap-1 mt-2">
                  {h.weekLogs.map((done, i) => {
                    const isToday = i === 6
                    return (
                      <div key={i}
                           className={cn(
                             'w-5 h-5 rounded-sm border transition-colors',
                             done
                               ? isToday ? 'bg-emerald-400 border-emerald-400' : 'bg-emerald-500/30 border-emerald-500/40'
                               : isToday ? 'bg-brand-primary/10 border-brand-primary/30' : 'bg-surface-2 border-border'
                           )}>
                        {done && <div className="w-full h-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                        </div>}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Racha */}
              {h.streak > 0 && (
                <div className="flex flex-col items-center shrink-0">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Flame className="w-3.5 h-3.5" />
                    <span className="text-sm font-bold font-mono">{h.streak}</span>
                  </div>
                  <span className="text-[10px] text-fg-disabled">días</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
