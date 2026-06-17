'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Lock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Achievement, ClientAchievement } from '@/types/database'

interface AchievementWithStatus extends Achievement {
  unlocked: boolean
  unlocked_at: string | null
}

const CATEGORY_LABELS: Record<Achievement['category'], string> = {
  sesiones: 'Sesiones',
  racha:    'Rachas',
  progreso: 'Progreso',
  habitos:  'Hábitos',
  social:   'Social',
}

const CATEGORY_ORDER: Achievement['category'][] = ['sesiones', 'racha', 'habitos', 'progreso', 'social']

export default function AchievementsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: all }, { data: unlocked }] = await Promise.all([
        supabase.from('achievements').select('*').order('category').order('threshold'),
        supabase
          .from('client_achievements')
          .select('achievement_id, unlocked_at')
          .eq('client_id', user.id),
      ])

      const unlockedMap = new Map(
        (unlocked ?? []).map((u: Pick<ClientAchievement, 'achievement_id' | 'unlocked_at'>) => [u.achievement_id, u.unlocked_at])
      )

      setAchievements(
        (all ?? []).map(a => ({
          ...a,
          unlocked: unlockedMap.has(a.id),
          unlocked_at: unlockedMap.get(a.id) ?? null,
        }))
      )
      setLoading(false)
    }
    load()
  }, [supabase])

  const unlockedCount = achievements.filter(a => a.unlocked).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-fg-muted" />
      </div>
    )
  }

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = achievements.filter(a => a.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {} as Record<Achievement['category'], AchievementWithStatus[]>)

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-fg-primary">Logros</h1>
            <p className="text-sm text-fg-muted mt-0.5">Tu progreso a lo largo del tiempo</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-mono text-brand-primary">{unlockedCount}</div>
            <div className="text-xs text-fg-muted">de {achievements.length} desbloqueados</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-primary transition-all duration-700"
            style={{ width: achievements.length ? `${(unlockedCount / achievements.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Categories */}
      {(Object.entries(grouped) as [Achievement['category'], AchievementWithStatus[]][]).map(([cat, items]) => (
        <div key={cat} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-fg-muted px-1">
            {CATEGORY_LABELS[cat]}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {items.map(a => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AchievementCard({ achievement: a }: { achievement: AchievementWithStatus }) {
  return (
    <div className={cn(
      'card p-4 flex items-center gap-4 transition-all duration-200',
      a.unlocked
        ? 'border-brand-primary/20 bg-brand-primary/3'
        : 'opacity-50 grayscale'
    )}>
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border',
        a.unlocked
          ? 'border-brand-primary/20 bg-brand-primary/8'
          : 'border-border bg-surface-2'
      )}>
        {a.unlocked ? a.icon : <Lock className="w-5 h-5 text-fg-disabled" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm text-fg-primary truncate">{a.name}</span>
          {a.unlocked && <Star className="w-3 h-3 text-brand-primary shrink-0 fill-current" />}
        </div>
        <p className="text-xs text-fg-muted mt-0.5 leading-snug">{a.description}</p>
        {a.unlocked && a.unlocked_at && (
          <p className="text-[10px] text-fg-disabled mt-1">
            {new Date(a.unlocked_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  )
}
