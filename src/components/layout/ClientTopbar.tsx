'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  TrendingUp, Dumbbell, UtensilsCrossed, CalendarDays,
  MessageSquare, Zap, LogOut, ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types/database'
import Avatar from '@/components/ui/Avatar'

const NAV_ITEMS = [
  { href: '/client',              icon: TrendingUp,      label: 'Progreso' },
  { href: '/client/routine',     icon: Dumbbell,        label: 'Mi Rutina' },
  { href: '/client/nutrition',   icon: UtensilsCrossed, label: 'Nutrición' },
  { href: '/client/appointments',icon: CalendarDays,    label: 'Citas' },
  { href: '/client/messages',    icon: MessageSquare,   label: 'Mensajes' },
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
    <header className="bg-surface border-b border-border sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-brand-primary" />
            </div>
            <span className="font-bold text-white text-sm">TrainerBoost</span>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const isActive = pathname === item.href ||
                (item.href !== '/client' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    isActive
                      ? 'bg-brand-primary/15 text-brand-primary'
                      : 'text-slate-400 hover:bg-surface-2 hover:text-slate-200'
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User */}
          <div className="flex items-center gap-2">
            <Avatar name={profile.full_name} url={profile.avatar_url} size="sm" />
            <span className="text-xs text-slate-400 hidden sm:block">{profile.full_name.split(' ')[0]}</span>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex md:hidden items-center gap-1 pb-2 overflow-x-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href ||
              (item.href !== '/client' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                  isActive ? 'bg-brand-primary/15 text-brand-primary' : 'text-slate-400'
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
