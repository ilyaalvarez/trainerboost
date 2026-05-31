'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Trash2, ChevronDown, History } from 'lucide-react'
import type { SetLog } from '@/types/database'

interface Props {
  exerciseId: string
  clientId: string
  defaultSets: number // from routine_exercises.sets
}

interface SetEntry {
  set_number: number
  weight_kg: string
  reps: string
}

export function SetLogger({ exerciseId, clientId, defaultSets }: Props) {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<SetEntry[]>([])
  const [history, setHistory] = useState<SetLog[]>([])
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const loadTodayAndHistory = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600000).toISOString().split('T')[0]

    const [todayRes, histRes] = await Promise.all([
      supabase.from('set_logs').select('*').eq('exercise_id', exerciseId).eq('client_id', clientId).eq('logged_at', today).order('set_number'),
      supabase.from('set_logs').select('*').eq('exercise_id', exerciseId).eq('client_id', clientId).gte('logged_at', weekAgo).lt('logged_at', today).order('logged_at', { ascending: false }).order('set_number').limit(10),
    ])

    if (todayRes.data && todayRes.data.length > 0) {
      setEntries(todayRes.data.map((s) => ({ set_number: s.set_number, weight_kg: s.weight_kg?.toString() ?? '', reps: s.reps?.toString() ?? '' })))
    } else {
      // Pre-fill from last session if available, so users have a baseline to work from
      const lastSessionLogs = histRes.data ?? []
      const lastDate = lastSessionLogs.length > 0 ? lastSessionLogs[0].logged_at : null
      const lastSets = lastDate ? lastSessionLogs.filter(s => s.logged_at === lastDate) : []
      setEntries(Array.from({ length: defaultSets || 3 }, (_, i) => {
        const prev = lastSets[i]
        return { set_number: i + 1, weight_kg: prev?.weight_kg?.toString() ?? '', reps: prev?.reps?.toString() ?? '' }
      }))
    }
    if (histRes.data) setHistory(histRes.data as SetLog[])
  }, [exerciseId, clientId, defaultSets, supabase])

  useEffect(() => {
    if (open) loadTodayAndHistory()
  }, [open, loadTodayAndHistory])

  const save = async () => {
    const today = new Date().toISOString().split('T')[0]
    setSaving(true)
    // delete today's logs, re-insert
    await supabase.from('set_logs').delete().eq('exercise_id', exerciseId).eq('client_id', clientId).eq('logged_at', today)
    const rows = entries.filter(e => e.weight_kg || e.reps).map(e => ({
      exercise_id: exerciseId,
      client_id: clientId,
      set_number: e.set_number,
      weight_kg: e.weight_kg ? parseFloat(e.weight_kg) : null,
      reps: e.reps ? parseInt(e.reps) : null,
      logged_at: today,
    }))
    if (rows.length > 0) {
      const { error } = await supabase.from('set_logs').insert(rows)
      if (error) { toast.error('Error al guardar'); setSaving(false); return }
    }
    toast.success('Sets guardados ✓')
    setSaving(false)
    setOpen(false)
  }

  const addSet = () => setEntries(prev => [...prev, { set_number: prev.length + 1, weight_kg: '', reps: '' }])
  const removeSet = (i: number) => setEntries(prev => prev.filter((_, idx) => idx !== i).map((e, idx) => ({ ...e, set_number: idx + 1 })))

  // group history by date for display
  const lastSessionDate = history.length > 0 ? history[0].logged_at : null
  const lastSession = lastSessionDate ? history.filter(s => s.logged_at === lastSessionDate) : []

  const copyLastSession = () => {
    if (!lastSession.length) return
    setEntries(prev => prev.map((e, i) => {
      const prev2 = lastSession[i]
      return prev2 ? { ...e, weight_kg: prev2.weight_kg?.toString() ?? e.weight_kg, reps: prev2.reps?.toString() ?? e.reps } : e
    }))
    toast.success('Datos de la última sesión copiados')
  }

  return (
    <div className="mt-3 border-t border-slate-700/50 pt-3">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors">
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        Registrar sets
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {lastSession.length > 0 && (
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="flex items-center gap-1 text-[11px] text-violet-400">
                <History className="w-3 h-3" />
                Última: {lastSession.map(s => `${s.weight_kg ?? '?'}kg×${s.reps ?? '?'}`).join(' · ')}
              </span>
              <button onClick={copyLastSession} className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors font-medium">
                Copiar →
              </button>
            </div>
          )}
          <div className="grid grid-cols-[auto,1fr,1fr,auto] gap-2 text-xs text-slate-500 px-1 mb-1">
            <span>Set</span><span>Kg</span><span>Reps</span><span />
          </div>
          {entries.map((e, i) => (
            <div key={i} className="grid grid-cols-[auto,1fr,1fr,auto] gap-2 items-center">
              <span className="text-xs text-slate-500 w-6 text-center font-mono">{e.set_number}</span>
              <input type="number" min="0" step="0.5" value={e.weight_kg} onChange={ev => setEntries(prev => prev.map((x, idx) => idx === i ? { ...x, weight_kg: ev.target.value } : x))}
                placeholder="0" className="input text-sm py-1 px-2 text-center" />
              <input type="number" min="0" value={e.reps} onChange={ev => setEntries(prev => prev.map((x, idx) => idx === i ? { ...x, reps: ev.target.value } : x))}
                placeholder="0" className="input text-sm py-1 px-2 text-center" />
              <button onClick={() => removeSet(i)} className="p-1 text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <button onClick={addSet} className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Set</button>
            <button onClick={save} disabled={saving} className="btn-primary text-xs py-1.5 px-4 flex-1">{saving ? 'Guardando...' : 'Guardar sesión'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
