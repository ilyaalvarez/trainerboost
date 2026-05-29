'use client'

import { Award, Flame, Target, Trophy, Medal, Zap, Lock } from 'lucide-react'
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
}

export default function Milestones({
  totalLogs,
  weightChange,
  streakDays,
  completedWorkouts,
}: MilestonesProps) {
  const milestones: Milestone[] = [
    { label: 'Primer registro', icon: Award,  unlocked: totalLogs >= 1,                                      color: '#0EA5E9' },
    { label: 'Constante',       icon: Flame,  unlocked: streakDays >= 3,                                     color: '#10B981' },
    { label: 'En racha',        icon: Zap,    unlocked: streakDays >= 7,                                     color: '#F59E0B' },
    { label: 'Primer kilo',     icon: Target, unlocked: weightChange != null && Math.abs(weightChange) >= 1, color: '#7C3AED' },
    { label: '10 registros',    icon: Medal,  unlocked: totalLogs >= 10,                                     color: '#0EA5E9' },
    { label: 'Guerrero',        icon: Trophy, unlocked: completedWorkouts >= 10,                             color: '#10B981' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 stagger-children">
      {milestones.map((m, i) => {
        const Icon = m.icon
        return (
          <div
            key={m.label}
            className={`card p-4 text-center relative transition-all duration-300 animate-fade-in-up ${
              m.unlocked ? '' : 'opacity-40 grayscale'
            }`}
            style={{
              animationDelay: `${i * 70}ms`,
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
            <div className="text-xs font-semibold text-white leading-tight">{m.label}</div>
            <div
              className="text-[10px] mt-1 flex items-center justify-center gap-1"
              style={{ color: m.unlocked ? m.color : '#475569' }}
            >
              {m.unlocked ? (
                '✓ Desbloqueado'
              ) : (
                <>
                  <Lock className="w-2.5 h-2.5" /> Bloqueado
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
