'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CheckSquare, Plus, Trash2, Loader2, BarChart2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import type { Habit, Profile } from '@/types/database'
import { cn } from '@/lib/utils'

interface HabitWithStats extends Habit {
  client_profile: Pick<Profile, 'full_name' | 'avatar_url'>
  adherence_30d: number
}

interface ClientOption {
  client_id: string
  profile: Pick<Profile, 'full_name' | 'avatar_url'>
}

const PRESET_HABITS = [
  { name: 'Beber 2L de agua al día', icon: '💧' },
  { name: 'Dormir 8 horas', icon: '😴' },
  { name: '10.000 pasos diarios', icon: '🚶' },
  { name: 'Sin alcohol esta semana', icon: '🚫' },
  { name: 'Preparar comida del día anterior', icon: '🥗' },
  { name: 'Estiramientos 10 minutos', icon: '🧘' },
]

export default function HabitsPage() {
  const supabase = createClient()
  const [habits, setHabits] = useState<HabitWithStats[]>([])
  const [clients, setClients] = useState<ClientOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterClient, setFilterClient] = useState<string>('all')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    icon: '✅',
    target_days_per_week: 7,
    client_ids: [] as string[],
  })

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

    const [{ data: h }, { data: cl }] = await Promise.all([
      supabase
        .from('habits')
        .select('*, client_profile:client_id(full_name, avatar_url)')
        .eq('trainer_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('trainer_clients')
        .select('client_id, profile:client_id(full_name, avatar_url)')
        .eq('trainer_id', user.id)
        .eq('status', 'active'),
    ])

    // Batch-fetch all habit logs in one query (avoids N+1)
    const habitIds = (h ?? []).map((x: HabitWithStats) => x.id)
    const { data: logs } = habitIds.length > 0
      ? await supabase
          .from('habit_logs')
          .select('habit_id')
          .in('habit_id', habitIds)
          .eq('completed', true)
          .gte('logged_date', thirtyDaysAgo)
      : { data: [] }

    const countByHabit = (logs ?? []).reduce((acc, l) => {
      acc[l.habit_id] = (acc[l.habit_id] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)

    const habitsWithStats: HabitWithStats[] = (h ?? []).map((habit: HabitWithStats) => ({
      ...habit,
      adherence_30d: Math.min(100, Math.round(((countByHabit[habit.id] ?? 0) / Math.max(1, (habit.target_days_per_week / 7) * 30)) * 100)),
    }))

    setHabits(habitsWithStats)
    setClients((cl ?? []) as unknown as ClientOption[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  function toggleClient(id: string) {
    setForm(f => ({
      ...f,
      client_ids: f.client_ids.includes(id)
        ? f.client_ids.filter(c => c !== id)
        : [...f.client_ids, id],
    }))
  }

  function applyPreset(preset: typeof PRESET_HABITS[0]) {
    setForm(f => ({ ...f, name: preset.name, icon: preset.icon }))
  }

  async function createHabits(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || form.client_ids.length === 0) {
      toast.error('Nombre y al menos un cliente son obligatorios')
      return
    }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('habits').insert(
      form.client_ids.map(client_id => ({
        trainer_id: user.id,
        client_id,
        name: form.name,
        icon: form.icon,
        target_days_per_week: form.target_days_per_week,
        is_active: true,
      }))
    )

    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success(`Hábito asignado a ${form.client_ids.length} cliente${form.client_ids.length > 1 ? 's' : ''}`)
    setShowModal(false)
    setForm({ name: '', icon: '✅', target_days_per_week: 7, client_ids: [] })
    await load()
    setSaving(false)
  }

  async function deleteHabit(id: string) {
    await supabase.from('habits').update({ is_active: false }).eq('id', id)
    setDeleteConfirmId(null)
    await load()
    toast.success('Hábito desactivado')
  }

  const filtered = filterClient === 'all'
    ? habits
    : habits.filter(h => h.client_id === filterClient)

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-fg-muted" /></div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fg-primary">Hábitos diarios</h1>
          <p className="text-fg-muted text-sm mt-1">
            Asigna hábitos a tus clientes para mejorar su adherencia entre sesiones.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Asignar hábito
        </button>
      </div>

      {/* Filtro por cliente */}
      {clients.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterClient('all')}
                  className={cn('text-xs px-3 py-1.5 rounded-full border transition-all',
                    filterClient === 'all' ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary font-medium' : 'border-border text-fg-muted hover:border-border-bright')}>
            Todos
          </button>
          {clients.map(c => (
            <button key={c.client_id} onClick={() => setFilterClient(c.client_id)}
                    className={cn('text-xs px-3 py-1.5 rounded-full border transition-all',
                      filterClient === c.client_id ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary font-medium' : 'border-border text-fg-muted hover:border-border-bright')}>
              {c.profile.full_name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-8 h-8" />}
          title="Sin hábitos asignados"
          description="Asigna hábitos diarios a tus clientes para mejorar su adherencia."
          action={<button onClick={() => setShowModal(true)} className="btn-primary text-sm">Asignar primer hábito</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(h => (
            <div key={h.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{h.icon}</span>
                  <div>
                    <div className="font-semibold text-fg-primary text-sm">{h.name}</div>
                    <div className="text-xs text-fg-muted">{h.client_profile.full_name}</div>
                  </div>
                </div>
                <button onClick={() => setDeleteConfirmId(h.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-transparent text-fg-disabled hover:border-semantic-error/20 hover:text-semantic-error-text hover:bg-semantic-error/8 transition-all shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs text-fg-muted">{h.target_days_per_week}/7 días por semana</div>

              {/* Adherencia */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1 text-fg-muted"><BarChart2 className="w-3 h-3" /> Adherencia 30d</span>
                  <span className={cn('font-mono font-semibold', h.adherence_30d >= 70 ? 'text-emerald-400' : h.adherence_30d >= 40 ? 'text-amber-400' : 'text-semantic-error-text')}>
                    {h.adherence_30d}%
                  </span>
                </div>
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                       style={{
                         width: `${h.adherence_30d}%`,
                         background: h.adherence_30d >= 70 ? '#10B981' : h.adherence_30d >= 40 ? '#F59E0B' : '#EF4444',
                       }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm delete */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="¿Desactivar hábito?">
        <p className="text-sm text-fg-secondary mb-5">El hábito dejará de aparecer en el portal del cliente. Puedes volver a asignarlo cuando quieras.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={() => deleteConfirmId && deleteHabit(deleteConfirmId)}
                  className="flex-1 px-4 py-2 rounded-lg bg-semantic-error/10 border border-semantic-error/20 text-semantic-error-text text-sm font-semibold hover:bg-semantic-error/20 transition-colors">
            Desactivar
          </button>
        </div>
      </Modal>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Asignar hábito">
        <form onSubmit={createHabits} className="space-y-4">
          {/* Presets */}
          <div>
            <label className="block text-xs font-medium text-fg-muted mb-2">Sugerencias rápidas</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_HABITS.map(p => (
                <button type="button" key={p.name} onClick={() => applyPreset(p)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-border text-fg-muted hover:border-brand-primary/30 hover:text-brand-primary transition-all flex items-center gap-1">
                  {p.icon} {p.name.split(' ').slice(0, 3).join(' ')}…
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[48px_1fr] gap-2">
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Icono</label>
              <input className="input w-full text-center text-lg px-1" maxLength={2}
                     value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Nombre del hábito *</label>
              <input className="input w-full" placeholder="Beber 2L de agua al día"
                     value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-fg-muted mb-1.5">Días objetivo por semana</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map(d => (
                <button type="button" key={d} onClick={() => setForm(f => ({ ...f, target_days_per_week: d }))}
                        className={cn('w-9 h-9 rounded-lg border text-sm font-medium transition-all',
                          form.target_days_per_week === d ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' : 'border-border text-fg-muted hover:border-border-bright')}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Clientes */}
          <div>
            <label className="block text-xs font-medium text-fg-muted mb-2">Asignar a clientes *</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {clients.map(c => (
                <label key={c.client_id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:border-brand-primary/30 cursor-pointer transition-all">
                  <input type="checkbox" checked={form.client_ids.includes(c.client_id)}
                         onChange={() => toggleClient(c.client_id)} className="accent-brand-primary" />
                  <div className="w-7 h-7 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs font-bold text-brand-primary shrink-0">
                    {c.profile.full_name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm text-fg-primary">{c.profile.full_name}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving}
                  className="btn-primary w-full justify-center py-2.5 disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckSquare className="w-4 h-4" /> Asignar hábito</>}
          </button>
        </form>
      </Modal>
    </div>
  )
}
