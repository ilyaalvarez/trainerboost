'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  MessageCircle,
  Dumbbell,
  Apple,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import type { NotificationType } from '@/types/database'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)}d`
}

interface TypeConfig {
  Icon: React.ElementType
  color: string
}

const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
  message:     { Icon: MessageCircle, color: 'text-sky-400' },
  routine:     { Icon: Dumbbell,      color: 'text-violet-400' },
  meal_plan:   { Icon: Apple,         color: 'text-emerald-400' },
  appointment: { Icon: Calendar,      color: 'text-amber-400' },
  progress:    { Icon: TrendingUp,    color: 'text-rose-400' },
  system:      { Icon: Bell,          color: 'text-slate-400' },
}

interface Props {
  userId: string
  isOpen: boolean
  onToggle: () => void
}

export default function NotificationBell({ userId, isOpen, onToggle }: Props) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(userId)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dropdownPos, setDropdownPos] = useState<{
    top: number
    left?: number
    right?: number
  } | null>(null)

  const calcPosition = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const dropdownW = Math.min(320, window.innerWidth - 16)

    if (window.innerWidth - rect.left >= dropdownW) {
      // Enough space to the right (e.g. sidebar bell) → open rightward
      setDropdownPos({
        top:  rect.bottom + 8,
        left: Math.min(rect.left, window.innerWidth - dropdownW - 8),
      })
    } else {
      // Near the right edge (e.g. mobile topbar) → open leftward
      setDropdownPos({
        top:   rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      })
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    calcPosition()
    if (unreadCount > 0) markAllRead()
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onToggle()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onToggle, calcPosition]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRowClick(id: string, link: string | null) {
    await markRead(id)
    onToggle()
    if (link) router.push(link)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={onToggle}
        className="relative p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-2 transition-all duration-150"
        aria-label="Notificaciones"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-0.5 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && dropdownPos && (
        <div
          className="fixed w-[min(20rem,calc(100vw-1rem))] z-[200] card shadow-2xl overflow-hidden"
          style={{
            top: dropdownPos.top,
            ...(dropdownPos.left !== undefined
              ? { left: dropdownPos.left }
              : { right: dropdownPos.right }),
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <span className="text-sm font-semibold text-white">Notificaciones</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
              >
                Marcar todo
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-sm">
                Sin notificaciones
              </div>
            ) : (
              notifications.map(n => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system
                const { Icon, color } = cfg
                const isUnread = !n.read_at

                return (
                  <button
                    key={n.id}
                    onClick={() => handleRowClick(n.id, n.link)}
                    className={[
                      'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors duration-150',
                      'hover:bg-slate-700/40',
                      isUnread ? 'bg-slate-800/60' : '',
                    ].join(' ')}
                  >
                    <span className={['mt-0.5 shrink-0', color].join(' ')}>
                      <Icon className="w-4 h-4" />
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white leading-snug">
                        {n.title}
                      </div>
                      {n.body && (
                        <div className="text-xs text-slate-400 truncate mt-0.5">
                          {n.body}
                        </div>
                      )}
                      <div className="text-xs text-slate-500 mt-1">
                        {relativeTime(n.created_at)}
                      </div>
                    </div>

                    {isUnread && (
                      <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-sky-400" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
