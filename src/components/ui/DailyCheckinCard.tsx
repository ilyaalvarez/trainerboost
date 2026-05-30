'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Zap, Smile, Moon, CheckCircle } from 'lucide-react'

interface Props {
  clientId: string
  existingCheckin: { energy: number | null; mood: number | null; sleep_hours: number | null } | null
}

export function DailyCheckinCard({ clientId, existingCheckin }: Props) {
  const [energy, setEnergy] = useState<number>(existingCheckin?.energy ?? 0)
  const [mood, setMood] = useState<number>(existingCheckin?.mood ?? 0)
  const [sleep, setSleep] = useState<string>(existingCheckin?.sleep_hours?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(!!existingCheckin)
  const supabase = createClient()

  const submit = async () => {
    if (!energy || !mood) { toast.error('Selecciona energía y estado de ánimo'); return }
    setSaving(true)
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase.from('daily_checkins').upsert({
      client_id: clientId,
      checkin_date: today,
      energy,
      mood,
      sleep_hours: sleep ? parseFloat(sleep) : null,
    }, { onConflict: 'client_id,checkin_date' })
    setSaving(false)
    if (error) { toast.error('Error al guardar'); return }
    toast.success('¡Check-in guardado! 🎯')
    setDone(true)
  }

  if (done) {
    return (
      <div className="card p-4 flex items-center gap-3 border-emerald-500/20" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))' }}>
        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-white">Check-in de hoy completado</p>
          <p className="text-xs text-slate-400 mt-0.5">Energía {energy}/5 · Ánimo {mood}/5{sleep ? ` · ${sleep}h sueño` : ''}</p>
        </div>
      </div>
    )
  }

  const EmojiRow = ({ label, icon, value, onChange }: { label: string; icon: React.ReactNode; value: number; onChange: (v: number) => void }) => (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs text-slate-400 font-medium">{label}</span>
      </div>
      <div className="flex gap-2">
        {[1,2,3,4,5].map(v => (
          <button key={v} onClick={() => onChange(v)}
            className={`w-9 h-9 rounded-xl text-base transition-all duration-150 ${value === v ? 'bg-sky-500 text-white scale-110 shadow-lg shadow-sky-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {v === 1 ? '😴' : v === 2 ? '😕' : v === 3 ? '😐' : v === 4 ? '😊' : '🔥'}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="card p-4" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.06), rgba(124,58,237,0.04))', borderColor: 'rgba(14,165,233,0.15)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center">
          <Zap className="w-4 h-4 text-sky-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Check-in diario</p>
          <p className="text-xs text-slate-500">¿Cómo estás hoy?</p>
        </div>
      </div>
      <div className="space-y-4">
        <EmojiRow label="Energía" icon={<Zap className="w-3.5 h-3.5 text-amber-400" />} value={energy} onChange={setEnergy} />
        <EmojiRow label="Estado de ánimo" icon={<Smile className="w-3.5 h-3.5 text-sky-400" />} value={mood} onChange={setMood} />
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Moon className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs text-slate-400 font-medium">Horas de sueño</span>
          </div>
          <input type="number" min="0" max="24" step="0.5" value={sleep} onChange={e => setSleep(e.target.value)}
            placeholder="e.g. 7.5" className="input w-24 text-sm py-1.5 px-2" />
        </div>
      </div>
      <button onClick={submit} disabled={saving} className="btn-primary w-full mt-4 text-sm py-2">
        {saving ? 'Guardando...' : 'Guardar check-in'}
      </button>
    </div>
  )
}
