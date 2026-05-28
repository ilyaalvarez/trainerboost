'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Dumbbell, UtensilsCrossed,
  CalendarDays, MessageSquare, Settings, LogOut, CreditCard, Zap, BarChart2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile, Subscription } from '@/types/database'
import Avatar from '@/components/ui/Avatar'

const NAV_ITEMS = [
  { href: '/dashboard',              icon: LayoutDashboard, label: 'Panel' },
  { href: '/dashboard/clients',      icon: Users,           label: 'Clientes' },
  { href: '/dashboard/routines',     icon: Dumbbell,        label: 'Rutinas' },
  { href: '/dashboard/nutrition',    icon: UtensilsCrossed, label: 'Nutrición' },
  { href: '/dashboard/appointments', icon: CalendarDays,    label: 'Citas' },
  { href: '/dashboard/messages',     icon: MessageSquare,   label: 'Mensajes' },
  { href: '/dashboard/analytics',    icon: BarChart2,       label: 'Analytics' },
]

const BOTTOM_ITEMS = [
  { href: '/dashboard/settings', icon: Settings,    label: 'Ajustes' },
  { href: '/pricing',            icon: CreditCard,  label: 'Plan' },
]

interface Props {
  profile: Profile
  subscription: Subscription | null
  unreadMessages?: number
}

export default function DashboardSidebar({ profile, subscription, unreadMessages = 0 }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const planLabel = subscription?.plan
    ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
    : 'Gratuito'

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col shrink-0 h-full">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-brand-primary" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">TrainerBoost</div>
            <div className="text-xs text-slate-500 font-medium">Dashboard</div>
          </div>
        </div>
      </div>

      {/* Plan badge */}
      {subscription?.status === 'active' && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-primary">Plan {planLabel}</span>
            <span className="text-xs text-slate-400">
              {subscription.max_clients === 999999 ? '∞' : subscription.max_clients} clientes
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-brand-primary/15 text-brand-primary'
                  : 'text-slate-400 hover:bg-surface-2 hover:text-slate-200'
              )}
            >
              <item.icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-brand-primary' : 'text-slate-500 group-hover:text-slate-300')} />
              <span>{item.label}</span>
              {item.label === 'Mensajes' && unreadMessages > 0 && (
                <span className="ml-auto bg-brand-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadMessages}
                </span>
              )}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-primary rounded-r-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom items */}
      <div className="p-3 border-t border-border space-y-0.5">
        {BOTTOM_ITEMS.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive ? 'bg-surface-2 text-white' : 'text-slate-400 hover:bg-surface-2 hover:text-slate-200'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-300" />
              {item.label}
            </Link>
          )
        })}

        {/* User + logout */}
        <div className="pt-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar name={profile.full_name} url={profile.avatar_url} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{profile.full_name}</div>
              <div className="text-xs text-slate-500 truncate">Entrenador</div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
