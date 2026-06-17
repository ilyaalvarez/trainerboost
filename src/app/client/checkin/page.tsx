'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Loader2, CheckCircle2, Flame, Smile, Moon,
  Dumbbell, Trophy, Zap, MessageSquare, ArrowRight, ArrowLeft,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface CheckinState {
  energy_level:         number | null
  mood:                 number | null
  sleep_hours:          string
  adherence_pct:        number | null
  biggest_win:          string
  biggest_challenge:    string
  questions_for_trainer: string
}

function blank(): CheckinState {
  return {
    energy_level: null,
    mood: null,
    sleep_hours: '',
    adherence_pct: null,
    biggest_win: '',
    biggest_challenge: '',
    questions_for_trainer: '',
  }
}

function ScaleRow({ value, onChange, color = '#8FD43A' }: {
  value: number | null; onChange: (v: number) => void; color?: string
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
                className={cn('w-10 h-10 rounded-xl text-sm font-bold transition-all border',
                  value === n
                    ? 'text-white border-transparent scale-110 shadow-lg'
                    : 'text-fg-muted border-border hover:border-border-strong')}
                style={value === n ? { background: color, boxShadow: `0 0 16px ${color}50` } : {}}>
          {n}
        </button>
      ))}
    </div>
  )
}

const STEPS = [
  { icon: Flame,         label: 'Energía',     color: '#F59E0B' },
  { icon: Smile,         label: 'Ánimo',       color: '#8FD43A' },
  { icon: Moon,          label: 'Sueño',       color: '#A78BFA' },
  { icon: Dumbbell,      label: 'Rutina',      color: '#0EA5E9' },
  { icon: Trophy,        label: 'Logro',       color: '#10B981' },
  { icon: Zap,           label: 'Reto',        color: '#F59E0B' },
  { icon: MessageSquare, label: 'Preguntas',   color: '#EC4899' },
]

