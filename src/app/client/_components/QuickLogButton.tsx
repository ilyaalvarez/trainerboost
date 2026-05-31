'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2, Scale, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  clientId: string
  trainerId: string | null
}

export function QuickLogButton({ clientId, trainerId }: Props) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const kg = parseFloat(weight)
    if (!kg || isNaN(kg) || kg < 20 || kg > 500) {
      toast.error('Introduce un peso válido')
      return
    }
    if (!trainerId) {
      toast.error('No se encontró tu entrenador')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('progress_logs').insert({
      client_id: clientId,
      trainer_id: trainerId,
      weight_kg: kg,
    })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('¡Peso registrado! ✓')
    setWeight('')
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-brand-primary hover:underline font-medium transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Registrar peso
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div className="card w-full max-w-xs p-6 space-y-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-brand-primary" />
                <h3 className="font-semibold text-white text-sm">Registro rápido</h3>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-surface-2 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="label">Peso actual (kg)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="500"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className="input flex-1"
                    placeholder="75.5"
                    autoFocus
                    required
                  />
                  <span className="text-slate-400 text-sm shrink-0">kg</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2 text-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
