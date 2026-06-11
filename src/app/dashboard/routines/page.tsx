'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useDraftList } from '@/hooks/useDraftList'
import { toast } from 'sonner'
import {
  Dumbbell, Plus, Search, ChevronDown, ChevronUp,
  Archive, RotateCcw, GripVertical,
  Link as LinkIcon, X, Users, Copy,
  BookOpen, Pencil, Trash2, FileDown,
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

interface LibraryExercise {
  id: string
  trainer_id: string
  name: string
  description: string | null
  category: string | null
  muscle_group: string | null
  video_url: string | null
  default_sets: number | null
  default_reps: string | null
  default_rest: number | null
  created_at: string
}

interface GlobalExercise {
  id: string
  name: string
  category: string | null
  muscle_group: string | null
  muscles_secondary: string[]
  equipment: string | null
  difficulty: 'principiante' | 'intermedio' | 'avanzado' | null
  description: string | null
  default_sets: number | null
  default_reps: string | null
  default_rest: number | null
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

  const [activeTab, setActiveTab] = useState<'routines' | 'library'>('routines')

  const [search, setSearch] = useState('')
  const [filterClient, setFilterClient] = useState('')
  const [filterStatus, setFilterStatus] = useState<RoutineStatus | ''>('')

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [duplicating, setDuplicating] = useState<Set<string>>(new Set())

  const [libraryExercises, setLibraryExercises] = useState<LibraryExercise[]>([])
  const [globalExercises, setGlobalExercises] = useState<GlobalExercise[]>([])
  const [librarySearch, setLibrarySearch] = useState('')
  const [showLibraryForm, setShowLibraryForm] = useState(false)
  const [editingExercise, setEditingExercise] = useState<LibraryExercise | null>(null)

  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null)
  const [prefillExercise, setPrefillExercise] = useState<{
    name: string; sets: number | null; reps: string | null; rest_seconds: number | null; notes: string | null; video_url: string | null
  } | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setTrainerId(user.id)

      const [
        { data: routinesData },
        { data: tcData },
        { data: libData },
        { data: globalData },
      ] = await Promise.all([
        supabase.from('routines').select('*')
          .eq('trainer_id', user.id)
          .order('created_at', { ascending: false }),
        supabase.from('trainer_clients')
          .select('client_id, profile:client_id(id, full_name, avatar_url, phone, bio, specialties, role, created_at, updated_at)')
          .eq('trainer_id', user.id),
        supabase.from('exercise_library').select('*').eq('trainer_id', user.id).order('name'),
        supabase.from('global_exercises').select('*').order('category').order('name'),
      ])

      setLibraryExercises((libData ?? []) as LibraryExercise[])
      setGlobalExercises((globalData ?? []) as GlobalExercise[])

      const clientProfiles: Profile[] = (tcData ?? []).map(tc => tc.profile as unknown as Profile).filter(Boolean)
      setClients(clientProfiles)

      const clientMap = Object.fromEntries(clientProfiles.map(c => [c.id, c]))

      const routineIds = (routinesData ?? []).map((r: { id: string }) => r.id)
      let fetchedExercises: RoutineExercise[] = []
      if (routineIds.length > 0) {
        const { data: exData } = await supabase
          .from('routine_exercises')
          .select('*')
          .in('routine_id', routineIds)
          .order('order_index')
        fetchedExercises = (exData ?? []) as RoutineExercise[]
      }

      const enriched: RoutineWithExtras[] = (routinesData ?? []).map(r => ({
        ...r,
        status: r.status as RoutineStatus,
        exercises: fetchedExercises.filter(e => e.routine_id === r.id),
        client: clientMap[r.client_id] ?? null,
      }))

      setRoutines(enriched)
    } catch (err: unknown) {
      toast.error('Error al cargar las rutinas')
      console.error(err)
    } finally {
      setLoading(false)
    }
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
    if (!trainerId) return
    const newStatus: RoutineStatus = currentStatus === 'active' ? 'archived' : 'active'
    const { error } = await supabase.from('routines').update({ status: newStatus }).eq('id', id).eq('trainer_id', trainerId)
    if (error) { toast.error('Error: ' + error.message); return }
    toast.success(newStatus === 'archived' ? 'Rutina archivada' : 'Rutina restaurada')
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
  }

  const duplicateRoutine = async (id: string) => {
    setDuplicating(prev => { const n = new Set(prev); n.add(id); return n })
    try {
      const original = routines.find(r => r.id === id)
      if (!original) return

      const { data: exercises, error: exFetchError } = await supabase
        .from('routine_exercises')
        .select('*')
        .eq('routine_id', id)
        .order('order_index')
      if (exFetchError) { toast.error('Error al duplicar: ' + exFetchError.message); return }

      const { data: newRoutine, error: insertError } = await supabase
        .from('routines')
        .insert({
          trainer_id: original.trainer_id,
          client_id: original.client_id,
          title: `${original.title} (copia)`,
          description: original.description,
          frequency: original.frequency,
          starts_at: original.starts_at,
          ends_at: original.ends_at,
          status: 'active',
        })
        .select()
        .single()
      if (insertError || !newRoutine) { toast.error('Error al duplicar: ' + (insertError?.message ?? 'Desconocido')); return }

      if (exercises && exercises.length > 0) {
        const { error: exInsertError } = await supabase.from('routine_exercises').insert(
          exercises.map(({ id: _id, routine_id: _rid, ...rest }: RoutineExercise) => ({
            ...rest,
            routine_id: newRoutine.id,
          }))
        )
        if (exInsertError) { toast.error('Rutina duplicada pero error en ejercicios: ' + exInsertError.message) }
      }

      toast.success('Rutina duplicada ✓')
      loadData()
    } finally {
      setDuplicating(prev => { const n = new Set(prev); n.delete(id); return n })
    }
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
          <h1 className="text-2xl font-bold text-fg-primary">Rutinas</h1>
          <p className="text-fg-secondary text-sm mt-0.5">Gestiona los programas de entrenamiento</p>
        </div>
        {activeTab === 'routines' && (
          <button type="button" className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Nueva rutina
          </button>
        )}
        {activeTab === 'library' && (
          <button type="button" className="btn-primary" onClick={() => { setEditingExercise(null); setShowLibraryForm(true) }}>
            <Plus size={16} /> Nuevo ejercicio
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#334155]">
        <button
          type="button"
          onClick={() => setActiveTab('routines')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'routines'
              ? 'border-[#0EA5E9] text-[#0EA5E9]'
              : 'border-transparent text-fg-secondary hover:text-fg-primary',
          )}
        >
          <Dumbbell size={15} /> Rutinas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'library'
              ? 'border-[#0EA5E9] text-[#0EA5E9]'
              : 'border-transparent text-fg-secondary hover:text-fg-primary',
          )}
        >
          <BookOpen size={15} /> Biblioteca de ejercicios
        </button>
      </div>

      {/* ── Routines tab ── */}
      {activeTab === 'routines' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-secondary" />
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
            <span className="text-fg-secondary">{filtered.length} rutinas</span>
            <span className="text-fg-muted">·</span>
            <span className="text-fg-secondary">{routines.filter(r => r.status === 'active').length} activas</span>
            <span className="text-fg-muted">·</span>
            <span className="text-fg-secondary">{routines.filter(r => r.status === 'archived').length} archivadas</span>
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
                  onDuplicate={() => duplicateRoutine(routine.id)}
                  isDuplicating={duplicating.has(routine.id)}
                  onEdit={(r) => setEditingRoutine(r)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Library tab ── */}
      {activeTab === 'library' && (
        <ExerciseLibraryPanel
          exercises={libraryExercises}
          search={librarySearch}
          onSearchChange={setLibrarySearch}
          showForm={showLibraryForm}
          editingExercise={editingExercise}
          trainerId={trainerId!}
          onOpenCreate={() => { setEditingExercise(null); setShowLibraryForm(true) }}
          onOpenEdit={(ex) => { setEditingExercise(ex); setShowLibraryForm(true) }}
          onCloseForm={() => { setShowLibraryForm(false); setEditingExercise(null) }}
          onSaved={(updated) => setLibraryExercises(updated)}
          globalExercises={globalExercises}
          onUse={(ex) => {
            const videoUrl = 'video_url' in ex ? (ex as LibraryExercise).video_url : null
            setPrefillExercise({ name: ex.name, sets: ex.default_sets, reps: ex.default_reps, rest_seconds: ex.default_rest, notes: ex.description, video_url: videoUrl })
            setActiveTab('routines')
            setShowModal(true)
          }}
        />
      )}

      {/* New Routine Modal */}
      <NewRoutineModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setPrefillExercise(null) }}
        trainerId={trainerId!}
        clients={clients}
        onSuccess={() => { setShowModal(false); setPrefillExercise(null); loadData() }}
        prefill={prefillExercise}
      />

      {/* Edit Routine Modal */}
      <EditRoutineModal
        routine={editingRoutine}
        onClose={() => setEditingRoutine(null)}
        trainerId={trainerId!}
        clients={clients}
        onSuccess={() => { setEditingRoutine(null); loadData() }}
      />
    </div>
  )
}

