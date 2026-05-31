'use client'

import { Award, Flame, Target, Trophy, Medal, Zap, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface MilestonesProps {
  totalLogs: number
  weightChange: number | null
  streakDays: number
  completedWorkouts: number
}

interface Milestone {
  label: string
  icon: LucideIcon
  unlocked: boolean
  color: string
  progress: number   // 0-100
  hint: string       // shown when locked
}

export default function Milestones({
  totalLogs,
  weightChange,
  streakDays,
  completedWorkouts,
}: MilestonesProps) {
  const absChange = weightChange != null ? Math.abs(weightChange) : 0

  const milestones: Milestone[] = [
    {
      label: 'Primer registro',
      icon: Award,
      unlocked: totalLogs >= 1,
      color: '#0EA5E9',
      progress: Math.min(100, totalLogs * 100),
      hint: 'Registra tu primera medida',
    },
    {
      label: 'Constante',
      icon: Flame,
      unlocked: streakDays >= 3,
      color: '#10B981',
      progress: Math.min(100, Math.round((streakDays / 3) * 100)),
      hint: `${streakDays}/3 días seguidos`,
    },
    {
      label: 'En racha',
      icon: Zap,
      unlocked: streakDays >= 7,
      color: '#F59E0B',
      progress: Math.min(100, Math.round((streakDays / 7) * 100)),
      hint: `${streakDays}/7 días seguidos`,
    },
    {
      label: 'Primer kilo',
      icon: Target,
      unlocked: absChange >= 1,
      color: '#7C3AED',
      progress: Math.min(100, Math.round(absChange * 100)),
      hint: `${absChange.toFixed(1)}/1 kg`,
    },
    {
      label: '10 registros',
      icon: Medal,
      unlocked: totalLogs >= 10,
      color: '#0EA5E9',
      progress: Math.min(100, Math.round((totalLogs / 10) * 100)),
      hint: `${totalLogs}/10 registros`,
    },
    {
      label: 'Guerrero',
      icon: Trophy,
      unlocked: completedWorkouts >= 10,
      color: '#10B981',
      progress: Math.min(100, Math.round((completedWorkouts / 10) * 100)),
      hint: `${completedWorkouts}/10 entrenos`,
    },
    {
      label: '25 registros',
      icon: Star,
      unlocked: totalLogs >= 25,
      color: '#F59E0B',
      progress: Math.min(100, Math.round((totalLogs / 25) * 100)),
      hint: `${totalLogs}/25 registros`,
    },
    {
      label: '30 días',
      icon: Flame,
      unlocked: streakDays >= 30,
      color: '#EF4444',
      progress: Math.min(100, Math.round((streakDays / 30) * 100)),
      hint: `${streakDays}/30 días seguidos`,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 stagger-children">
      {milestones.map((m, i) => {
        const Icon = m.icon
        return (
          <div
            key={m.label}
            className={`card p-4 text-center relative transition-all duration-300 animate-fade-in-up ${
              m.unlocked ? '' : 'opacity-60'
            }`}
            style={{
              animationDelay: `${i * 60}ms`,
              ...(m.unlocked
                ? {
                    borderColor: `${m.color}40`,
                    background: `linear-gradient(135deg, ${m.color}14, ${m.color}05)`,
                    boxShadow: `0 0 18px ${m.color}22`,
                  }
                : {}),
            }}
          >
            <div
              className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
              style={{
                background: m.unlocked ? `${m.color}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${m.unlocked ? `${m.color}40` : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <Icon className="w-5 h-5" style={{ color: m.unlocked ? m.color : '#475569' }} />
            </div>
            <div className="text-xs font-semibold text-white leading-tight mb-1.5">{m.label}</div>

            {m.unlocked ? (
              <div className="text-[10px] font-medium" style={{ color: m.color }}>
                ✓ Desbloqueado
              </div>
            ) : (
              <>
                <div className="h-1 bg-surface-2 rounded-full overflow-hidden mx-1 mb-1">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${m.progress}%`, background: m.color }}
                  />
                </div>
                <div className="text-[10px] text-slate-500">{m.hint}</div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
