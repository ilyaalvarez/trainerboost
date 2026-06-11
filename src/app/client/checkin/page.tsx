'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, Flame, Dumbbell, UtensilsCrossed, Scale, ArrowRight, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface CheckinState {
  energy:            number | null
  has_pain:          boolean
  pain_description:  string
  routine_adherence: number | null
  diet_adherence:    number | null
  weight_kg:         string
  client_note:       string
}

function blank(): CheckinState {
  return { energy: null, has_pain: false, pain_description: '', routine_adherence: null, diet_adherence: null, weight_kg: '', client_note: '' }
}

function ScaleRow({ value, onChange, min = 1, max = 10, color = '#0EA5E9' }: {
  value: number | null; onChange: (v: number) => void; min?: number; max?: number; color?: string
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
                className={cn('w-9 h-9 rounded-lg text-sm font-bold transition-all border',
                  value === n ? 'text-white border-transparent scale-110' : 'text-fg-muted border-border hover:border-border-strong')}
                style={value === n ? { background: color, boxShadow: `0 0 12px ${color}60` } : {}}>
          {n}
        </button>
      ))}
    </div>
  )
}

const STEPS = [
  { icon: Flame,          label: 'Energía',   color: '#F59E0B' },
  { icon: Dumbbell,       label: 'Rutina',    color: '#0EA5E9' },
  { icon: UtensilsCrossed,label: 'Dieta',     color: '#10B981' },
  { icon: Scale,          label: 'Peso',      color: '#A78BFA' },
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

      if (!tc || !tc.checkins_enabled) {
        setLoading(false)
        return
      }

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

  async function submit() {
    if (!trainerId) return
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('weekly_checkins').insert({
        client_id:          user.id,
        trainer_id:         trainerId,
        week_start:         weekStart,
        energy:             form.energy,
        has_pain:           form.has_pain,
        pain_description:   form.has_pain ? form.pain_description.trim() || null : null,
        routine_adherence:  form.routine_adherence,
        diet_adherence:     form.diet_adherence,
        weight_kg:          form.weight_kg ? parseFloat(form.weight_kg) : null,
        client_note:        form.client_note.trim() || null,
      })

      if (error) { toast.error('Error al enviar: ' + error.message); return }

      // Notify trainer
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
        <p className="text-xs text-fg-disabled">Semana del {new Date(weekStart + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>
        <button onClick={() => router.push('/client')} className="btn-primary mt-8 px-8">Volver al inicio</button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs text-brand-primary font-semibold uppercase tracking-widest mb-1">Check-in semanal</p>
        <h1 className="text-2xl font-bold text-fg-primary mb-1">¿Cómo fue tu semana?</h1>
        <p className="text-fg-muted text-sm">{trainerName.split(' ')[0]} revisa esto para ajustar tu plan.</p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.label} className={cn('flex-1 h-1.5 rounded-full transition-all duration-300',
            i <= step ? 'bg-brand-primary' : 'bg-surface-2')} />
        ))}
      </div>

      <div className="card p-6 space-y-6">

        {/* STEP 0 — Energía */}
        {step === 0 && (
          <>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5 text-semantic-warning-text" />
                <h2 className="font-semibold text-fg-primary">Energía general</h2>
              </div>
              <p className="text-sm text-fg-muted mb-4">¿Cómo estuvo tu nivel de energía esta semana?</p>
              <ScaleRow value={form.energy} onChange={v => setForm(p => ({ ...p, energy: v }))} color="#F59E0B" />
              <div className="flex justify-between text-xs text-fg-disabled mt-2 px-1">
                <span>Sin energía</span><span>Perfecto</span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={cn('w-12 h-6 rounded-full transition-all duration-200 relative flex-shrink-0',
                  form.has_pain ? 'bg-semantic-error' : 'bg-surface-2 border border-border')}
                     onClick={() => setForm(p => ({ ...p, has_pain: !p.has_pain }))}>
                  <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200',
                    form.has_pain ? 'right-0.5' : 'left-0.5')} />
                </div>
                <span className="text-sm text-fg-secondary group-hover:text-fg-primary transition-colors">
                  Tuve dolor o molestias esta semana
                </span>
              </label>
              {form.has_pain && (
                <textarea
                  value={form.pain_description}
                  onChange={e => setForm(p => ({ ...p, pain_description: e.target.value }))}
                  className="input mt-3 resize-none text-sm"
                  rows={2}
                  placeholder="¿Dónde y cuándo? (ej: rodilla izquierda al correr)"
                  maxLength={200}
                />
              )}
            </div>
          </>
        )}

        {/* STEP 1 — Rutina */}
        {step === 1 && (
          <>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="w-5 h-5 text-[#0EA5E9]" />
                <h2 className="font-semibold text-fg-primary">Adherencia a la rutina</h2>
              </div>
              <p className="text-sm text-fg-muted mb-4">¿Qué porcentaje de los entrenamientos completaste?</p>
              <div className="flex gap-2 flex-wrap">
                {[0, 25, 50, 75, 100].map(pct => (
                  <button key={pct} type="button" onClick={() => setForm(p => ({ ...p, routine_adherence: pct }))}
                          className={cn('px-4 py-2 rounded-lg text-sm font-semibold border transition-all',
                            form.routine_adherence === pct
                              ? 'bg-[#0EA5E9] text-white border-[#0EA5E9]'
                              : 'border-border text-fg-muted hover:border-border-strong')}>
                    {pct}%
                  </button>
                ))}
              </div>
              {form.routine_adherence !== null && (
                <div className="mt-4 h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                       style={{ width: `${form.routine_adherence}%`, background: '#0EA5E9' }} />
                </div>
              )}
            </div>
          </>
        )}

        {/* STEP 2 — Dieta */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UtensilsCrossed className="w-5 h-5 text-semantic-success-text" />
              <h2 className="font-semibold text-fg-primary">Adherencia a la dieta</h2>
            </div>
            <p className="text-sm text-fg-muted mb-4">¿Cómo seguiste el plan nutricional?</p>
            <ScaleRow value={form.diet_adherence} onChange={v => setForm(p => ({ ...p, diet_adherence: v }))} color="#10B981" />
            <div className="flex justify-between text-xs text-fg-disabled mt-2 px-1">
              <span>No seguí nada</span><span>Al 100%</span>
            </div>
          </div>
        )}

        {/* STEP 3 — Peso + nota */}
        {step === 3 && (
          <>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-5 h-5 text-[#C4B5FD]" />
                <h2 className="font-semibold text-fg-primary">Peso actual</h2>
              </div>
              <p className="text-sm text-fg-muted mb-3">Opcional — si te pesaste esta semana.</p>
              <div className="relative">
                <input type="number" step="0.1" min="30" max="300"
                       value={form.weight_kg}
                       onChange={e => setForm(p => ({ ...p, weight_kg: e.target.value }))}
                       className="input pr-10 text-lg font-mono"
                       placeholder="ej: 75.2" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted text-sm font-medium">kg</span>
              </div>
            </div>

            <div>
              <label className="label">Nota para tu entrenador <span className="text-fg-disabled">(opcional)</span></label>
              <textarea value={form.client_note}
                        onChange={e => setForm(p => ({ ...p, client_note: e.target.value }))}
                        className="input resize-none text-sm"
                        rows={3}
                        placeholder="¿Algo que quieras comentarle? Dudas, logros, dificultades..."
                        maxLength={500} />
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1">
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
                    if (step === 0 && !form.energy) { toast.error('Selecciona tu nivel de energía'); return }
                    if (step === 1 && form.routine_adherence === null) { toast.error('Selecciona el % de adherencia'); return }
                    if (step === 2 && !form.diet_adherence) { toast.error('Selecciona tu adherencia a la dieta'); return }
                    setStep(s => s + 1)
                  }}
                  className="btn-gradient flex-1">
            Siguiente <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={submitting} className="btn-gradient flex-1 disabled:opacity-50">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <>Enviar check-in <CheckCircle2 className="w-4 h-4" /></>}
          </button>
        )}
      </div>
    </div>
  )
}
