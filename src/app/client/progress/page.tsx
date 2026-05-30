'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Plus, Loader2, Scale, Flame, TrendingDown, ClipboardList } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ProgressLog } from '@/types/database'
import { formatDate } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import Milestones from '@/components/ui/Milestones'
import ProgressChart from '../_components/ProgressChart'
import { PhotoUpload } from '@/components/ui/PhotoUpload'

function computeStreak(dates: string[]): number {
  const unique = Array.from(new Set(dates.map(d => d.slice(0, 10)))).sort((a, b) => (a < b ? 1 : -1))
  if (unique.length === 0) return 0

  const dayMs = 86400000
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayKey = today.toISOString().slice(0, 10)
  const yesterdayKey = new Date(today.getTime() - dayMs).toISOString().slice(0, 10)

  if (unique[0] !== todayKey && unique[0] !== yesterdayKey) return 0

  let streak = 1
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1] + 'T00:00:00')
    const curr = new Date(unique[i] + 'T00:00:00')
    if (prev.getTime() - curr.getTime() === dayMs) streak++
    else break
  }
  return streak
}

export default function ClientProgressPage() {
  const supabase = useMemo(() => createClient(), [])
  const [logs, setLogs]           = useState<ProgressLog[]>([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [completedWorkouts, setCompletedWorkouts] = useState(0)

  const [form, setForm] = useState({
    weight_kg: '',
    body_fat_pct: '',
    muscle_mass_kg: '',
    waist_cm: '',
    chest_cm: '',
    arm_cm: '',
    thigh_cm: '',
    hip_cm: '',
    notes: '',
  })

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: l }, { data: tc }, { count: workoutsCount }] = await Promise.all([
      supabase.from('progress_logs')
        .select('*')
        .eq('client_id', user.id)
        .order('logged_at', { ascending: true }),
      supabase.from('trainer_clients')
        .select('trainer_id')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .single(),
      supabase.from('exercise_completions')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id),
    ])

    setLogs(l || [])
    setTrainerId(tc?.trainer_id || null)
    setCompletedWorkouts(workoutsCount || 0)
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
      waist_cm: form.waist_cm ? parseFloat(form.waist_cm) : null,
      chest_cm: form.chest_cm ? parseFloat(form.chest_cm) : null,
      arm_cm: form.arm_cm ? parseFloat(form.arm_cm) : null,
      thigh_cm: form.thigh_cm ? parseFloat(form.thigh_cm) : null,
      hip_cm: form.hip_cm ? parseFloat(form.hip_cm) : null,
      notes: form.notes || null,
    })

    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Medida registrada ✓')
    setShowModal(false)
    setForm({ weight_kg: '', body_fat_pct: '', muscle_mass_kg: '', waist_cm: '', chest_cm: '', arm_cm: '', thigh_cm: '', hip_cm: '', notes: '' })
    fetchLogs()
  }

  const latest = logs.at(-1)
  const first  = logs.at(0)
  const streakDays = computeStreak(logs.map(l => l.logged_at))
  const weightChange = latest?.weight_kg != null && first?.weight_kg != null && logs.length >= 2
    ? latest.weight_kg - first.weight_kg
    : null

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

      {/* Hero stats */}
      {logs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card p-5 flex items-center gap-4"
               style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.05))', borderColor: 'rgba(245,158,11,0.25)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                 style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.12))' }}>
              <Flame className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-amber-400">{streakDays}</div>
              <div className="text-xs text-slate-400">Racha actual ({streakDays === 1 ? 'día' : 'días'})</div>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4"
               style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,165,233,0.05))', borderColor: 'rgba(16,185,129,0.25)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                 style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(14,165,233,0.12))' }}>
              <TrendingDown className="w-6 h-6 text-brand-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-brand-accent">
                {weightChange != null ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}` : '—'}
              </div>
              <div className="text-xs text-slate-400">Kg {weightChange != null && weightChange > 0 ? 'ganados' : 'perdidos'}</div>
            </div>
          </div>

          <div className="card p-5 flex items-center gap-4"
               style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(14,165,233,0.05))', borderColor: 'rgba(124,58,237,0.25)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                 style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(14,165,233,0.12))' }}>
              <ClipboardList className="w-6 h-6 text-brand-secondary" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-brand-secondary">{logs.length}</div>
              <div className="text-xs text-slate-400">Registros</div>
            </div>
          </div>
        </div>
      )}

      {/* Milestones */}
      {logs.length > 0 && (
        <div>
          <h2 className="font-semibold text-white mb-3">Logros</h2>
          <Milestones
            totalLogs={logs.length}
            weightChange={weightChange}
            streakDays={streakDays}
            completedWorkouts={completedWorkouts}
          />
        </div>
      )}

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

      {/* Body measurements */}
      {latest && (latest.waist_cm != null || latest.chest_cm != null || latest.arm_cm != null || latest.thigh_cm != null || latest.hip_cm != null) && (() => {
        const measures = [
          { key: 'waist_cm' as const, label: 'Cintura', icon: '⬤' },
          { key: 'chest_cm' as const, label: 'Pecho',   icon: '⬤' },
          { key: 'arm_cm'   as const, label: 'Brazo',   icon: '⬤' },
          { key: 'thigh_cm' as const, label: 'Muslo',   icon: '⬤' },
          { key: 'hip_cm'   as const, label: 'Cadera',  icon: '⬤' },
        ].filter(m => latest[m.key] != null)

        return (
          <div className="card p-5">
            <h2 className="font-semibold text-white mb-3">Medidas corporales</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {measures.map(m => {
                const current = latest[m.key] as number
                const firstVal = first?.[m.key] as number | null | undefined
                const delta = firstVal != null && logs.length >= 2 ? current - firstVal : null
                return (
                  <div key={m.key} className="card p-3 text-center" style={{ background: 'rgba(30,41,59,0.6)' }}>
                    <div className="font-mono text-lg font-bold text-white">{current}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">{m.label} cm</div>
                    {delta != null && (
                      <div className={`text-[10px] font-semibold mt-1 ${delta < 0 ? 'text-emerald-400' : delta > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Before / After comparison */}
      {(() => {
        const withPhotos = logs.filter(l => (l.photos ?? []).length > 0)
        if (withPhotos.length < 2) return null
        const before = withPhotos[0]
        const after  = withPhotos[withPhotos.length - 1]
        return (
          <div className="card p-5">
            <h2 className="font-semibold text-white mb-4">Antes y ahora</h2>
            <div className="grid grid-cols-2 gap-4">
              {[{ log: before, label: 'Antes' }, { log: after, label: 'Ahora' }].map(({ log, label }) => (
                <div key={log.id} className="space-y-2">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-2 border border-border">
                    <Image
                      src={(log.photos ?? [])[0]}
                      alt={label}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-xs font-semibold text-white">{label}</p>
                      <p className="text-[10px] text-slate-300">{formatDate(log.logged_at)}</p>
                    </div>
                  </div>
                  {log.weight_kg != null && (
                    <div className="text-center">
                      <span className="font-mono text-sm font-bold text-white">{log.weight_kg} kg</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })()}

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
                  {['Fecha', 'Peso', 'Grasa %', 'Masa muscular', 'Notas', 'Fotos'].map(h => (
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
                    <td className="p-4">
                      <PhotoUpload
                        logId={log.id}
                        existing={log.photos ?? []}
                        onUpdated={(urls) => {
                          setLogs(prev => prev.map(l => l.id === log.id ? { ...l, photos: urls } : l))
                        }}
                      />
                    </td>
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
          <details className="mt-1">
            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">Medidas corporales (opcional)</summary>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {([
                { key: 'waist_cm', label: 'Cintura (cm)' },
                { key: 'chest_cm', label: 'Pecho (cm)' },
                { key: 'arm_cm',   label: 'Brazo (cm)' },
                { key: 'thigh_cm', label: 'Muslo (cm)' },
                { key: 'hip_cm',   label: 'Cadera (cm)' },
              ] as const).map(m => (
                <div key={m.key}>
                  <label className="text-xs text-slate-500">{m.label}</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input text-sm py-1.5"
                    value={form[m.key]}
                    onChange={e => setForm(f => ({ ...f, [m.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </details>
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
