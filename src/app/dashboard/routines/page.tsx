'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Dumbbell, Plus, Search, ChevronDown, ChevronUp,
  Archive, RotateCcw, Trash2, GripVertical,
  Link as LinkIcon, X, Users,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { cn, formatDate } from '@/lib/utils'
import type { Profile, Routine, RoutineExercise, RoutineStatus } from '@/types/database'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoutineWithExtras extends Routine {
  exercises: RoutineExercise[]
  client: Profile | null
}

interface ExerciseDraft {
  id: string
  name: string
  sets: string
  reps: string
  rest_seconds: string
  notes: string
  video_url: string
}

function blankExercise(): ExerciseDraft {
  return { id: crypto.randomUUID(), name: '', sets: '', reps: '', rest_seconds: '', notes: '', video_url: '' }
}

const FREQUENCY_OPTIONS = [
  '1 día/semana', '2 días/semana', '3 días/semana',
  '4 días/semana', '5 días/semana', 'Diario', 'Personalizado',
]

// ─── Main Component ────────────────────────────────────────────────────────────

export default function RoutinesPage() {
  const supabase = createClient()

  const [routines, setRoutines] = useState<RoutineWithExtras[]>([])
  const [clients, setClients] = useState<Profile[]>([])
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filterClient, setFilterClient] = useState('')
  const [filterStatus, setFilterStatus] = useState<RoutineStatus | ''>('')

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setTrainerId(user.id)

    const [
      { data: routinesData },
      { data: exercisesData },
      { data: tcData },
    ] = await Promise.all([
      supabase.from('routines').select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('routine_exercises').select('*').order('order_index'),
      supabase.from('trainer_clients')
        .select('client_id, profile:client_id(id, full_name, avatar_url, phone, bio, specialties, role, created_at, updated_at)')
        .eq('trainer_id', user.id),
    ])

    const clientProfiles: Profile[] = (tcData ?? []).map(tc => tc.profile as unknown as Profile).filter(Boolean)
    setClients(clientProfiles)

    const clientMap = Object.fromEntries(clientProfiles.map(c => [c.id, c]))

    const enriched: RoutineWithExtras[] = (routinesData ?? []).map(r => ({
      ...r,
      status: r.status as RoutineStatus,
      exercises: (exercisesData ?? []).filter(e => e.routine_id === r.id),
      client: clientMap[r.client_id] ?? null,
    }))

    setRoutines(enriched)
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData() }, [loadData])

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const archiveRoutine = async (id: string, currentStatus: RoutineStatus) => {
    const newStatus: RoutineStatus = currentStatus === 'active' ? 'archived' : 'active'
    const { error } = await supabase.from('routines').update({ status: newStatus }).eq('id', id)
    if (error) { toast.error('Error: ' + error.message); return }
    toast.success(newStatus === 'archived' ? 'Rutina archivada' : 'Rutina restaurada')
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
  }

  // ── Filter logic ──────────────────────────────────────────────────────────

  const filtered = routines.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || r.title.toLowerCase().includes(q)
      || (r.client?.full_name.toLowerCase().includes(q) ?? false)
    const matchClient = !filterClient || r.client_id === filterClient
    const matchStatus = !filterStatus || r.status === filterStatus
    return matchSearch && matchClient && matchStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[#0EA5E9] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Rutinas</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gestiona los programas de entrenamiento</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nueva rutina
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Buscar rutinas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-auto"
          value={filterClient}
          onChange={e => setFilterClient(e.target.value)}
        >
          <option value="">Todos los clientes</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
        <select
          className="input w-auto"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as RoutineStatus | '')}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="archived">Archivadas</option>
        </select>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <span className="text-slate-400">{filtered.length} rutinas</span>
        <span className="text-slate-500">·</span>
        <span className="text-slate-400">{routines.filter(r => r.status === 'active').length} activas</span>
        <span className="text-slate-500">·</span>
        <span className="text-slate-400">{routines.filter(r => r.status === 'archived').length} archivadas</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Dumbbell />}
          title={search || filterClient || filterStatus ? 'Sin resultados' : 'Sin rutinas todavía'}
          description={search || filterClient || filterStatus ? 'Prueba con otros filtros.' : 'Crea la primera rutina para uno de tus clientes.'}
          action={!search && !filterClient && !filterStatus ? { label: 'Nueva rutina', onClick: () => setShowModal(true) } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(routine => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              expanded={expanded.has(routine.id)}
              onToggle={() => toggleExpand(routine.id)}
              onArchive={() => archiveRoutine(routine.id, routine.status)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <NewRoutineModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        trainerId={trainerId!}
        clients={clients}
        onSuccess={() => { setShowModal(false); loadData() }}
      />
    </div>
  )
}

// ─── Routine Card ─────────────────────────────────────────────────────────────

function RoutineCard({ routine, expanded, onToggle, onArchive }: {
  routine: RoutineWithExtras
  expanded: boolean
  onToggle: () => void
  onArchive: () => void
}) {
  return (
    <div className={cn('card overflow-hidden', routine.status === 'archived' && 'opacity-60')}>
      {/* Card header - clickable to expand */}
      <button
        type="button"
        className="w-full p-5 text-left hover:bg-[#334155]/20 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 flex items-center justify-center shrink-0">
            <Dumbbell size={18} className="text-[#0EA5E9]" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-white truncate">{routine.title}</span>
              <Badge status={routine.status} />
            </div>
            {routine.client && (
              <div className="flex items-center gap-2 mt-1.5">
                <Avatar name={routine.client.full_name} url={routine.client.avatar_url} size="sm" />
                <span className="text-sm text-slate-400">{routine.client.full_name}</span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              {routine.frequency && <span>{routine.frequency}</span>}
              <span>{routine.exercises.length} ejercicios</span>
              {routine.starts_at && <span>Inicio: {formatDate(routine.starts_at)}</span>}
              <span>Creada {formatDate(routine.created_at)}</span>
            </div>
          </div>
          <div className="shrink-0 ml-2">
            {expanded
              ? <ChevronUp size={16} className="text-slate-400" />
              : <ChevronDown size={16} className="text-slate-400" />
            }
          </div>
        </div>
      </button>

      {/* Expanded exercises */}
      {expanded && (
        <div className="border-t border-[#334155] px-5 pb-5 pt-4 space-y-3">
          {routine.description && (
            <p className="text-sm text-slate-300">{routine.description}</p>
          )}
          {routine.exercises.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Sin ejercicios añadidos</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#334155]">
                    <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide pr-3">#</th>
                    <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide pr-3">Ejercicio</th>
                    <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide pr-3">Series</th>
                    <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide pr-3">Reps</th>
                    <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide pr-3">Descanso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]/40">
                  {routine.exercises.map((ex, i) => (
                    <tr key={ex.id} className="group">
                      <td className="py-2 pr-3 text-slate-500 text-xs">{i + 1}</td>
                      <td className="py-2 pr-3">
                        <div>
                          <span className="text-slate-200 font-medium">{ex.name}</span>
                          {ex.notes && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[160px]">{ex.notes}</p>}
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-slate-400">{ex.sets ?? '—'}</td>
                      <td className="py-2 pr-3 text-slate-400">{ex.reps ?? '—'}</td>
                      <td className="py-2 text-slate-400">{ex.rest_seconds ? `${ex.rest_seconds}s` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onArchive}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              {routine.status === 'active'
                ? <><Archive size={13} /> Archivar</>
                : <><RotateCcw size={13} /> Restaurar</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── New Routine Modal (Multi-step) ───────────────────────────────────────────

function NewRoutineModal({ isOpen, onClose, trainerId, clients, onSuccess }: {
  isOpen: boolean
  onClose: () => void
  trainerId: string
  clients: Profile[]
  onSuccess: () => void
}) {
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 1 fields
  const [form, setForm] = useState({
    title: '', description: '', frequency: '',
    client_id: '', starts_at: '', ends_at: '',
  })

  // Step 2 exercises
  const [exercises, setExercises] = useState<ExerciseDraft[]>([blankExercise()])

  const resetAndClose = () => {
    setStep(1)
    setForm({ title: '', description: '', frequency: '', client_id: '', starts_at: '', ends_at: '' })
    setExercises([blankExercise()])
    onClose()
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return }
    if (!form.client_id) { toast.error('Selecciona un cliente'); return }
    setStep(2)
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: routine, error: routineError } = await supabase
      .from('routines')
      .insert({
        trainer_id: trainerId,
        client_id: form.client_id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        frequency: form.frequency || null,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
        status: 'active',
      })
      .select()
      .single()

    if (routineError || !routine) {
      toast.error('Error creando rutina: ' + (routineError?.message ?? 'Desconocido'))
      setSaving(false)
      return
    }

    const validExercises = exercises.filter(e => e.name.trim())
    if (validExercises.length > 0) {
      const { error: exError } = await supabase.from('routine_exercises').insert(
        validExercises.map((ex, i) => ({
          routine_id: routine.id,
          name: ex.name.trim(),
          sets: ex.sets ? Number(ex.sets) : null,
          reps: ex.reps.trim() || null,
          rest_seconds: ex.rest_seconds ? Number(ex.rest_seconds) : null,
          notes: ex.notes.trim() || null,
          video_url: ex.video_url.trim() || null,
          order_index: i,
        }))
      )
      if (exError) {
        toast.error('Rutina creada pero error en ejercicios: ' + exError.message)
      }
    }

    setSaving(false)
    toast.success('Rutina creada correctamente')
    resetAndClose()
    onSuccess()
  }

  const addExercise = () => setExercises(prev => [...prev, blankExercise()])
  const removeExercise = (id: string) => setExercises(prev => prev.filter(e => e.id !== id))
  const updateExercise = (id: string, field: keyof ExerciseDraft, value: string) => {
    setExercises(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e))
  }
  const moveExercise = (index: number, dir: -1 | 1) => {
    setExercises(prev => {
      const arr = [...prev]
      const target = index + dir
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]]
      return arr
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={`Nueva rutina · Paso ${step} de 2`} size="lg">
      {/* Step indicator */}
      <div className="flex gap-2 mb-6">
        {[1, 2].map(s => (
          <div key={s} className={cn(
            'flex-1 h-1.5 rounded-full transition-all',
            s <= step ? 'bg-[#0EA5E9]' : 'bg-[#334155]',
          )} />
        ))}
      </div>

      {/* Step 1: Basic info */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <div>
            <label className="label">Título *</label>
            <input className="input" placeholder="Ej: Programa fuerza 8 semanas" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea className="input resize-none" rows={2} placeholder="Objetivos, indicaciones generales..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="label">Frecuencia</label>
            <select className="input" value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}>
              <option value="">Seleccionar...</option>
              {FREQUENCY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="label flex items-center gap-1"><Users size={11} /> Cliente *</label>
            {clients.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">No tienes clientes activos.</p>
            ) : (
              <select className="input" value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))}>
                <option value="">Seleccionar cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            )}
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
            <button type="button" onClick={resetAndClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">
              Siguiente → Ejercicios
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Exercises builder */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Añade los ejercicios a la rutina <span className="font-semibold text-white">"{form.title}"</span></p>
            <span className="text-xs text-slate-500">{exercises.length} ejercicios</span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {exercises.map((ex, i) => (
              <div key={ex.id} className="rounded-lg border border-[#334155] bg-[#0F172A]/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button type="button" onClick={() => moveExercise(i, -1)} disabled={i === 0} className="text-slate-500 hover:text-slate-200 disabled:opacity-25 transition-colors">
                      <ChevronUp size={14} />
                    </button>
                    <button type="button" onClick={() => moveExercise(i, 1)} disabled={i === exercises.length - 1} className="text-slate-500 hover:text-slate-200 disabled:opacity-25 transition-colors">
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <GripVertical size={15} className="text-slate-600" />
                  <div className="flex-1 min-w-0">
                    <input
                      className="input text-sm"
                      placeholder={`Ejercicio ${i + 1} (ej: Sentadilla)`}
                      value={ex.name}
                      onChange={e => updateExercise(ex.id, 'name', e.target.value)}
                    />
                  </div>
                  <button type="button" onClick={() => removeExercise(ex.id)} className="text-slate-500 hover:text-red-400 transition-colors shrink-0">
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="label text-[10px]">Series</label>
                    <input type="number" className="input text-xs" placeholder="4" value={ex.sets} onChange={e => updateExercise(ex.id, 'sets', e.target.value)} />
                  </div>
                  <div>
                    <label className="label text-[10px]">Reps</label>
                    <input className="input text-xs" placeholder="8-12" value={ex.reps} onChange={e => updateExercise(ex.id, 'reps', e.target.value)} />
                  </div>
                  <div>
                    <label className="label text-[10px]">Descanso (s)</label>
                    <input type="number" className="input text-xs" placeholder="90" value={ex.rest_seconds} onChange={e => updateExercise(ex.id, 'rest_seconds', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="label text-[10px]">Notas</label>
                  <input className="input text-xs" placeholder="Indicaciones técnicas..." value={ex.notes} onChange={e => updateExercise(ex.id, 'notes', e.target.value)} />
                </div>

                <div className="flex items-center gap-2">
                  <LinkIcon size={12} className="text-slate-500 shrink-0" />
                  <input className="input text-xs" placeholder="URL vídeo (opcional)" value={ex.video_url} onChange={e => updateExercise(ex.id, 'video_url', e.target.value)} />
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addExercise} className="btn-secondary w-full text-sm border-dashed">
            <Plus size={15} /> Añadir ejercicio
          </button>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Atrás</button>
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Guardando...' : 'Guardar rutina'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
