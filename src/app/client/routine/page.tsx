'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Dumbbell, Check, Play, ChevronDown, ChevronUp, Loader2, Download, Timer, X, Clock, Pause } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Routine, RoutineExercise } from '@/types/database'
import { formatDate } from '@/lib/utils'
import EmptyState from '@/components/ui/EmptyState'
import { SetLogger } from '@/components/ui/SetLogger'

interface ExerciseWithCompletion extends RoutineExercise {
  completed: boolean
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function categoryFor(name: string): { label: string; bg: string; border: string; text: string } {
  const n = name.toLowerCase()
  if (/press|sentadilla|peso|curl|remo|dominada|fondo|hip thrust|peso muerto/.test(n)) {
    return { label: 'Fuerza', bg: 'bg-semantic-info/10', border: 'border-semantic-info/20', text: 'text-semantic-info-text' }
  }
  if (/cardio|corre|correr|bici|remo ergo|eliptica|elíptica|cinta|salto|hiit/.test(n)) {
    return { label: 'Cardio', bg: 'bg-brand-accent/10', border: 'border-brand-accent/20', text: 'text-brand-accent' }
  }
  return { label: 'General', bg: 'bg-brand-secondary/10', border: 'border-brand-secondary/20', text: 'text-brand-secondary-text' }
}

export default function ClientRoutinePage() {
  const supabase = useMemo(() => createClient(), [])
  const [routine, setRoutine]         = useState<Routine | null>(null)
  const [exercises, setExercises]     = useState<ExerciseWithCompletion[]>([])
  const [loading, setLoading]         = useState(true)
  const [expanded, setExpanded]       = useState<string | null>(null)
  const [completing, setCompleting]   = useState<string | null>(null)
  const [timer, setTimer]             = useState<{ exerciseId: string; remaining: number } | null>(null)
  const [userId, setUserId]           = useState<string | null>(null)
  const [trainerId, setTrainerId]     = useState<string | null>(null)
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [sessionRunning, setSessionRunning] = useState(false)
  const [recentWorkoutDays, setRecentWorkoutDays] = useState<string[]>([])

  useEffect(() => {
    if (!sessionRunning) return
    const id = setInterval(() => setSessionSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [sessionRunning])

  function formatSessionTime(secs: number) {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  useEffect(() => {
    if (!timer) return
    const id = setInterval(() => {
      setTimer(prev => {
        if (!prev) return null
        if (prev.remaining <= 1) {
          clearInterval(id)
          toast.success('¡Descanso completado! 💪')
          return null
        }
        return { ...prev, remaining: prev.remaining - 1 }
      })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer?.exerciseId])

  const fetchRoutine = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const today = new Date().toISOString().split('T')[0]

      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
      const [{ data: r }, { data: comps }, { data: recentComps }] = await Promise.all([
        supabase.from('routines')
          .select('*, exercises:routine_exercises(*)')
          .eq('client_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        supabase.from('exercise_completions')
          .select('exercise_id')
          .eq('client_id', user.id)
          .eq('completed_at', today),
        supabase.from('exercise_completions')
          .select('completed_at')
          .eq('client_id', user.id)
          .gte('completed_at', sevenDaysAgo)
          .order('completed_at', { ascending: false }),
      ])

      const uniqueDays = Array.from(new Set((recentComps ?? []).map((c: { completed_at: string }) => c.completed_at)))
      setRecentWorkoutDays(uniqueDays)

      if (r) {
        setRoutine(r)
        setTrainerId((r as { trainer_id: string }).trainer_id ?? null)
        const completedIds = new Set((comps || []).map((c: { exercise_id: string }) => c.exercise_id))
        const exList = ((r as { exercises: RoutineExercise[] }).exercises || [])
          .sort((a: RoutineExercise, b: RoutineExercise) => a.order_index - b.order_index)
          .map((ex: RoutineExercise) => ({ ...ex, completed: completedIds.has(ex.id) }))
        setExercises(exList)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchRoutine()
  }, [fetchRoutine])

  async function toggleComplete(exercise: ExerciseWithCompletion) {
    setCompleting(exercise.id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date().toISOString().split('T')[0]

    try {
      if (exercise.completed) {
        await supabase.from('exercise_completions')
          .delete()
          .eq('exercise_id', exercise.id)
          .eq('client_id', user.id)
          .eq('completed_at', today)
        setExercises(prev => prev.map(ex => ex.id === exercise.id ? { ...ex, completed: false } : ex))
      } else {
        const { error } = await supabase.from('exercise_completions').insert({
          exercise_id: exercise.id,
          client_id: user.id,
          completed_at: today,
        })
        if (error) { toast.error('Error al registrar'); return }
        const updatedExercises = exercises.map(ex => ex.id === exercise.id ? { ...ex, completed: true } : ex)
        setExercises(updatedExercises)
        // Check if this was the last exercise to complete
        const allDone = updatedExercises.every(ex => ex.completed)
        if (allDone && trainerId && userId) {
          supabase.from('notifications').insert({
            user_id: trainerId,
            type: 'routine',
            title: '¡Sesión completada!',
            body: `Tu cliente completó todos los ejercicios de "${routine?.title ?? 'su rutina'}"`,
            link: `/dashboard/clients/${userId}`,
          }).then(() => {})
          setSessionRunning(false)
        }
        toast.success(allDone ? '¡Sesión completada! 🎉' : '¡Ejercicio completado! 💪')
        // Auto-start timer on first exercise completion
        setSessionRunning(prev => { if (!prev && sessionSeconds === 0 && !allDone) return true; return prev })
      }
    } finally {
      setCompleting(null)
    }
  }

  const completedCount = exercises.filter(e => e.completed).length
  const progress = exercises.length ? Math.round((completedCount / exercises.length) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  if (!routine) {
    return (
      <EmptyState
        icon={<Dumbbell className="w-8 h-8 text-fg-muted" />}
        title="Sin rutina asignada"
        description="Tu entrenador aún no te ha asignado una rutina. Escríbele un mensaje para empezar."
        action={{ label: 'Escribir a mi entrenador', onClick: () => { window.location.href = '/client/messages' } }}
      />
    )
  }

  async function handleExportPdf() {
    if (!routine) return
    const { exportRoutinePdf } = await import('@/lib/exportPdf')
    await exportRoutinePdf({ ...routine, exercises: exercises as import('@/types/database').RoutineExercise[] }, '')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg-primary">{routine.title}</h1>
          <p className="text-fg-muted text-sm mt-0.5">
            {routine.frequency && `${routine.frequency} · `}
            {routine.starts_at && `Desde ${formatDate(routine.starts_at)}`}
          </p>
          {routine.description && (
            <p className="text-fg-muted text-sm mt-2">{routine.description}</p>
          )}
        </div>
        <button onClick={handleExportPdf} className="btn-secondary flex-shrink-0 text-sm">
          <Download className="w-4 h-4" />
          PDF
        </button>
      </div>

      {/* Progress bar + session timer */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-fg-primary">Progreso de hoy</span>
            {exercises.length > 0 && (() => {
              const totalSets = exercises.reduce((s, ex) => s + (ex.sets ?? 3), 0)
              const estSecs = exercises.reduce((s, ex) => {
                const sets = ex.sets ?? 3
                return s + sets * 30 + (sets - 1) * (ex.rest_seconds ?? 60)
              }, 0)
              const estMins = Math.ceil(estSecs / 60)
              return (
                <p className="text-xs text-fg-muted mt-0.5">{exercises.length} ejercicios · {totalSets} series · ~{estMins} min</p>
              )
            })()}
          </div>
          <div className="flex items-center gap-3">
            {/* Session timer */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSessionRunning(r => !r)}
                className={`p-1 rounded-md transition-colors ${sessionRunning ? 'text-brand-accent hover:text-semantic-success-text' : 'text-fg-muted hover:text-fg-secondary'}`}
                title={sessionRunning ? 'Pausar cronómetro' : 'Iniciar cronómetro'}
              >
                {sessionRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <span className={`font-mono text-sm font-bold ${sessionRunning ? 'text-brand-accent' : 'text-fg-muted'}`}>
                <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
                {formatSessionTime(sessionSeconds)}
              </span>
            </div>
            <span className="font-mono text-sm font-bold text-brand-primary">{completedCount}/{exercises.length}</span>
          </div>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-brand-primary' : 'bg-semantic-info'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress === 100 && (
          <div className="rounded-xl p-3 flex items-center gap-3 animate-fade-in bg-brand-accent/[0.08] border border-brand-accent/20">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-sm font-semibold text-semantic-success-text">¡Sesión completada!</p>
              <p className="text-xs text-fg-muted">{formatSessionTime(sessionSeconds)} · {exercises.length} ejercicios</p>
            </div>
          </div>
        )}
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {exercises.map((ex, i) => (
          <div
            key={ex.id}
            className={`card transition-all ${ex.completed ? 'border-semantic-success/30 bg-semantic-success/5' : ''}`}
          >
            <div className="flex items-center gap-4 p-4">
              {/* Number / Complete btn */}
              <button
                onClick={() => toggleComplete(ex)}
                disabled={completing === ex.id}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  ex.completed
                    ? 'bg-semantic-success text-white'
                    : 'bg-surface-2 border border-border text-fg-muted hover:border-brand-primary hover:text-brand-primary'
                }`}
              >
                {completing === ex.id
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : ex.completed
                    ? <Check className="w-4 h-4" />
                    : <span className="text-xs font-bold">{i + 1}</span>}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-medium text-sm ${ex.completed ? 'line-through text-fg-muted' : 'text-fg-primary'}`}>
                    {ex.name}
                  </span>
                  {(() => {
                    const cat = categoryFor(ex.name)
                    return (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cat.bg} ${cat.border} ${cat.text}`}>
                        {cat.label}
                      </span>
                    )
                  })()}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {ex.sets && <span className="text-xs text-fg-muted">{ex.sets} series</span>}
                  {ex.reps && <span className="text-xs text-fg-muted">× {ex.reps} reps</span>}
                  {ex.rest_seconds && (
                    timer?.exerciseId === ex.id ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="relative inline-flex items-center justify-center">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-brand-primary/30 animate-pulse-ring" />
                          <span className="relative font-mono text-xs font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/30 rounded-full px-2.5 py-1">
                            {timer.remaining}s
                          </span>
                        </span>
                        <button
                          onClick={() => setTimer(null)}
                          className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg-secondary transition-colors"
                        >
                          <X className="w-3 h-3" /> Saltar
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setTimer({ exerciseId: ex.id, remaining: ex.rest_seconds! })}
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-surface-2 border border-border text-fg-muted hover:text-brand-primary hover:border-brand-primary/40 transition-colors"
                      >
                        <Timer className="w-3 h-3" /> Descansar {ex.rest_seconds}s
                      </button>
                    )
                  )}
                </div>
              </div>

              {(ex.notes || ex.video_url) && (
                <button
                  onClick={() => setExpanded(expanded === ex.id ? null : ex.id)}
                  className="p-2 rounded-lg text-fg-muted hover:text-fg-secondary hover:bg-surface-2 transition-all"
                >
                  {expanded === ex.id
                    ? <ChevronUp className="w-4 h-4" />
                    : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Expanded notes/video */}
            {expanded === ex.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                {ex.notes && (
                  <p className="text-sm text-fg-muted italic">&ldquo;{ex.notes}&rdquo;</p>
                )}
                {ex.video_url && (() => {
                  const ytId = getYouTubeId(ex.video_url)
                  return ytId ? (
                    <div className="mt-3 rounded-xl overflow-hidden aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={ex.name}
                      />
                    </div>
                  ) : (
                    <a href={ex.video_url} target="_blank" rel="noopener noreferrer"
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 mt-2 w-fit">
                      <Play className="w-3.5 h-3.5" /> Ver vídeo
                    </a>
                  )
                })()}
              </div>
            )}

            {/* Per-set logging */}
            {userId && (
              <div className="px-4 pb-4">
                <SetLogger
                  exerciseId={ex.id}
                  clientId={userId}
                  defaultSets={ex.sets ?? 3}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent workout days (last 7 days) */}
      {recentWorkoutDays.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-fg-primary text-sm mb-3">Últimos 7 días</h2>
          <div className="flex gap-2 flex-wrap">
            {(() => {
              const today = new Date()
              return Array.from({ length: 7 }, (_, i) => {
                const d = new Date(today)
                d.setDate(today.getDate() - (6 - i))
                const dateStr = d.toISOString().split('T')[0]
                const hasWorkout = recentWorkoutDays.includes(dateStr)
                const isToday = dateStr === today.toISOString().split('T')[0]
                const label = d.toLocaleString('es-ES', { weekday: 'short' })
                return (
                  <div key={dateStr} className="flex flex-col items-center gap-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      hasWorkout
                        ? 'bg-brand-accent text-white'
                        : isToday
                          ? 'bg-surface-2 border-2 border-brand-primary/40 text-brand-primary'
                          : 'bg-surface-2 text-fg-disabled'
                    }`}>
                      {hasWorkout ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{d.getDate()}</span>}
                    </div>
                    <span className={`text-[10px] capitalize ${isToday ? 'text-brand-primary' : 'text-fg-disabled'}`}>
                      {label}
                    </span>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
