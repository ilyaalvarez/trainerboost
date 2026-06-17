'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Trophy, Plus, Users, Calendar, Target,
  ChevronDown, ChevronUp, Loader2, Trash2, Play, Pause,
} from 'lucide-react'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import type { Challenge, ChallengeParticipant, Profile } from '@/types/database'
import { cn } from '@/lib/utils'

interface ChallengeWithParticipants extends Challenge {
  participants: Array<ChallengeParticipant & { profile: Pick<Profile, 'full_name' | 'avatar_url'> }>
}

interface ClientOption {
  client_id: string
  profile: Pick<Profile, 'full_name' | 'avatar_url'>
}

export default function ChallengesPage() {
  const supabase = createClient()
  const [challenges, setChallenges] = useState<ChallengeWithParticipants[]>([])
  const [clients, setClients] = useState<ClientOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    duration_days: 30,
    type: 'individual' as Challenge['type'],
    price: 0,
    start_date: '',
    goals: [] as string[],
    cover_image_url: '',
    selectedClients: [] as string[],
  })
  const [goalInput, setGoalInput] = useState('')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: ch }, { data: cl }] = await Promise.all([
      supabase
        .from('challenges')
        .select(`*, participants:challenge_participants(*, profile:client_id(full_name, avatar_url))`)
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('trainer_clients')
        .select('client_id, profile:client_id(full_name, avatar_url)')
        .eq('trainer_id', user.id)
        .eq('status', 'active'),
    ])

    setChallenges((ch ?? []) as unknown as ChallengeWithParticipants[])
    setClients((cl ?? []) as unknown as ClientOption[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  function toggle(id: string) {
    setExpanded(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  function addGoal() {
    if (!goalInput.trim()) return
    setForm(f => ({ ...f, goals: [...f.goals, goalInput.trim()] }))
    setGoalInput('')
  }

  function toggleClient(id: string) {
    setForm(f => ({
      ...f,
      selectedClients: f.selectedClients.includes(id)
        ? f.selectedClients.filter(c => c !== id)
        : [...f.selectedClients, id],
    }))
  }

  async function createChallenge(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.duration_days) { toast.error('Nombre y duración son obligatorios'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const endDate = form.start_date
      ? new Date(new Date(form.start_date).getTime() + form.duration_days * 86400000).toISOString().split('T')[0]
      : null

    const { data: ch, error } = await supabase
      .from('challenges')
      .insert({
        trainer_id: user.id,
        name: form.name,
        description: form.description || null,
        duration_days: form.duration_days,
        type: form.type,
        price: form.price,
        start_date: form.start_date || null,
        end_date: endDate,
        goals: form.goals,
        cover_image_url: form.cover_image_url || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) { toast.error(error.message); setSaving(false); return }

    if (ch && form.selectedClients.length > 0) {
      await supabase.from('challenge_participants').insert(
        form.selectedClients.map(client_id => ({
          challenge_id: ch.id,
          client_id,
          progress_pct: 0,
          payment_status: form.price > 0 ? 'pending' : 'paid',
        }))
      )
    }

    toast.success('Reto creado')
    setShowModal(false)
    setForm({ name: '', description: '', duration_days: 30, type: 'individual', price: 0, start_date: '', goals: [], cover_image_url: '', selectedClients: [] })
    setGoalInput('')
    await load()
    setSaving(false)
  }

  async function toggleActive(ch: ChallengeWithParticipants) {
    await supabase.from('challenges').update({ is_active: !ch.is_active }).eq('id', ch.id)
    await load()
  }

  async function deleteChallenge(id: string) {
    if (!confirm('¿Eliminar este reto? Se eliminan también los participantes.')) return
    await supabase.from('challenges').delete().eq('id', id)
    await load()
    toast.success('Reto eliminado')
  }

  async function updateProgress(participantId: string, pct: number) {
    await supabase.from('challenge_participants').update({ progress_pct: pct }).eq('id', participantId)
    await load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-fg-muted" /></div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fg-primary">Retos</h1>
          <p className="text-fg-muted text-sm mt-1">Programas de {challenges.length} duración definida para tus clientes</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Nuevo reto
        </button>
      </div>

      {/* Lista */}
      {challenges.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-8 h-8" />}
          title="Sin retos aún"
          description="Crea tu primer reto grupal o individual y asigna clientes."
          action={<button onClick={() => setShowModal(true)} className="btn-primary text-sm">Crear primer reto</button>}
        />
      ) : (
        <div className="space-y-4">
          {challenges.map(ch => {
            const isOpen = expanded.has(ch.id)
            const progress = ch.participants.length
              ? Math.round(ch.participants.reduce((s, p) => s + p.progress_pct, 0) / ch.participants.length)
              : 0

            return (
              <div key={ch.id} className="card overflow-hidden">
                <button onClick={() => toggle(ch.id)}
                        className="w-full flex items-center gap-4 p-5 text-left hover:bg-surface-2/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10 border border-amber-500/20">
                    <Trophy className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-fg-primary">{ch.name}</h3>
                      <span className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded-full border',
                        ch.is_active
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          : 'text-fg-disabled bg-surface-2 border-border'
                      )}>
                        {ch.is_active ? 'Activo' : 'Pausado'}
                      </span>
                      <span className="text-xs text-fg-muted capitalize">{ch.type}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-fg-muted">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {ch.participants.length} participantes</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {ch.duration_days} días</span>
                      {ch.price > 0 && <span className="text-brand-primary font-mono">{ch.price}€</span>}
                    </div>
                    {/* Progress bar colectivo */}
                    {ch.participants.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400 transition-all duration-700"
                               style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs font-mono text-amber-400 shrink-0">{progress}% medio</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isOpen ? <ChevronUp className="w-5 h-5 text-fg-disabled" /> : <ChevronDown className="w-5 h-5 text-fg-disabled" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border/50 px-5 pb-5 pt-4 space-y-4">
                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleActive(ch)}
                              className={cn('text-xs px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1',
                                ch.is_active ? 'border-amber-500/20 text-amber-400 hover:bg-amber-500/10' : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10')}>
                        {ch.is_active ? <><Pause className="w-3 h-3" /> Pausar</> : <><Play className="w-3 h-3" /> Reactivar</>}
                      </button>
                      <button onClick={() => deleteChallenge(ch.id)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-semantic-error/20 text-semantic-error-text hover:bg-semantic-error/10 transition-all flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Eliminar
                      </button>
                    </div>

                    {/* Descripción y objetivos */}
                    {ch.description && <p className="text-sm text-fg-muted">{ch.description}</p>}
                    {ch.goals?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {ch.goals.map(g => (
                          <span key={g} className="text-xs bg-surface-2 border border-border rounded-full px-2.5 py-1 text-fg-muted flex items-center gap-1">
                            <Target className="w-3 h-3" /> {g}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Participantes */}
                    {ch.participants.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold text-fg-muted uppercase tracking-widest mb-3">Participantes</p>
                        <div className="space-y-3">
                          {ch.participants.map(p => (
                            <div key={p.id} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-xs font-bold text-brand-primary shrink-0">
                                {p.profile.full_name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-fg-primary truncate">{p.profile.full_name}</div>
                                <div className="h-1.5 bg-surface-2 rounded-full mt-1 overflow-hidden">
                                  <div className="h-full rounded-full bg-amber-400 transition-all duration-500"
                                       style={{ width: `${p.progress_pct}%` }} />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <input type="number" min={0} max={100}
                                       className="w-14 input text-xs text-center py-1 px-1.5"
                                       value={p.progress_pct}
                                       onChange={e => updateProgress(p.id, Math.min(100, Math.max(0, Number(e.target.value))))} />
                                <span className="text-xs text-fg-muted">%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-fg-disabled">Sin participantes todavía.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal crear reto */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo reto">
        <form onSubmit={createChallenge} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-medium text-fg-muted mb-1.5">Nombre del reto *</label>
            <input className="input w-full" placeholder="Reto Verano 90 días"
                   value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>

          <div>
            <label className="block text-xs font-medium text-fg-muted mb-1.5">Descripción</label>
            <textarea className="input w-full resize-none" rows={2}
                      placeholder="¿Qué van a conseguir al terminar?"
                      value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Duración (días) *</label>
              <input className="input w-full" type="number" min={1} max={365}
                     value={form.duration_days} onChange={e => setForm(f => ({ ...f, duration_days: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Tipo</label>
              <select className="input w-full" value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value as Challenge['type'] }))}>
                <option value="individual">Individual</option>
                <option value="group">Grupal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Fecha de inicio</label>
              <input className="input w-full" type="date"
                     value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">Precio (0 = incluido)</label>
              <input className="input w-full" type="number" min={0}
                     value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
            </div>
          </div>

          {/* Objetivos */}
          <div>
            <label className="block text-xs font-medium text-fg-muted mb-1.5">Objetivos</label>
            <div className="flex gap-2 mb-2">
              <input className="input flex-1" placeholder="Ej: Perder 5 kg"
                     value={goalInput} onChange={e => setGoalInput(e.target.value)}
                     onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGoal() } }} />
              <button type="button" onClick={addGoal} className="btn-secondary text-sm px-3">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.goals.map((g, i) => (
                <span key={i} className="text-xs bg-surface-2 border border-border rounded-full px-2.5 py-1 text-fg-muted flex items-center gap-1">
                  {g}
                  <button type="button" onClick={() => setForm(f => ({ ...f, goals: f.goals.filter((_, x) => x !== i) }))}
                          className="text-fg-disabled hover:text-fg-primary">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Seleccionar clientes */}
          {clients.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-2">Añadir participantes</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {clients.map(c => (
                  <label key={c.client_id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:border-brand-primary/30 cursor-pointer transition-all">
                    <input type="checkbox"
                           checked={form.selectedClients.includes(c.client_id)}
                           onChange={() => toggleClient(c.client_id)}
                           className="accent-brand-primary" />
                    <div className="w-7 h-7 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs font-bold text-brand-primary shrink-0">
                      {c.profile.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm text-fg-primary">{c.profile.full_name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={saving}
                  className="btn-primary w-full justify-center py-2.5 disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trophy className="w-4 h-4" /> Crear reto</>}
          </button>
        </form>
      </Modal>
    </div>
  )
}
