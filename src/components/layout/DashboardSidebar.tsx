'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Dumbbell, UtensilsCrossed,
  CalendarDays, MessageSquare, Settings, LogOut, CreditCard, Zap, BarChart2, Search,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile, Subscription } from '@/types/database'
import Avatar from '@/components/ui/Avatar'
import NotificationBell from '@/components/ui/NotificationBell'

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
  { href: '/dashboard/settings', icon: Settings,   label: 'Ajustes' },
  { href: '/pricing',            icon: CreditCard, label: 'Plan' },
]

interface Props {
  profile: Profile
  subscription: Subscription | null
  unreadMessages?: number
  pendingApts?: number
  onClose?: () => void
}

export default function DashboardSidebar({ profile, subscription, unreadMessages = 0, pendingApts = 0, onClose }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const [notifOpen, setNotifOpen] = useState(false)

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const planLabel = subscription?.plan
    ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
    : 'Gratuito'

  return (
    <aside className="w-64 border-r border-border flex flex-col shrink-0 h-full"
           style={{ background: 'linear-gradient(180deg, #0D0D0D 0%, #111111 100%)' }}>

      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div className="p-5 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-glow-sm shrink-0 transition-transform duration-200 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #A3FF4A, #7C3AED)' }}
          >
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm tracking-tight">TrainerBoost</div>
            <div className="text-xs text-slate-500 font-medium">Dashboard</div>
          </div>
          <NotificationBell
            userId={profile.id}
            isOpen={notifOpen}
            onToggle={() => setNotifOpen(v => !v)}
          />
        </div>
      </div>

      {/* ── Plan badge ────────────────────────────────────────────────── */}
      {subscription?.status === 'active' && (
        <div
          className="mx-4 mt-3 px-3 py-2 rounded-lg border transition-all duration-200 hover:shadow-glow-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(163,255,74,0.07) 0%, rgba(124,58,237,0.04) 100%)',
            borderColor: 'rgba(163,255,74,0.2)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-brand-primary" />
              <span className="text-xs font-semibold text-brand-primary">Plan {planLabel}</span>
            </div>
            <span className="text-xs text-slate-400">
              {subscription.max_clients === 999999 ? '∞' : subscription.max_clients} clientes
            </span>
          </div>
        </div>
      )}

      {/* ── Quick search ─────────────────────────────────────────────── */}
      <div className="px-3 pt-3">
        <button
          onClick={() => {
            const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
            window.dispatchEvent(e)
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/60 text-slate-500 text-xs hover:border-slate-600 hover:text-slate-400 transition-all group"
          style={{ background: 'rgba(10,10,10,0.5)' }}
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="hidden md:flex items-center gap-0.5 text-[10px] font-mono opacity-60 group-hover:opacity-100 transition-opacity">⌘K</kbd>
        </button>
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-smooth-out group relative',
                isActive
                  ? 'nav-pill-active'
                  : 'text-slate-400 hover:bg-surface-2 hover:text-slate-200'
              )}
            >
              <item.icon className={cn(
                'w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                isActive ? 'text-lime-400' : 'text-slate-500 group-hover:text-slate-300'
              )} />
              <span>{item.label}</span>

              {item.label === 'Mensajes' && unreadMessages > 0 && (
                <span className="ml-auto bg-brand-primary text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadMessages}
                </span>
              )}
              {item.label === 'Citas' && pendingApts > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {pendingApts}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Bottom items ──────────────────────────────────────────────── */}
      <div className="p-3 border-t border-border/60 space-y-0.5">
        {BOTTOM_ITEMS.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-smooth-out group',
                isActive ? 'bg-surface-2 text-white' : 'text-slate-400 hover:bg-surface-2 hover:text-slate-200'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-300 transition-transform duration-200 group-hover:scale-110" />
              {item.label}
            </Link>
          )
        })}

        {/* User + logout */}
        <div className="pt-2 mt-1 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="ring-2 ring-brand-primary/20 rounded-full">
              <Avatar name={profile.full_name} url={profile.avatar_url} size="sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{profile.full_name}</div>
              <div className="text-xs text-slate-500 truncate">Entrenador</div>
            </div>
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
    </aside>
  )
}
