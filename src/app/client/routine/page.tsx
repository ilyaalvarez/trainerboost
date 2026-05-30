'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Dumbbell, Check, Play, ChevronDown, ChevronUp, Loader2, Download, Timer, X } from 'lucide-react'
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

function categoryFor(name: string): { label: string; color: string } {
  const n = name.toLowerCase()
  if (/press|sentadilla|peso|curl|remo|dominada|fondo|hip thrust|peso muerto/.test(n)) {
    return { label: 'Fuerza', color: '#0EA5E9' }
  }
  if (/cardio|corre|correr|bici|remo ergo|eliptica|elíptica|cinta|salto|hiit/.test(n)) {
    return { label: 'Cardio', color: '#10B981' }
  }
  return { label: 'General', color: '#7C3AED' }
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

      const [{ data: r }, { data: comps }] = await Promise.all([
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
      ])

      if (r) {
        setRoutine(r)
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
        setExercises(prev => prev.map(ex => ex.id === exercise.id ? { ...ex, completed: true } : ex))
        toast.success('¡Ejercicio completado! 💪')
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
        icon={<Dumbbell className="w-8 h-8 text-slate-500" />}
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
          <h1 className="text-2xl font-bold text-white">{routine.title}</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {routine.frequency && `${routine.frequency} · `}
            {routine.starts_at && `Desde ${formatDate(routine.starts_at)}`}
          </p>
          {routine.description && (
            <p className="text-slate-400 text-sm mt-2">{routine.description}</p>
          )}
        </div>
        <button onClick={handleExportPdf} className="btn-secondary flex-shrink-0 text-sm">
          <Download className="w-4 h-4" />
          PDF
        </button>
      </div>

      {/* Progress bar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white">Progreso de hoy</span>
          <span className="font-mono text-sm font-bold text-brand-primary">{completedCount}/{exercises.length}</span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress === 100 && (
          <p className="text-emerald-400 text-sm font-semibold mt-3 text-center">
            🎉 ¡Sesión completada! Gran trabajo hoy.
          </p>
        )}
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {exercises.map((ex, i) => (
          <div
            key={ex.id}
            className={`card transition-all ${ex.completed ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}
          >
            <div className="flex items-center gap-4 p-4">
              {/* Number / Complete btn */}
              <button
                onClick={() => toggleComplete(ex)}
                disabled={completing === ex.id}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  ex.completed
                    ? 'bg-emerald-500 text-white'
                    : 'bg-surface-2 border border-border text-slate-400 hover:border-brand-primary hover:text-brand-primary'
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
                  <span className={`font-medium text-sm ${ex.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {ex.name}
                  </span>
                  {(() => {
                    const cat = categoryFor(ex.name)
                    return (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                        style={{ background: `${cat.color}1A`, borderColor: `${cat.color}33`, color: cat.color }}
                      >
                        {cat.label}
                      </span>
                    )
                  })()}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {ex.sets && <span className="text-xs text-slate-400">{ex.sets} series</span>}
                  {ex.reps && <span className="text-xs text-slate-400">× {ex.reps} reps</span>}
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
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          <X className="w-3 h-3" /> Saltar
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setTimer({ exerciseId: ex.id, remaining: ex.rest_seconds! })}
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-surface-2 border border-border text-slate-400 hover:text-brand-primary hover:border-brand-primary/40 transition-colors"
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
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-surface-2 transition-all"
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
                  <p className="text-sm text-slate-400 italic">&ldquo;{ex.notes}&rdquo;</p>
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
    </div>
  )
}
