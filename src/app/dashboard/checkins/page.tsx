'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  ClipboardList, ChevronDown, ChevronUp, Flame,
  Dumbbell, UtensilsCrossed, Scale, Activity, Search,
  AlertTriangle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/ui/Avatar'
import EmptyState from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/database'

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeeklyCheckin {
  id: string
  client_id: string
  trainer_id: string
  week_start: string
  energy: number | null
  has_pain: boolean
  pain_description: string | null
  routine_adherence: number | null
  diet_adherence: number | null
  weight_kg: number | null
  client_note: string | null
  created_at: string
}

interface CheckinWithClient extends WeeklyCheckin {
  client: Profile
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function weekLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const end = new Date(d)
  end.setDate(d.getDate() + 6)
  return `${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

function ScoreBar({ value, max = 10, color }: { value: number | null; max?: number; color: string }) {
  if (value == null) return <span className="text-fg-disabled text-xs">—</span>
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
      <span className="text-xs font-mono text-fg-primary">{value}</span>
    </div>
  )
}

function AdherenceBar({ value }: { value: number | null }) {
  if (value == null) return <span className="text-fg-disabled text-xs">—</span>
  const color = value >= 75 ? '#10B981' : value >= 50 ? '#F59E0B' : '#EF4444'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-mono text-fg-primary">{value}%</span>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CheckinsPage() {
  const supabase = createClient()

  const [checkins, setCheckins]     = useState<CheckinWithClient[]>([])
  const [loading, setLoading]       = useState(true)
  const [expanded, setExpanded]     = useState<Set<string>>(new Set())
  const [search, setSearch]         = useState('')
  const [weekFilter, setWeekFilter] = useState('')
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([])

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

  const filtered = checkins.filter(c => {
    const matchWeek   = !weekFilter || c.week_start === weekFilter
    const matchSearch = !search.trim() || c.client.full_name.toLowerCase().includes(search.toLowerCase())
    return matchWeek && matchSearch
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
      <div>
        <h1 className="text-2xl font-bold text-fg-primary">Check-ins semanales</h1>
        <p className="text-fg-secondary text-sm mt-0.5">Respuestas de tus clientes al check-in de la semana</p>
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

      {/* Stats row */}
      {checkins.length > 0 && (
        <div className="flex gap-4 text-sm">
          <span className="text-fg-secondary">{filtered.length} check-ins</span>
          {weekFilter && (
            <>
              <span className="text-fg-disabled">·</span>
              <span className="text-fg-secondary">semana del {weekLabel(weekFilter)}</span>
            </>
          )}
        </div>
      )}

      {/* Content */}
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
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── CheckinCard ──────────────────────────────────────────────────────────────

function CheckinCard({ checkin, expanded, onToggle }: {
  checkin: CheckinWithClient
  expanded: boolean
  onToggle: () => void
}) {
  const hasConcern = checkin.has_pain || (checkin.energy != null && checkin.energy <= 3) || (checkin.routine_adherence != null && checkin.routine_adherence <= 25)

  return (
    <div className={cn('card overflow-hidden', hasConcern && 'border-amber-500/30')}>
      <button
        type="button"
        className="w-full p-4 text-left hover:bg-[#334155]/20 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Avatar name={checkin.client.full_name} url={checkin.client.avatar_url} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-fg-primary">{checkin.client.full_name}</span>
              {hasConcern && (
                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-semantic-warning/15 text-semantic-warning-text">
                  <AlertTriangle size={10} /> Atención
                </span>
              )}
            </div>
            <p className="text-xs text-fg-muted mt-0.5">{weekLabel(checkin.week_start)}</p>
          </div>

          {/* Quick stats */}
          <div className="hidden sm:flex items-center gap-4 text-xs shrink-0">
            {checkin.energy != null && (
              <div className="flex items-center gap-1">
                <Flame size={12} className="text-semantic-warning-text" />
                <span className={cn('font-mono font-bold', checkin.energy <= 3 ? 'text-semantic-error-text' : checkin.energy <= 6 ? 'text-semantic-warning-text' : 'text-semantic-success-text')}>
                  {checkin.energy}/10
                </span>
              </div>
            )}
            {checkin.routine_adherence != null && (
              <div className="flex items-center gap-1">
                <Dumbbell size={12} className="text-semantic-info-text" />
                <span className={cn('font-mono font-bold', checkin.routine_adherence <= 25 ? 'text-semantic-error-text' : checkin.routine_adherence <= 50 ? 'text-semantic-warning-text' : 'text-semantic-success-text')}>
                  {checkin.routine_adherence}%
                </span>
              </div>
            )}
            {checkin.weight_kg != null && (
              <div className="flex items-center gap-1">
                <Scale size={12} className="text-[#C4B5FD]" />
                <span className="font-mono text-fg-secondary">{checkin.weight_kg} kg</span>
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
        <div className="border-t border-[#334155] px-4 py-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Energía */}
            <div className="bg-[#0F172A]/60 rounded-lg p-3 border border-[#334155]/60">
              <div className="flex items-center gap-1.5 mb-2">
                <Flame size={13} className="text-semantic-warning-text" />
                <span className="text-xs text-fg-secondary">Energía</span>
              </div>
              <ScoreBar value={checkin.energy} color="#F59E0B" />
            </div>

            {/* Adherencia rutina */}
            <div className="bg-[#0F172A]/60 rounded-lg p-3 border border-[#334155]/60">
              <div className="flex items-center gap-1.5 mb-2">
                <Dumbbell size={13} className="text-semantic-info-text" />
                <span className="text-xs text-fg-secondary">Rutina</span>
              </div>
              <AdherenceBar value={checkin.routine_adherence} />
            </div>

            {/* Adherencia dieta */}
            <div className="bg-[#0F172A]/60 rounded-lg p-3 border border-[#334155]/60">
              <div className="flex items-center gap-1.5 mb-2">
                <UtensilsCrossed size={13} className="text-semantic-success-text" />
                <span className="text-xs text-fg-secondary">Dieta</span>
              </div>
              <ScoreBar value={checkin.diet_adherence} color="#10B981" />
            </div>

            {/* Peso */}
            <div className="bg-[#0F172A]/60 rounded-lg p-3 border border-[#334155]/60">
              <div className="flex items-center gap-1.5 mb-2">
                <Scale size={13} className="text-[#C4B5FD]" />
                <span className="text-xs text-fg-secondary">Peso</span>
              </div>
              {checkin.weight_kg != null
                ? <span className="text-sm font-mono font-bold text-fg-primary">{checkin.weight_kg} kg</span>
                : <span className="text-fg-disabled text-xs">No registrado</span>
              }
            </div>
          </div>

          {/* Dolor */}
          {checkin.has_pain && (
            <div className="flex items-start gap-2 rounded-lg p-3 bg-semantic-error/10 border border-semantic-error/20">
              <AlertTriangle size={14} className="text-semantic-error-text mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-semantic-error-text">Reportó dolor o molestias</p>
                {checkin.pain_description && (
                  <p className="text-xs text-fg-secondary mt-0.5">{checkin.pain_description}</p>
                )}
              </div>
            </div>
          )}

          {/* Nota del cliente */}
          {checkin.client_note && (
            <div className="flex items-start gap-2 rounded-lg p-3 bg-[#1E293B]/60 border border-[#334155]/60">
              <Activity size={13} className="text-fg-secondary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-fg-secondary mb-1">Nota del cliente</p>
                <p className="text-sm text-fg-secondary leading-relaxed">{checkin.client_note}</p>
              </div>
            </div>
          )}

          <p className="text-[10px] text-fg-disabled">
            Enviado el {new Date(checkin.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}
    </div>
  )
}
