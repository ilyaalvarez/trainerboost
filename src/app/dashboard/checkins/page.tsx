'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  ClipboardList, ChevronDown, ChevronUp, Flame, Smile, Moon,
  Dumbbell, Trophy, Zap, MessageSquare, Search, Send, Loader2, AlertTriangle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/ui/Avatar'
import EmptyState from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/database'

interface WeeklyCheckin {
  id: string
  client_id: string
  trainer_id: string
  week_start: string
  energy_level: number | null
  mood: number | null
  sleep_hours: number | null
  adherence_pct: number | null
  biggest_win: string | null
  biggest_challenge: string | null
  questions_for_trainer: string | null
  trainer_response: string | null
  created_at: string
}

interface CheckinWithClient extends WeeklyCheckin {
  client: Profile
}

function weekLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const end = new Date(d)
  end.setDate(d.getDate() + 6)
  return `${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

function ScoreChip({ value, max = 10, color }: { value: number | null; max?: number; color: string }) {
  if (value == null) return <span className="text-fg-disabled text-xs">—</span>
  const pct = (value / max) * 100
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono font-semibold text-fg-primary">{value}/{max}</span>
    </div>
  )
}

function AdherenceChip({ value }: { value: number | null }) {
  if (value == null) return <span className="text-fg-disabled text-xs">—</span>
  const color = value >= 75 ? '#10B981' : value >= 40 ? '#F59E0B' : '#EF4444'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-mono font-semibold" style={{ color }}>{value}%</span>
    </div>
  )
}

export default function CheckinsPage() {
  const supabase = createClient()
  const [checkins, setCheckins]         = useState<CheckinWithClient[]>([])
  const [loading, setLoading]           = useState(true)
  const [expanded, setExpanded]         = useState<Set<string>>(new Set())
  const [search, setSearch]             = useState('')
  const [weekFilter, setWeekFilter]     = useState('')
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([])
  const [responding, setResponding]     = useState<string | null>(null)
  const [responseText, setResponseText] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('weekly_checkins')
        .select('*')
        .eq('trainer_id', user.id)
        .order('week_start', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) { toast.error('Error al cargar check-ins'); return }

      const clientIds = Array.from(new Set((data ?? []).map(c => c.client_id)))
      let profileMap: Record<string, Profile> = {}

      if (clientIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, phone, bio, specialties, role, created_at, updated_at')
          .in('id', clientIds)
        profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p as Profile]))
      }

      const enriched: CheckinWithClient[] = (data ?? [])
        .filter(c => profileMap[c.client_id])
        .map(c => ({ ...c, client: profileMap[c.client_id] }))

      setCheckins(enriched)

      // Pre-fill response text from existing responses
      const initialResponses: Record<string, string> = {}
      enriched.forEach(c => {
        if (c.trainer_response) initialResponses[c.id] = c.trainer_response
      })
      setResponseText(prev => ({ ...initialResponses, ...prev }))

      const weeks = Array.from(new Set(enriched.map(c => c.week_start))).sort().reverse()
      setAvailableWeeks(weeks)
      if (weeks.length > 0 && !weekFilter) setWeekFilter(weeks[0])
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  async function sendResponse(checkin: CheckinWithClient) {
    const text = (responseText[checkin.id] ?? '').trim()
    if (!text) { toast.error('Escribe una respuesta antes de enviar'); return }
    setResponding(checkin.id)
    try {
      const { error } = await supabase
        .from('weekly_checkins')
        .update({ trainer_response: text })
        .eq('id', checkin.id)

      if (error) { toast.error(error.message); return }

      // Notify client
      await supabase.from('notifications').insert({
        user_id: checkin.client_id,
        type:    'checkin_response',
        title:   'Tu entrenador respondió tu check-in',
        body:    'Revisa la respuesta de tu entrenador al último check-in.',
        link:    '/client/checkin',
      })

      toast.success('Respuesta enviada')
      setCheckins(prev => prev.map(c =>
        c.id === checkin.id ? { ...c, trainer_response: text } : c
      ))
    } finally {
      setResponding(null)
    }
  }

  const filtered = checkins.filter(c => {
    const matchWeek   = !weekFilter || c.week_start === weekFilter
    const matchSearch = !search.trim() || c.client.full_name.toLowerCase().includes(search.toLowerCase())
    return matchWeek && matchSearch
  })

  const pendingCount = filtered.filter(c => !c.trainer_response).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg-primary">Check-ins semanales</h1>
          <p className="text-fg-secondary text-sm mt-0.5">Respuestas de tus clientes al check-in de la semana</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
            <AlertTriangle className="w-3.5 h-3.5 text-brand-primary" />
            <span className="text-xs font-semibold text-brand-primary">{pendingCount} sin responder</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-secondary" />
          <input
            className="input pl-9"
            placeholder="Buscar cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {availableWeeks.length > 0 && (
          <select
            className="input w-auto"
            value={weekFilter}
            onChange={e => setWeekFilter(e.target.value)}
          >
            <option value="">Todas las semanas</option>
            {availableWeeks.map(w => (
              <option key={w} value={w}>{weekLabel(w)}</option>
            ))}
          </select>
        )}
      </div>

      {checkins.length === 0 ? (
        <EmptyState
          icon={<ClipboardList />}
          title="Sin check-ins todavía"
          description="Cuando un cliente complete su check-in semanal aparecerá aquí. Activa los check-ins desde el perfil de cada cliente."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList />}
          title="Sin resultados"
          description="Prueba con otro cliente o semana."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <CheckinCard
              key={c.id}
              checkin={c}
              expanded={expanded.has(c.id)}
              onToggle={() => toggleExpand(c.id)}
              responseText={responseText[c.id] ?? c.trainer_response ?? ''}
              onResponseChange={text => setResponseText(prev => ({ ...prev, [c.id]: text }))}
              onSendResponse={() => sendResponse(c)}
              sendingResponse={responding === c.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CheckinCard({
  checkin, expanded, onToggle,
  responseText, onResponseChange, onSendResponse, sendingResponse,
}: {
  checkin: CheckinWithClient
  expanded: boolean
  onToggle: () => void
  responseText: string
  onResponseChange: (t: string) => void
  onSendResponse: () => void
  sendingResponse: boolean
}) {
  const hasLowEnergy = checkin.energy_level != null && checkin.energy_level <= 3
  const hasLowMood   = checkin.mood != null && checkin.mood <= 3
  const hasLowAdherence = checkin.adherence_pct != null && checkin.adherence_pct <= 25
  const hasConcern = hasLowEnergy || hasLowMood || hasLowAdherence
  const hasResponse = !!checkin.trainer_response

  return (
    <div className={cn('card overflow-hidden transition-colors',
      hasConcern && !hasResponse && 'border-amber-500/30',
      hasResponse && 'border-brand-primary/10')}>
      <button
        type="button"
        className="w-full p-4 text-left hover:bg-surface-2/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Avatar name={checkin.client.full_name} url={checkin.client.avatar_url} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-fg-primary">{checkin.client.full_name}</span>
              {hasConcern && !hasResponse && (
                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-semantic-warning/15 text-semantic-warning-text">
                  <AlertTriangle size={10} /> Atención
                </span>
              )}
              {hasResponse && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary">
                  Respondido
                </span>
              )}
            </div>
            <p className="text-xs text-fg-muted mt-0.5">{weekLabel(checkin.week_start)}</p>
          </div>

          {/* Quick stats */}
          <div className="hidden sm:flex items-center gap-4 text-xs shrink-0">
            {checkin.energy_level != null && (
              <div className="flex items-center gap-1.5">
                <Flame size={12} className="text-amber-400" />
                <span className={cn('font-mono font-bold text-xs',
                  checkin.energy_level <= 3 ? 'text-semantic-error-text' : checkin.energy_level <= 6 ? 'text-amber-400' : 'text-emerald-400')}>
                  {checkin.energy_level}/10
                </span>
              </div>
            )}
            {checkin.mood != null && (
              <div className="flex items-center gap-1.5">
                <Smile size={12} className="text-brand-primary" />
                <span className={cn('font-mono font-bold text-xs',
                  checkin.mood <= 3 ? 'text-semantic-error-text' : checkin.mood <= 6 ? 'text-amber-400' : 'text-emerald-400')}>
                  {checkin.mood}/10
                </span>
              </div>
            )}
            {checkin.adherence_pct != null && (
              <div className="flex items-center gap-1.5">
                <Dumbbell size={12} className="text-[#0EA5E9]" />
                <span className={cn('font-mono font-bold text-xs',
                  checkin.adherence_pct <= 25 ? 'text-semantic-error-text' : checkin.adherence_pct <= 50 ? 'text-amber-400' : 'text-emerald-400')}>
                  {checkin.adherence_pct}%
                </span>
              </div>
            )}
          </div>

          <div className="shrink-0 ml-2">
            {expanded
              ? <ChevronUp size={16} className="text-fg-secondary" />
              : <ChevronDown size={16} className="text-fg-secondary" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/60 px-4 py-5 space-y-5">
          {/* Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard icon={<Flame size={13} className="text-amber-400" />} label="Energía">
              <ScoreChip value={checkin.energy_level} color="#F59E0B" />
            </MetricCard>
            <MetricCard icon={<Smile size={13} className="text-brand-primary" />} label="Ánimo">
              <ScoreChip value={checkin.mood} color="#8FD43A" />
            </MetricCard>
            <MetricCard icon={<Moon size={13} className="text-[#A78BFA]" />} label="Sueño">
              {checkin.sleep_hours != null
                ? <span className="text-sm font-mono font-bold text-fg-primary">{checkin.sleep_hours}h</span>
                : <span className="text-fg-disabled text-xs">—</span>}
            </MetricCard>
            <MetricCard icon={<Dumbbell size={13} className="text-[#0EA5E9]" />} label="Rutina">
              <AdherenceChip value={checkin.adherence_pct} />
            </MetricCard>
          </div>

          {/* Text answers */}
          {checkin.biggest_win && (
            <TextAnswer icon={<Trophy size={13} className="text-emerald-400" />} label="Mayor logro">
              {checkin.biggest_win}
            </TextAnswer>
          )}
          {checkin.biggest_challenge && (
            <TextAnswer icon={<Zap size={13} className="text-amber-400" />} label="Mayor dificultad">
              {checkin.biggest_challenge}
            </TextAnswer>
          )}
          {checkin.questions_for_trainer && (
            <TextAnswer icon={<MessageSquare size={13} className="text-[#EC4899]" />} label="Preguntas">
              {checkin.questions_for_trainer}
            </TextAnswer>
          )}

          {/* Trainer response */}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-fg-secondary mb-2 flex items-center gap-1.5">
              <Send size={11} /> Tu respuesta
            </label>
            <textarea
              value={responseText}
              onChange={e => onResponseChange(e.target.value)}
              rows={3}
              placeholder="Escribe tu feedback y ajustes de plan para esta semana..."
              className="input resize-none text-sm w-full"
              maxLength={1000}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-fg-disabled">{responseText.length}/1000</span>
              <button
                type="button"
                onClick={onSendResponse}
                disabled={sendingResponse || !responseText.trim()}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  hasResponse
                    ? 'bg-surface-2 text-fg-muted border border-border hover:border-border-strong hover:text-fg-primary'
                    : 'bg-brand-primary text-black hover:bg-brand-primary/90',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {sendingResponse
                  ? <><Loader2 size={12} className="animate-spin" /> Enviando...</>
                  : hasResponse
                    ? <><Send size={12} /> Actualizar respuesta</>
                    : <><Send size={12} /> Enviar respuesta</>}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-fg-disabled">
            Enviado el {new Date(checkin.created_at).toLocaleDateString('es-ES', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
      )}
    </div>
  )
}

function MetricCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface/60 rounded-lg p-3 border border-border/60">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs text-fg-secondary">{label}</span>
      </div>
      {children}
    </div>
  )
}

function TextAnswer({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg p-3 bg-surface/60 border border-border/60">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-fg-secondary mb-1">{label}</p>
        <p className="text-sm text-fg-primary leading-relaxed">{children}</p>
      </div>
    </div>
  )
}
