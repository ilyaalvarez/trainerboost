'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  TrendingUp, Dumbbell, UtensilsCrossed, CalendarDays,
  MessageSquare, Zap, LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types/database'
import Avatar from '@/components/ui/Avatar'
import NotificationBell from '@/components/ui/NotificationBell'

const NAV_ITEMS = [
  { href: '/client',               icon: TrendingUp,      label: 'Progreso' },
  { href: '/client/routine',       icon: Dumbbell,        label: 'Mi Rutina' },
  { href: '/client/nutrition',     icon: UtensilsCrossed, label: 'Nutrición' },
  { href: '/client/appointments',  icon: CalendarDays,    label: 'Citas' },
  { href: '/client/messages',      icon: MessageSquare,   label: 'Mensajes' },
]

interface Props {
  profile: Profile
}

export default function ClientTopbar({ profile }: Props) {
  const pathname    = usePathname()
  const router      = useRouter()
  const supabase    = createClient()
  const [notifOpen, setNotifOpen] = useState(false)

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-40">
      {/* Main bar */}
      <div className="bg-surface/90 backdrop-blur-xl border-b border-border/80"
           style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.03)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link href="/client" className="flex items-center gap-2.5 group">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-glow-sm"
                style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}
              >
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-sm tracking-tight hidden sm:block">TrainerBoost</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_ITEMS.map(item => {
                const isActive = pathname === item.href ||
                  (item.href !== '/client' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 group',
                      isActive
                        ? 'text-brand-primary'
                        : 'text-slate-400 hover:bg-surface-2 hover:text-slate-100',
                    )}
                    style={isActive ? {
                      background: 'linear-gradient(180deg, rgba(14,165,233,0.1) 0%, transparent 100%)',
                    } : undefined}
                  >
                    <item.icon className={cn(
                      'w-3.5 h-3.5 transition-all duration-200',
                      isActive
                        ? 'text-brand-primary'
                        : 'text-slate-500 group-hover:text-slate-300 group-hover:scale-110',
                    )} />
                    {item.label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full"
                        style={{ background: 'linear-gradient(90deg, #0EA5E9, #7C3AED)', boxShadow: '0 0 6px rgba(14,165,233,0.6)' }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* User area */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2.5 px-2 py-1 rounded-lg hover:bg-surface-2 transition-colors cursor-default group">
                <div className="ring-2 ring-brand-primary/25 rounded-full transition-all duration-200 group-hover:ring-brand-primary/50">
                  <Avatar name={profile.full_name} url={profile.avatar_url} size="sm" />
                </div>
                <span className="text-xs text-slate-400 font-medium group-hover:text-slate-200 transition-colors">
                  {profile.full_name.split(' ')[0]}
                </span>
              </div>
              <NotificationBell
                userId={profile.id}
                isOpen={notifOpen}
                onToggle={() => setNotifOpen(v => !v)}
              />
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 group"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden bg-surface/95 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex items-center gap-0.5 py-1.5 overflow-x-auto">
            {NAV_ITEMS.map(item => {
              const isActive = pathname === item.href ||
                (item.href !== '/client' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0',
                    isActive
                      ? 'text-brand-primary bg-brand-primary/10 border border-brand-primary/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-surface-2',
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
