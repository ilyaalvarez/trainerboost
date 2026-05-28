'use client'

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
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-surface/90 backdrop-blur-md border-b border-border sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">TrainerBoost</span>
          </div>

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
                    'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    isActive
                      ? 'text-brand-primary'
                      : 'text-slate-400 hover:bg-surface-2 hover:text-slate-200'
                  )}
                  style={isActive ? {
                    background: 'linear-gradient(180deg, rgba(14,165,233,0.1) 0%, transparent 100%)',
                  } : undefined}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #0EA5E9, #7C3AED)' }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User area */}
          <div className="flex items-center gap-2.5">
            <div className="ring-2 ring-brand-primary/20 rounded-full">
              <Avatar name={profile.full_name} url={profile.avatar_url} size="sm" />
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:block">
              {profile.full_name.split(' ')[0]}
            </span>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex md:hidden items-center gap-0.5 pb-2 overflow-x-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href ||
              (item.href !== '/client' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                  isActive ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-400'
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