export default function CheckinPage() {
  const router   = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading,     setLoading]     = useState(true)
  const [trainerId,   setTrainerId]   = useState<string | null>(null)
  const [trainerName, setTrainerName] = useState('')
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [step,        setStep]        = useState(0)
  const [form,        setForm]        = useState<CheckinState>(blank())
  const [submitting,  setSubmitting]  = useState(false)
  const [done,        setDone]        = useState(false)

  const weekStart = (() => {
    const d = new Date()
    const day = d.getDay()
    d.setDate(d.getDate() - ((day === 0 ? 7 : day) - 1))
    return d.toISOString().split('T')[0]
  })()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: tc } = await supabase
        .from('trainer_clients')
        .select('trainer_id, checkins_enabled, profiles!trainer_id(full_name)')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .single()

      if (!tc || !tc.checkins_enabled) { setLoading(false); return }

      setTrainerId(tc.trainer_id)
      setTrainerName((tc.profiles as unknown as { full_name: string })?.full_name ?? 'Tu entrenador')

      const { data: existing } = await supabase
        .from('weekly_checkins')
        .select('id')
        .eq('client_id', user.id)
        .eq('week_start', weekStart)
        .maybeSingle()

      if (existing) setAlreadyDone(true)
      setLoading(false)
    }
    init()
  }, [supabase, router, weekStart])

  function validateStep(): string | null {
    if (step === 0 && !form.energy_level)    return 'Selecciona tu nivel de energía'
    if (step === 1 && !form.mood)            return 'Selecciona tu estado de ánimo'
    if (step === 2) {
      const h = parseFloat(form.sleep_hours)
      if (!form.sleep_hours || isNaN(h) || h < 0 || h > 24) return 'Introduce horas de sueño válidas (0–24)'
    }
    if (step === 3 && form.adherence_pct === null) return 'Selecciona tu % de adherencia'
    if (step === 4 && !form.biggest_win.trim())    return 'Cuéntanos tu mayor logro'
    if (step === 5 && !form.biggest_challenge.trim()) return 'Cuéntanos tu mayor reto'
    return null
  }

  async function submit() {
    if (!trainerId) return
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('weekly_checkins').insert({
        client_id:             user.id,
        trainer_id:            trainerId,
        week_start:            weekStart,
        energy_level:          form.energy_level,
        mood:                  form.mood,
        sleep_hours:           form.sleep_hours ? parseFloat(form.sleep_hours) : null,
        adherence_pct:         form.adherence_pct,
        biggest_win:           form.biggest_win.trim() || null,
        biggest_challenge:     form.biggest_challenge.trim() || null,
        questions_for_trainer: form.questions_for_trainer.trim() || null,
      })

      if (error) { toast.error('Error al enviar: ' + error.message); return }

      supabase.from('notifications').insert({
        user_id: trainerId,
        type:    'checkin',
        title:   'Nuevo check-in recibido',
        body:    'Un cliente ha enviado su check-in semanal.',
        link:    '/dashboard/checkins',
      }).then(() => {})

      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-7 h-7 animate-spin text-brand-primary" />
      </div>
    )
  }

  if (!trainerId) {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4">
          <Dumbbell className="w-7 h-7 text-fg-muted" />
        </div>
        <h2 className="text-lg font-bold text-fg-primary mb-2">Check-in no activado</h2>
        <p className="text-fg-muted text-sm">Tu entrenador aún no ha activado los check-ins semanales para ti.</p>
        <button onClick={() => router.push('/client')} className="btn-secondary mt-6">← Volver al inicio</button>
      </div>
    )
  }

  if (alreadyDone) {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-semantic-success/20 border border-semantic-success/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-semantic-success-text" />
        </div>
        <h2 className="text-xl font-bold text-fg-primary mb-2">¡Ya enviaste tu check-in!</h2>
        <p className="text-fg-muted text-sm">Esta semana ya está registrada. Vuelve el próximo lunes.</p>
        <button onClick={() => router.push('/client')} className="btn-secondary mt-6">← Volver al inicio</button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-semantic-success/20 border border-semantic-success/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-semantic-success-text" />
        </div>
        <h2 className="text-2xl font-bold text-fg-primary mb-2">¡Enviado! 🎉</h2>
        <p className="text-fg-muted mb-2">{trainerName.split(' ')[0]} lo recibirá y te responderá pronto.</p>
        <p className="text-xs text-fg-disabled">
          Semana del {new Date(weekStart + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
        </p>
        <button onClick={() => router.push('/client')} className="btn-primary mt-8 px-8">Volver al inicio</button>
      </div>
    )
  }

  const CurrentIcon = STEPS[step].icon
  const currentColor = STEPS[step].color

  return (
    <div className="max-w-lg mx-auto animate-fade-in-up pb-24">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs text-brand-primary font-semibold uppercase tracking-widest mb-1">Check-in semanal</p>
        <h1 className="text-2xl font-bold text-fg-primary mb-1">¿Cómo fue tu semana?</h1>
        <p className="text-fg-muted text-sm">{trainerName.split(' ')[0]} revisa esto para ajustar tu plan.</p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-1 mb-2">
        {STEPS.map((s, i) => (
          <div key={s.label} className={cn('flex-1 h-1.5 rounded-full transition-all duration-300',
            i < step ? 'bg-brand-primary' : i === step ? 'bg-brand-primary/60' : 'bg-surface-2')} />
        ))}
      </div>
      <p className="text-xs text-fg-disabled mb-6">Pregunta {step + 1} de {STEPS.length}</p>

      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <CurrentIcon className="w-5 h-5" style={{ color: currentColor }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: currentColor }}>
            {STEPS[step].label}
          </span>
        </div>

        {/* STEP 0 — Energía */}
        {step === 0 && (
          <div>
            <h2 className="font-semibold text-fg-primary mb-1">Nivel de energía</h2>
            <p className="text-sm text-fg-muted mb-5">¿Cómo estuvo tu energía general esta semana?</p>
            <ScaleRow value={form.energy_level} onChange={v => setForm(p => ({ ...p, energy_level: v }))} color="#F59E0B" />
            <div className="flex justify-between text-xs text-fg-disabled mt-3 px-0.5">
              <span>Sin energía</span><span>Al máximo</span>
            </div>
          </div>
        )}

        {/* STEP 1 — Ánimo */}
        {step === 1 && (
          <div>
            <h2 className="font-semibold text-fg-primary mb-1">Estado de ánimo</h2>
            <p className="text-sm text-fg-muted mb-5">¿Cómo te sentiste emocionalmente esta semana?</p>
            <ScaleRow value={form.mood} onChange={v => setForm(p => ({ ...p, mood: v }))} color="#8FD43A" />
            <div className="flex justify-between text-xs text-fg-disabled mt-3 px-0.5">
              <span>Muy bajo</span><span>Excelente</span>
            </div>
          </div>
        )}

        {/* STEP 2 — Sueño */}
        {step === 2 && (
          <div>
            <h2 className="font-semibold text-fg-primary mb-1">Horas de sueño</h2>
            <p className="text-sm text-fg-muted mb-5">¿Cuántas horas dormiste de media esta semana?</p>
            <div className="relative max-w-[160px]">
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={form.sleep_hours}
                onChange={e => setForm(p => ({ ...p, sleep_hours: e.target.value }))}
                className="input pr-12 text-xl font-mono text-center"
                placeholder="7.5"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted text-sm font-medium">h</span>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              {[5, 6, 7, 8, 9].map(h => (
                <button key={h} type="button" onClick={() => setForm(p => ({ ...p, sleep_hours: String(h) }))}
                        className={cn('px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                          form.sleep_hours === String(h)
                            ? 'border-[#A78BFA]/50 bg-[#A78BFA]/10 text-[#A78BFA]'
                            : 'border-border text-fg-muted hover:border-border-strong')}>
                  {h}h
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 — Adherencia rutina */}
        {step === 3 && (
          <div>
            <h2 className="font-semibold text-fg-primary mb-1">Adherencia a la rutina</h2>
            <p className="text-sm text-fg-muted mb-5">¿Qué porcentaje de los entrenamientos completaste?</p>
            <div className="flex gap-2 flex-wrap">
              {[0, 25, 50, 75, 100].map(pct => (
                <button key={pct} type="button" onClick={() => setForm(p => ({ ...p, adherence_pct: pct }))}
                        className={cn('px-4 py-2.5 rounded-xl border text-sm font-bold transition-all',
                          form.adherence_pct === pct
                            ? 'bg-[#0EA5E9] text-white border-[#0EA5E9] shadow-lg scale-105'
                            : 'border-border text-fg-muted hover:border-border-strong')}>
                  {pct}%
                </button>
              ))}
            </div>
            {form.adherence_pct !== null && (
              <div className="mt-5 h-2 bg-surface-2 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                     style={{ width: `${form.adherence_pct}%`, background: '#0EA5E9' }} />
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — Mayor logro */}
        {step === 4 && (
          <div>
            <h2 className="font-semibold text-fg-primary mb-1">Tu mayor logro esta semana</h2>
            <p className="text-sm text-fg-muted mb-5">
              Puede ser algo físico, de hábitos, o simplemente haber aparecido. Todo cuenta.
            </p>
            <textarea
              value={form.biggest_win}
              onChange={e => setForm(p => ({ ...p, biggest_win: e.target.value }))}
              className="input resize-none text-sm w-full"
              rows={4}
              placeholder="Ej: Completé todos los entrenamientos de la semana sin fallar..."
              maxLength={500}
            />
            <p className="text-xs text-fg-disabled mt-1.5 text-right">{form.biggest_win.length}/500</p>
          </div>
        )}

        {/* STEP 5 — Mayor reto */}
        {step === 5 && (
          <div>
            <h2 className="font-semibold text-fg-primary mb-1">Tu mayor dificultad</h2>
            <p className="text-sm text-fg-muted mb-5">
              ¿Qué fue lo más difícil? Ser honesto aquí ayuda a tu entrenador a ajustar el plan.
            </p>
            <textarea
              value={form.biggest_challenge}
              onChange={e => setForm(p => ({ ...p, biggest_challenge: e.target.value }))}
              className="input resize-none text-sm w-full"
              rows={4}
              placeholder="Ej: Tuve mucho trabajo y no pude dormir bien los días de entreno..."
              maxLength={500}
            />
            <p className="text-xs text-fg-disabled mt-1.5 text-right">{form.biggest_challenge.length}/500</p>
          </div>
        )}

        {/* STEP 6 — Preguntas para el entrenador */}
        {step === 6 && (
          <div>
            <h2 className="font-semibold text-fg-primary mb-1">Preguntas para tu entrenador</h2>
            <p className="text-sm text-fg-muted mb-5">
              Opcional — si tienes dudas sobre la rutina, la dieta o cualquier otra cosa.
            </p>
            <textarea
              value={form.questions_for_trainer}
              onChange={e => setForm(p => ({ ...p, questions_for_trainer: e.target.value }))}
              className="input resize-none text-sm w-full"
              rows={4}
              placeholder="Ej: ¿Debería aumentar el peso en press de banca? ¿Puedo sustituir el pollo por pavo?"
              maxLength={500}
            />
            <p className="text-xs text-fg-disabled mt-1.5 text-right">{form.questions_for_trainer.length}/500</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1 flex items-center justify-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Anterior
          </button>
        ) : (
          <button type="button" onClick={() => router.push('/client')} className="btn-secondary flex-1">
            Cancelar
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button type="button"
                  onClick={() => {
                    const err = validateStep()
                    if (err) { toast.error(err); return }
                    setStep(s => s + 1)
                  }}
                  className="btn-gradient flex-1 flex items-center justify-center gap-1.5">
            Siguiente <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={submitting}
                  className="btn-gradient flex-1 flex items-center justify-center gap-1.5 disabled:opacity-50">
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
              : <><CheckCircle2 className="w-4 h-4" /> Enviar check-in</>}
          </button>
        )}
      </div>
    </div>
  )
}
