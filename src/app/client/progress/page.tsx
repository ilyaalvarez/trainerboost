'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2, Scale } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ProgressLog } from '@/types/database'
import { formatDate } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import ProgressChart from '../_components/ProgressChart'

export default function ClientProgressPage() {
  const supabase = useMemo(() => createClient(), [])
  const [logs, setLogs]           = useState<ProgressLog[]>([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [trainerId, setTrainerId] = useState<string | null>(null)

  const [form, setForm] = useState({
    weight_kg: '',
    body_fat_pct: '',
    muscle_mass_kg: '',
    notes: '',
  })

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: l }, { data: tc }] = await Promise.all([
      supabase.from('progress_logs')
        .select('*')
        .eq('client_id', user.id)
        .order('logged_at', { ascending: true }),
      supabase.from('trainer_clients')
        .select('trainer_id')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .single(),
    ])

    setLogs(l || [])
    setTrainerId(tc?.trainer_id || null)
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.weight_kg) { toast.error('El peso es obligatorio'); return }
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !trainerId) return

    const { error } = await supabase.from('progress_logs').insert({
      client_id: user.id,
      trainer_id: trainerId,
      weight_kg: parseFloat(form.weight_kg),
      body_fat_pct: form.body_fat_pct ? parseFloat(form.body_fat_pct) : null,
      muscle_mass_kg: form.muscle_mass_kg ? parseFloat(form.muscle_mass_kg) : null,
      notes: form.notes || null,
    })

    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Medida registrada ✓')
    setShowModal(false)
    setForm({ weight_kg: '', body_fat_pct: '', muscle_mass_kg: '', notes: '' })
    fetchLogs()
  }

  const latest = logs.at(-1)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mi Progreso</h1>
          <p className="text-slate-400 text-sm mt-0.5">Historial de medidas corporales</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Registrar medida
        </button>
      </div>

      {/* Latest values */}
      {latest && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Peso', value: latest.weight_kg, unit: 'kg' },
            { label: 'Grasa corporal', value: latest.body_fat_pct, unit: '%' },
            { label: 'Masa muscular', value: latest.muscle_mass_kg, unit: 'kg' },
          ].map(stat => (
            <div key={stat.label} className="card p-4 text-center">
              <div className="font-mono text-2xl font-bold text-white">
                {stat.value ?? '—'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.unit !== '—' ? `${stat.unit} · ` : ''}{stat.label}</div>
              <div className="text-xs text-slate-600 mt-1">
                {formatDate(latest.logged_at)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {logs.length >= 2 && (
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Evolución</h2>
          <ProgressChart logs={logs} />
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<Scale className="w-8 h-8 text-slate-500" />}
          title="Sin registros todavía"
          description="Registra tu primer pesaje para empezar a ver tu progreso."
          action={{ label: 'Registrar ahora', onClick: () => setShowModal(true) }}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {['Fecha', 'Peso', 'Grasa %', 'Masa muscular', 'Notas'].map(h => (
                    <th key={h} className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[...logs].reverse().map(log => (
                  <tr key={log.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="p-4 text-slate-300">{formatDate(log.logged_at)}</td>
                    <td className="p-4 font-mono font-semibold text-white">{log.weight_kg ?? '—'} kg</td>
                    <td className="p-4 font-mono text-slate-300">{log.body_fat_pct ?? '—'}{log.body_fat_pct ? '%' : ''}</td>
                    <td className="p-4 font-mono text-slate-300">{log.muscle_mass_kg ?? '—'}{log.muscle_mass_kg ? ' kg' : ''}</td>
                    <td className="p-4 text-slate-400 text-xs max-w-xs truncate">{log.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Registrar medida">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Peso (kg) *</label>
              <input
                type="number"
                step="0.1"
                value={form.weight_kg}
                onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))}
                className="input"
                placeholder="75.5"
                required
              />
            </div>
            <div>
              <label className="label">Grasa %</label>
              <input
                type="number"
                step="0.1"
                value={form.body_fat_pct}
                onChange={e => setForm(f => ({ ...f, body_fat_pct: e.target.value }))}
                className="input"
                placeholder="18.0"
              />
            </div>
            <div>
              <label className="label">Masa muscular (kg)</label>
              <input
                type="number"
                step="0.1"
                value={form.muscle_mass_kg}
                onChange={e => setForm(f => ({ ...f, muscle_mass_kg: e.target.value }))}
                className="input"
                placeholder="35.0"
              />
            </div>
          </div>
          <div>
            <label className="label">Notas</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="input resize-none"
              rows={2}
              placeholder="Cómo te has sentido, circunstancias especiales..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
