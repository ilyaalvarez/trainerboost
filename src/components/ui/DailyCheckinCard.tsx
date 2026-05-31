'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Zap, Smile, Moon, CheckCircle, Pencil } from 'lucide-react'

interface Props {
  clientId: string
  existingCheckin: { energy: number | null; mood: number | null; sleep_hours: number | null; note?: string | null } | null
}

const ENERGY_EMOJIS = ['😴', '🪫', '😐', '⚡', '🔥']
const MOOD_EMOJIS   = ['😞', '😕', '😐', '😊', '😄']

export function DailyCheckinCard({ clientId, existingCheckin }: Props) {
  const [energy, setEnergy] = useState<number>(existingCheckin?.energy ?? 0)
  const [mood, setMood] = useState<number>(existingCheckin?.mood ?? 0)
  const [sleep, setSleep] = useState<string>(existingCheckin?.sleep_hours?.toString() ?? '')
  const [note, setNote]   = useState<string>(existingCheckin?.note ?? '')
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
      note: note.trim() || null,
    }, { onConflict: 'client_id,checkin_date' })
    setSaving(false)
    if (error) { toast.error('Error al guardar'); return }
    toast.success('¡Check-in guardado! 🎯')
    setDone(true)
  }

  if (done) {
    return (
      <div className="card p-4 border-emerald-500/20" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))' }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Check-in de hoy completado</p>
              <div className="flex items-center gap-3 mt-1">
                {energy > 0 && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <span className="text-base leading-none">{ENERGY_EMOJIS[energy - 1]}</span> Energía
                  </span>
                )}
                {mood > 0 && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <span className="text-base leading-none">{MOOD_EMOJIS[mood - 1]}</span> Ánimo
                  </span>
                )}
                {sleep && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Moon className="w-3 h-3 text-violet-400" /> {sleep}h
                  </span>
                )}
              </div>
              {note && (
                <p className="text-xs text-slate-400 mt-1.5 italic">&ldquo;{note}&rdquo;</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setDone(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-surface-2 transition-all shrink-0"
            title="Editar check-in"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  const EmojiRow = ({
    label, icon, value, onChange, emojis,
  }: {
    label: string; icon: React.ReactNode; value: number
    onChange: (v: number) => void; emojis: string[]
  }) => (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs text-slate-400 font-medium">{label}</span>
      </div>
      <div className="flex gap-2">
        {[1,2,3,4,5].map(v => (
          <button key={v} onClick={() => onChange(v)}
            className={`w-9 h-9 rounded-xl text-lg transition-all duration-150 ${value === v ? 'bg-sky-500/20 border border-sky-500/40 scale-110 shadow-lg shadow-sky-500/20' : 'bg-slate-800 hover:bg-slate-700'}`}>
            {emojis[v - 1]}
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
        <EmojiRow label="Energía" icon={<Zap className="w-3.5 h-3.5 text-amber-400" />} value={energy} onChange={setEnergy} emojis={ENERGY_EMOJIS} />
        <EmojiRow label="Estado de ánimo" icon={<Smile className="w-3.5 h-3.5 text-sky-400" />} value={mood} onChange={setMood} emojis={MOOD_EMOJIS} />
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Moon className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs text-slate-400 font-medium">Horas de sueño</span>
          </div>
          <input type="number" min="0" max="24" step="0.5" value={sleep} onChange={e => setSleep(e.target.value)}
            placeholder="e.g. 7.5" className="input w-24 text-sm py-1.5 px-2" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Nota para tu entrenador</span>
            <span className="text-[10px] text-slate-600">{note.length}/200</span>
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value.slice(0, 200))}
            placeholder="¿Cómo te has sentido hoy? ¿Algo que quieras comentar?"
            rows={2}
            className="input text-sm py-1.5 px-2 resize-none w-full"
          />
        </div>
      </div>
      <button onClick={submit} disabled={saving} className="btn-primary w-full mt-4 text-sm py-2">
        {saving ? 'Guardando...' : 'Guardar check-in'}
      </button>
    </div>
  )
}