// ─── Routine Card ─────────────────────────────────────────────────────────────

function RoutineCard({ routine, expanded, onToggle, onArchive, onDuplicate, isDuplicating, onEdit }: {
  routine: RoutineWithExtras
  expanded: boolean
  onToggle: () => void
  onArchive: () => void
  onDuplicate: () => void
  isDuplicating: boolean
  onEdit: (routine: Routine) => void
}) {
  const [exporting, setExporting] = useState(false)

  async function handleExportPdf() {
    setExporting(true)
    try {
      const { exportRoutinePdf } = await import('@/lib/exportPdf')
      await exportRoutinePdf({ ...routine, exercises: routine.exercises }, routine.client?.full_name ?? '')
    } catch { toast.error('Error al generar PDF') }
    finally { setExporting(false) }
  }
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
              <span className="font-semibold text-fg-primary truncate">{routine.title}</span>
              <Badge status={routine.status} />
            </div>
            {routine.client && (
              <div className="flex items-center gap-2 mt-1.5">
                <Avatar name={routine.client.full_name} url={routine.client.avatar_url} size="sm" />
                <span className="text-sm text-fg-secondary">{routine.client.full_name}</span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-fg-muted">
              {routine.frequency && <span>{routine.frequency}</span>}
              <span>{routine.exercises.length} ejercicios</span>
              {routine.starts_at && <span>Inicio: {formatDate(routine.starts_at)}</span>}
              <span>Creada {formatDate(routine.created_at)}</span>
            </div>
          </div>
          <div className="shrink-0 ml-2">
            {expanded
              ? <ChevronUp size={16} className="text-fg-secondary" />
              : <ChevronDown size={16} className="text-fg-secondary" />
            }
          </div>
        </div>
      </button>

      {/* Expanded exercises */}
      {expanded && (
        <div className="border-t border-[#334155] px-5 pb-5 pt-4 space-y-3">
          {routine.description && (
            <p className="text-sm text-fg-secondary">{routine.description}</p>
          )}
          {routine.exercises.length === 0 ? (
            <p className="text-sm text-fg-muted text-center py-4">Sin ejercicios añadidos</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#334155]">
                    <th className="text-left pb-2 text-xs font-semibold text-fg-secondary uppercase tracking-wide pr-3">#</th>
                    <th className="text-left pb-2 text-xs font-semibold text-fg-secondary uppercase tracking-wide pr-3">Ejercicio</th>
                    <th className="text-left pb-2 text-xs font-semibold text-fg-secondary uppercase tracking-wide pr-3">Series</th>
                    <th className="text-left pb-2 text-xs font-semibold text-fg-secondary uppercase tracking-wide pr-3">Reps</th>
                    <th className="text-left pb-2 text-xs font-semibold text-fg-secondary uppercase tracking-wide pr-3">Descanso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]/40">
                  {routine.exercises.map((ex, i) => (
                    <tr key={ex.id} className="group">
                      <td className="py-2 pr-3 text-fg-muted text-xs">{i + 1}</td>
                      <td className="py-2 pr-3">
                        <div>
                          <span className="text-fg-primary font-medium">{ex.name}</span>
                          {ex.notes && <p className="text-xs text-fg-muted mt-0.5 truncate max-w-[160px]">{ex.notes}</p>}
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-fg-secondary">{ex.sets ?? '—'}</td>
                      <td className="py-2 pr-3 text-fg-secondary">{ex.reps ?? '—'}</td>
                      <td className="py-2 text-fg-secondary">{ex.rest_seconds ? `${ex.rest_seconds}s` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
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
            <button
              type="button"
              onClick={() => onEdit(routine)}
              className="btn-ghost text-xs py-1 px-2 flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" /> Editar
            </button>
            <button
              type="button"
              onClick={onDuplicate}
              disabled={isDuplicating}
              className="btn-ghost text-xs py-1 px-2 flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />{isDuplicating ? '...' : 'Duplicar'}
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={exporting}
              className="btn-ghost text-xs py-1 px-2 flex items-center gap-1 ml-auto disabled:opacity-50"
            >
              <FileDown className="w-3 h-3" />{exporting ? 'Generando...' : 'PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── New Routine Modal (Multi-step) ───────────────────────────────────────────

function NewRoutineModal({ isOpen, onClose, trainerId, clients, onSuccess, prefill }: {
  isOpen: boolean
  onClose: () => void
  trainerId: string
  clients: Profile[]
  onSuccess: () => void
  prefill?: {
    name: string; sets: number | null; reps: string | null; rest_seconds: number | null; notes: string | null; video_url: string | null
  } | null
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
  const { items: exercises, setItems: setExercises, add: addExercise, remove: removeExercise,
          updateField: updateExercise, move: moveExercise, reset: resetExercises } = useDraftList(blankExercise)

  // When a prefill exercise is provided, inject it into step 2
  useEffect(() => {
    if (prefill) {
      setExercises(prev => [...prev, {
        id: crypto.randomUUID(),
        name: prefill.name,
        sets: prefill.sets?.toString() ?? '3',
        reps: prefill.reps ?? '10',
        rest_seconds: prefill.rest_seconds?.toString() ?? '60',
        notes: prefill.notes ?? '',
        video_url: prefill.video_url ?? '',
      }])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill])

  const resetAndClose = () => {
    setStep(1)
    setForm({ title: '', description: '', frequency: '', client_id: '', starts_at: '', ends_at: '' })
    resetExercises()
    onClose()
  }

  // Reset exercises list when modal is closed/reopened so prefill is clean
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setForm({ title: '', description: '', frequency: '', client_id: '', starts_at: '', ends_at: '' })
      resetExercises()
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

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

    // Notify the client — fire-and-forget, don't block UX on failure
    supabase.from('notifications').insert({
      user_id: form.client_id,
      type: 'routine',
      title: 'Nueva rutina asignada',
      body: `Tu entrenador te ha asignado una nueva rutina: ${form.title.trim()}`,
      link: '/client/routine',
    }).then(({ error: notifError }) => {
      if (notifError) console.error('Error sending routine notification:', notifError)
    })

    setSaving(false)
    toast.success('Rutina creada correctamente')
    resetAndClose()
    onSuccess()
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
              <p className="text-sm text-fg-secondary py-2">No tienes clientes activos.</p>
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
            <p className="text-sm text-fg-secondary">Añade los ejercicios a la rutina <span className="font-semibold text-fg-primary">&ldquo;{form.title}&rdquo;</span></p>
            <span className="text-xs text-fg-muted">{exercises.length} ejercicios</span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {exercises.map((ex, i) => (
              <div key={ex.id} className="rounded-lg border border-[#334155] bg-[#0F172A]/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button type="button" onClick={() => moveExercise(i, -1)} disabled={i === 0} className="text-fg-muted hover:text-fg-primary disabled:opacity-25 transition-colors">
                      <ChevronUp size={14} />
                    </button>
                    <button type="button" onClick={() => moveExercise(i, 1)} disabled={i === exercises.length - 1} className="text-fg-muted hover:text-fg-primary disabled:opacity-25 transition-colors">
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <GripVertical size={15} className="text-fg-disabled" />
                  <div className="flex-1 min-w-0">
                    <input
                      className="input text-sm"
                      placeholder={`Ejercicio ${i + 1} (ej: Sentadilla)`}
                      value={ex.name}
                      onChange={e => updateExercise(ex.id, 'name', e.target.value)}
                    />
                  </div>
                  <button type="button" onClick={() => removeExercise(ex.id)} className="text-fg-muted hover:text-semantic-error-text transition-colors shrink-0">
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
                  <LinkIcon size={12} className="text-fg-muted shrink-0" />
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

// ─── Edit Routine Modal ───────────────────────────────────────────────────────

function EditRoutineModal({ routine, onClose, clients, onSuccess }: {
  routine: Routine | null
  onClose: () => void
  trainerId?: string
  clients: Profile[]
  onSuccess: () => void
}) {
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [loadingExercises, setLoadingExercises] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', frequency: '',
    client_id: '', starts_at: '', ends_at: '',
  })

  const { items: exercises, setItems: setExercises, add: addExercise, remove: removeExercise,
          updateField: updateExercise, move: moveExercise } = useDraftList(blankExercise)

  // When routine changes (modal opens), populate form and fetch exercises
  useEffect(() => {
    if (!routine) return
    setStep(1)
    setForm({
      title:       routine.title,
      description: routine.description ?? '',
      frequency:   routine.frequency ?? '',
      client_id:   routine.client_id,
      starts_at:   routine.starts_at ?? '',
      ends_at:     routine.ends_at ?? '',
    })
    setLoadingExercises(true)
    supabase
      .from('routine_exercises')
      .select('*')
      .eq('routine_id', routine.id)
      .order('order_index')
      .then(({ data, error }) => {
        setLoadingExercises(false)
        if (error) { toast.error('Error al cargar ejercicios: ' + error.message); return }
        const loaded: ExerciseDraft[] = (data ?? []).map((ex: RoutineExercise) => ({
          id: ex.id,
          name: ex.name,
          sets: ex.sets?.toString() ?? '',
          reps: ex.reps ?? '',
          rest_seconds: ex.rest_seconds?.toString() ?? '',
          notes: ex.notes ?? '',
          video_url: ex.video_url ?? '',
        }))
        setExercises(loaded.length > 0 ? loaded : [blankExercise()])
      })
  }, [routine]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return }
    if (!form.client_id) { toast.error('Selecciona un cliente'); return }
    setStep(2)
  }

  const handleSave = async () => {
    if (!routine) return
    setSaving(true)

    const { error: updateError } = await supabase
      .from('routines')
      .update({
        title:       form.title.trim(),
        description: form.description.trim() || null,
        frequency:   form.frequency || null,
        client_id:   form.client_id,
        starts_at:   form.starts_at || null,
        ends_at:     form.ends_at || null,
      })
      .eq('id', routine.id)
      .eq('trainer_id', routine.trainer_id)

    if (updateError) {
      toast.error('Error al actualizar rutina: ' + updateError.message)
      setSaving(false)
      return
    }

    // DELETE all existing exercises and re-INSERT
    const { error: deleteError } = await supabase
      .from('routine_exercises')
      .delete()
      .eq('routine_id', routine.id)

    if (deleteError) {
      toast.error('Error al actualizar ejercicios: ' + deleteError.message)
      setSaving(false)
      return
    }

    const validExercises = exercises.filter(e => e.name.trim())
    if (validExercises.length > 0) {
      const { error: insertError } = await supabase.from('routine_exercises').insert(
        validExercises.map((ex, i) => ({
          routine_id:   routine.id,
          name:         ex.name.trim(),
          sets:         ex.sets ? Number(ex.sets) : null,
          reps:         ex.reps.trim() || null,
          rest_seconds: ex.rest_seconds ? Number(ex.rest_seconds) : null,
          notes:        ex.notes.trim() || null,
          video_url:    ex.video_url.trim() || null,
          order_index:  i,
        }))
      )
      if (insertError) {
        toast.error('Rutina actualizada pero error en ejercicios: ' + insertError.message)
      }
    }

    setSaving(false)
    toast.success('Rutina actualizada')
    onClose()
    onSuccess()
  }

  return (
    <Modal isOpen={!!routine} onClose={onClose} title={`Editar rutina · Paso ${step} de 2`} size="lg">
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
              <p className="text-sm text-fg-secondary py-2">No tienes clientes activos.</p>
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
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
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
            <p className="text-sm text-fg-secondary">Ejercicios de <span className="font-semibold text-fg-primary">&ldquo;{form.title}&rdquo;</span></p>
            <span className="text-xs text-fg-muted">{exercises.length} ejercicios</span>
          </div>

          {loadingExercises ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-[#0EA5E9] border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {exercises.map((ex, i) => (
                <div key={ex.id} className="rounded-lg border border-[#334155] bg-[#0F172A]/40 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-0.5">
                      <button type="button" onClick={() => moveExercise(i, -1)} disabled={i === 0} className="text-fg-muted hover:text-fg-primary disabled:opacity-25 transition-colors">
                        <ChevronUp size={14} />
                      </button>
                      <button type="button" onClick={() => moveExercise(i, 1)} disabled={i === exercises.length - 1} className="text-fg-muted hover:text-fg-primary disabled:opacity-25 transition-colors">
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <GripVertical size={15} className="text-fg-disabled" />
                    <div className="flex-1 min-w-0">
                      <input
                        className="input text-sm"
                        placeholder={`Ejercicio ${i + 1} (ej: Sentadilla)`}
                        value={ex.name}
                        onChange={e => updateExercise(ex.id, 'name', e.target.value)}
                      />
                    </div>
                    <button type="button" onClick={() => removeExercise(ex.id)} className="text-fg-muted hover:text-semantic-error-text transition-colors shrink-0">
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
                    <LinkIcon size={12} className="text-fg-muted shrink-0" />
                    <input className="input text-xs" placeholder="URL vídeo (opcional)" value={ex.video_url} onChange={e => updateExercise(ex.id, 'video_url', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <button type="button" onClick={addExercise} className="btn-secondary w-full text-sm border-dashed">
            <Plus size={15} /> Añadir ejercicio
          </button>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Atrás</button>
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Exercise Library Panel ───────────────────────────────────────────────────

const CATEGORY_OPTIONS = ['fuerza', 'cardio', 'flexibilidad', 'funcional'] as const
type Category = typeof CATEGORY_OPTIONS[number]

const CATEGORY_COLORS: Record<Category, string> = {
  fuerza:       'bg-[#0EA5E9]/15 text-[#0EA5E9]',
  cardio:       'bg-[#F59E0B]/15 text-[#F59E0B]',
  flexibilidad: 'bg-[#10B981]/15 text-[#10B981]',
  funcional:    'bg-[#A78BFA]/15 text-[#A78BFA]',
}

const GLOBAL_CAT_COLORS: Record<string, string> = {
  pecho:     'bg-[#0EA5E9]/15 text-[#0EA5E9]',
  espalda:   'bg-[#A78BFA]/15 text-[#A78BFA]',
  piernas:   'bg-[#10B981]/15 text-[#10B981]',
  hombros:   'bg-[#F59E0B]/15 text-[#F59E0B]',
  biceps:    'bg-[#EF4444]/15 text-[#EF4444]',
  triceps:   'bg-[#EC4899]/15 text-[#EC4899]',
  core:      'bg-[#06B6D4]/15 text-[#06B6D4]',
  cardio:    'bg-[#F97316]/15 text-[#F97316]',
  gluteos:   'bg-[#8B5CF6]/15 text-[#8B5CF6]',
  full_body: 'bg-[#84CC16]/15 text-[#84CC16]',
}
const GLOBAL_CAT_LABELS: Record<string, string> = {
  pecho: 'Pecho', espalda: 'Espalda', piernas: 'Piernas', hombros: 'Hombros',
  biceps: 'Bíceps', triceps: 'Tríceps', core: 'Core', cardio: 'Cardio',
  gluteos: 'Glúteos', full_body: 'Full Body',
}
const EQUIP_LABELS: Record<string, string> = {
  barra: 'Barra', mancuernas: 'Mancuernas', maquina: 'Máquina',
  bodyweight: 'Peso corporal', cable: 'Cable / Polea', kettlebell: 'Kettlebell',
}
const DIFF_COLORS: Record<string, string> = {
  principiante: 'text-semantic-success-text', intermedio: 'text-semantic-warning-text', avanzado: 'text-semantic-error-text',
}

interface LibraryFormState {
  name: string
  category: string
  muscle_group: string
  video_url: string
  default_sets: string
  default_reps: string
  default_rest: string
  description: string
}

function blankLibraryForm(): LibraryFormState {
  return { name: '', category: '', muscle_group: '', video_url: '', default_sets: '', default_reps: '', default_rest: '', description: '' }
}

function ExerciseLibraryPanel({
  exercises,
  globalExercises,
  search,
  onSearchChange,
  showForm,
  editingExercise,
  trainerId,
  onOpenCreate,
  onOpenEdit,
  onCloseForm,
  onSaved,
  onUse,
}: {
  exercises: LibraryExercise[]
  globalExercises: GlobalExercise[]
  search: string
  onSearchChange: (v: string) => void
  showForm: boolean
  editingExercise: LibraryExercise | null
  trainerId: string
  onOpenCreate: () => void
  onOpenEdit: (ex: LibraryExercise) => void
  onCloseForm: () => void
  onSaved: (updated: LibraryExercise[]) => void
  onUse: (ex: LibraryExercise | GlobalExercise) => void
}) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<LibraryFormState>(blankLibraryForm())
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [muscleFilter, setMuscleFilter] = useState<string>('')
  const [libView, setLibView] = useState<'catalog' | 'personal'>('catalog')
  const [catFilter, setCatFilter] = useState('')
  const [equipFilter, setEquipFilter] = useState('')
  const [diffFilter, setDiffFilter] = useState('')

  // Sync form when opening edit
  useEffect(() => {
    if (showForm) {
      if (editingExercise) {
        setForm({
          name:          editingExercise.name,
          category:      editingExercise.category ?? '',
          muscle_group:  editingExercise.muscle_group ?? '',
          video_url:     editingExercise.video_url ?? '',
          default_sets:  editingExercise.default_sets?.toString() ?? '',
          default_reps:  editingExercise.default_reps ?? '',
          default_rest:  editingExercise.default_rest?.toString() ?? '',
          description:   editingExercise.description ?? '',
        })
      } else {
        setForm(blankLibraryForm())
      }
    }
  }, [showForm, editingExercise])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return }
    setSaving(true)

    const payload = {
      trainer_id:   trainerId,
      name:         form.name.trim(),
      category:     form.category || null,
      muscle_group: form.muscle_group.trim() || null,
      video_url:    form.video_url.trim() || null,
      default_sets: form.default_sets ? Number(form.default_sets) : null,
      default_reps: form.default_reps.trim() || null,
      default_rest: form.default_rest ? Number(form.default_rest) : null,
      description:  form.description.trim() || null,
    }

    let error: { message: string } | null = null
    let newExercises: LibraryExercise[] = []

    if (editingExercise) {
      const { data, error: err } = await supabase
        .from('exercise_library')
        .update(payload)
        .eq('id', editingExercise.id)
        .select()
      error = err
      if (!err && data) {
        newExercises = exercises.map(ex => ex.id === editingExercise.id ? (data[0] as LibraryExercise) : ex)
        newExercises.sort((a, b) => a.name.localeCompare(b.name))
      }
    } else {
      const { data, error: err } = await supabase
        .from('exercise_library')
        .insert(payload)
        .select()
      error = err
      if (!err && data) {
        newExercises = [...exercises, data[0] as LibraryExercise]
        newExercises.sort((a, b) => a.name.localeCompare(b.name))
      }
    }

    setSaving(false)
    if (error) { toast.error('Error al guardar: ' + error.message); return }

    toast.success(editingExercise ? 'Ejercicio actualizado' : 'Ejercicio creado')
    onSaved(newExercises)
    onCloseForm()
  }

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return }
    const { error } = await supabase.from('exercise_library').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar: ' + error.message); return }
    toast.success('Ejercicio eliminado')
    setConfirmDelete(null)
    onSaved(exercises.filter(ex => ex.id !== id))
  }

  const uniqueMuscleGroups = Array.from(
    new Set(exercises.map(ex => ex.muscle_group).filter(Boolean) as string[])
  ).sort()

  const filtered = exercises.filter(ex => {
    const matchesSearch = !search.trim() || ex.name.toLowerCase().includes(search.toLowerCase())
    const matchesMuscle = !muscleFilter || ex.muscle_group === muscleFilter
    return matchesSearch && matchesMuscle
  })

  const filteredGlobal = globalExercises.filter(ex => {
    const q = search.toLowerCase()
    return (
      (!q || ex.name.toLowerCase().includes(q) || ex.muscle_group?.toLowerCase().includes(q) || ex.description?.toLowerCase().includes(q)) &&
      (!catFilter   || ex.category  === catFilter) &&
      (!equipFilter || ex.equipment === equipFilter) &&
      (!diffFilter  || ex.difficulty === diffFilter)
    )
  })

  const uniqueGlobalCats  = Array.from(new Set(globalExercises.map(e => e.category).filter(Boolean) as string[])).sort()
  const uniqueGlobalEquip = Array.from(new Set(globalExercises.map(e => e.equipment).filter(Boolean) as string[])).sort()

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-[#334155]">
        <button type="button" onClick={() => setLibView('catalog')}
                className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                  libView === 'catalog' ? 'border-[#0EA5E9] text-[#0EA5E9]' : 'border-transparent text-fg-secondary hover:text-fg-primary')}>
          <BookOpen size={14} /> Catálogo global
          <span className="ml-1 text-xs bg-[#0EA5E9]/15 text-[#0EA5E9] px-1.5 py-0.5 rounded-full font-bold">{globalExercises.length}</span>
        </button>
        <button type="button" onClick={() => setLibView('personal')}
                className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                  libView === 'personal' ? 'border-[#0EA5E9] text-[#0EA5E9]' : 'border-transparent text-fg-secondary hover:text-fg-primary')}>
          <Dumbbell size={14} /> Mi biblioteca
          {exercises.length > 0 && <span className="ml-1 text-xs bg-surface-3 text-fg-secondary px-1.5 py-0.5 rounded-full font-bold">{exercises.length}</span>}
        </button>
      </div>

      {/* Search bar (shared) */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-secondary" />
        <input className="input pl-9" placeholder={libView === 'catalog' ? 'Buscar en el catálogo...' : 'Buscar ejercicio...'}
               value={search} onChange={e => onSearchChange(e.target.value)} />
      </div>

      {/* ── CATALOG TAB ─────────────────────────────────────────────────────── */}
      {libView === 'catalog' && (
        <>
          {/* Filters row */}
          <div className="flex flex-wrap gap-2">
            <select className="input w-auto text-xs py-1.5" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">Todas las categorías</option>
              {uniqueGlobalCats.map(c => <option key={c} value={c}>{GLOBAL_CAT_LABELS[c] ?? c}</option>)}
            </select>
            <select className="input w-auto text-xs py-1.5" value={equipFilter} onChange={e => setEquipFilter(e.target.value)}>
              <option value="">Todo el equipamiento</option>
              {uniqueGlobalEquip.map(e => <option key={e} value={e}>{EQUIP_LABELS[e] ?? e}</option>)}
            </select>
            <select className="input w-auto text-xs py-1.5" value={diffFilter} onChange={e => setDiffFilter(e.target.value)}>
              <option value="">Cualquier nivel</option>
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
            {(catFilter || equipFilter || diffFilter) && (
              <button type="button" onClick={() => { setCatFilter(''); setEquipFilter(''); setDiffFilter('') }}
                      className="text-xs text-fg-secondary hover:text-fg-primary flex items-center gap-1 px-2">
                <X size={12} /> Limpiar
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="text-sm text-fg-secondary">
            {filteredGlobal.length} ejercicios
            {(search || catFilter || equipFilter || diffFilter) && <span className="text-fg-disabled"> de {globalExercises.length}</span>}
          </div>

          {/* Catalog grid */}
          {filteredGlobal.length === 0 ? (
            <EmptyState icon={<BookOpen />} title="Sin resultados" description="Prueba con otros filtros." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredGlobal.map(ex => (
                <div key={ex.id} className="card p-4 flex flex-col gap-2.5 hover:border-[#334155] transition-all">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-fg-primary text-sm leading-snug">{ex.name}</h3>
                      {ex.muscle_group && <p className="text-xs text-fg-secondary mt-0.5 truncate">{ex.muscle_group}</p>}
                    </div>
                    {ex.category && (
                      <span className={cn('shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full',
                        GLOBAL_CAT_COLORS[ex.category] ?? 'bg-surface-3 text-fg-secondary')}>
                        {GLOBAL_CAT_LABELS[ex.category] ?? ex.category}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {ex.equipment && (
                      <span className="text-[10px] bg-[#1E293B] border border-[#334155] text-fg-secondary px-1.5 py-0.5 rounded">
                        {EQUIP_LABELS[ex.equipment] ?? ex.equipment}
                      </span>
                    )}
                    {ex.difficulty && (
                      <span className={cn('text-[10px] font-medium capitalize', DIFF_COLORS[ex.difficulty])}>
                        {ex.difficulty}
                      </span>
                    )}
                  </div>

                  {ex.description && (
                    <p className="text-xs text-fg-muted line-clamp-2 leading-relaxed">{ex.description}</p>
                  )}

                  {(ex.default_sets ?? ex.default_reps ?? ex.default_rest) && (
                    <div className="flex gap-3 text-xs text-fg-muted">
                      {ex.default_sets && <span><span className="text-fg-secondary font-medium">{ex.default_sets}</span> ser.</span>}
                      {ex.default_reps && <span><span className="text-fg-secondary font-medium">{ex.default_reps}</span> reps</span>}
                      {ex.default_rest !== null && ex.default_rest !== undefined && ex.default_rest > 0 && (
                        <span><span className="text-fg-secondary font-medium">{ex.default_rest}s</span> desc.</span>
                      )}
                    </div>
                  )}

                  <div className="pt-1 border-t border-[#334155]/60">
                    <button type="button" onClick={() => onUse(ex)}
                            className="btn-primary text-xs py-1.5 px-3 w-full flex items-center justify-center gap-1">
                      <Plus size={12} /> Añadir a rutina
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── PERSONAL LIBRARY TAB ────────────────────────────────────────────── */}
      {libView === 'personal' && (
        <>
          {/* Muscle group chips */}
          {uniqueMuscleGroups.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setMuscleFilter('')}
                      className={cn('text-xs px-2.5 py-1 rounded-full border transition-all',
                        !muscleFilter ? 'bg-semantic-info/20 border-semantic-info/40 text-semantic-info-text' : 'border-border/60 text-fg-muted hover:text-fg-secondary')}>
                Todos
              </button>
              {uniqueMuscleGroups.map(mg => (
                <button key={mg} type="button" onClick={() => setMuscleFilter(f => f === mg ? '' : mg)}
                        className={cn('text-xs px-2.5 py-1 rounded-full border transition-all',
                          muscleFilter === mg ? 'bg-brand-secondary/20 border-brand-secondary/40 text-[#C4B5FD]' : 'border-border/60 text-fg-muted hover:text-fg-secondary')}>
                  {mg}
                </button>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-fg-secondary">{filtered.length} ejercicios</span>
            {(search || muscleFilter) && <span className="text-fg-muted">de {exercises.length} en biblioteca</span>}
          </div>

          {/* Exercise grid */}
          {filtered.length === 0 ? (
            <EmptyState icon={<BookOpen />}
              title={search ? 'Sin resultados' : 'Biblioteca vacía'}
              description={search ? 'Prueba con otro término.' : 'Crea tu primer ejercicio reutilizable.'}
              action={!search ? { label: 'Nuevo ejercicio', onClick: onOpenCreate } : undefined} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(ex => (
                <div key={ex.id} className="card p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-fg-primary truncate">{ex.name}</h3>
                      {ex.muscle_group && <p className="text-xs text-fg-secondary mt-0.5 truncate">{ex.muscle_group}</p>}
                    </div>
                    {ex.category && (
                      <span className={cn('shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize',
                        CATEGORY_COLORS[ex.category as Category] ?? 'bg-surface-3 text-fg-secondary')}>
                        {ex.category}
                      </span>
                    )}
                  </div>
                  {(ex.default_sets ?? ex.default_reps ?? ex.default_rest) && (
                    <div className="flex gap-3 text-xs text-fg-secondary">
                      {ex.default_sets && <span><span className="text-fg-primary font-medium">{ex.default_sets}</span> series</span>}
                      {ex.default_reps && <span><span className="text-fg-primary font-medium">{ex.default_reps}</span> reps</span>}
                      {ex.default_rest && <span><span className="text-fg-primary font-medium">{ex.default_rest}s</span> descanso</span>}
                    </div>
                  )}
                  {ex.description && <p className="text-xs text-fg-muted line-clamp-2">{ex.description}</p>}
                  <div className="flex items-center gap-1 mt-auto pt-1 border-t border-[#334155]">
                    <button type="button" onClick={() => onUse(ex)} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1">
                      <Plus size={12} /> Usar
                    </button>
                    <button type="button" onClick={() => onOpenEdit(ex)} className="btn-ghost text-xs py-1 px-2 flex items-center gap-1 ml-auto">
                      <Pencil size={12} /> Editar
                    </button>
                    {confirmDelete === ex.id ? (
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => handleDelete(ex.id)} className="btn-ghost text-xs py-1 px-2 text-semantic-error-text hover:text-semantic-error-text/80">Confirmar</button>
                        <button type="button" onClick={() => setConfirmDelete(null)} className="btn-ghost text-xs py-1 px-2 text-fg-secondary">No</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => handleDelete(ex.id)} className="btn-ghost text-xs py-1 px-2 flex items-center gap-1 text-semantic-error-text hover:text-semantic-error-text/80">
                        <Trash2 size={12} /> Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Form modal — outside tab conditions, always available */}
      <Modal isOpen={showForm} onClose={onCloseForm} title={editingExercise ? 'Editar ejercicio' : 'Nuevo ejercicio'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input className="input" placeholder="Ej: Sentadilla con barra" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Categoría</label>
              <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                <option value="">Seleccionar...</option>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Grupo muscular</label>
              <input className="input" placeholder="Ej: Cuádriceps, glúteos" value={form.muscle_group} onChange={e => setForm(p => ({ ...p, muscle_group: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Series</label>
              <input type="number" className="input" placeholder="4" value={form.default_sets} onChange={e => setForm(p => ({ ...p, default_sets: e.target.value }))} />
            </div>
            <div>
              <label className="label">Reps</label>
              <input className="input" placeholder="8-12" value={form.default_reps} onChange={e => setForm(p => ({ ...p, default_reps: e.target.value }))} />
            </div>
            <div>
              <label className="label">Descanso (s)</label>
              <input type="number" className="input" placeholder="90" value={form.default_rest} onChange={e => setForm(p => ({ ...p, default_rest: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label flex items-center gap-1"><LinkIcon size={11} /> URL vídeo</label>
            <input className="input" placeholder="https://youtube.com/..." value={form.video_url} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))} />
          </div>
          <div>
            <label className="label">Descripción / Instrucciones</label>
            <textarea className="input resize-none" rows={3} placeholder="Indicaciones técnicas, progresiones..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCloseForm} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Guardando...' : editingExercise ? 'Guardar cambios' : 'Crear ejercicio'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
