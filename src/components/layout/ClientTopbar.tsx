'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home, Dumbbell,
  MessageSquare, Zap, LogOut, CheckSquare, Trophy,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types/database'
import Avatar from '@/components/ui/Avatar'
import NotificationBell from '@/components/ui/NotificationBell'

interface Props {
  profile: Profile
}

export default function ClientTopbar({ profile }: Props) {
  const pathname    = usePathname()
  const router      = useRouter()
  const supabase    = createClient()
  const [notifOpen, setNotifOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    async function fetchUnread() {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', profile.id)
        .is('read_at', null)
      setUnreadMessages(count ?? 0)
    }
    fetchUnread()

    const channel = supabase.channel('client-topbar-unread')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${profile.id}` },
        () => fetchUnread())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `receiver_id=eq.${profile.id}` },
        () => fetchUnread())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, profile.id])

  const NAV_ITEMS = [
    { href: '/client',                icon: Home,            label: 'Inicio',    badge: 0 },
    { href: '/client/routine',        icon: Dumbbell,        label: 'Rutina',    badge: 0 },
    { href: '/client/habits',         icon: CheckSquare,     label: 'Hábitos',   badge: 0 },
    { href: '/client/achievements',   icon: Trophy,          label: 'Logros',    badge: 0 },
    { href: '/client/messages',       icon: MessageSquare,   label: 'Mensajes',  badge: unreadMessages },
  ]

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* ── Top header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-border/80"
              style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.03)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link href="/client" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-brand-primary flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="font-bold text-fg-primary text-sm tracking-tight hidden sm:block">TrainerBoost</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_ITEMS.map(item => {
                const isActive = pathname === item.href ||
                  (item.href !== '/client' && pathname.startsWith(item.href))
                return (
                  <Link key={item.href} href={item.href}
                        className={cn(
                          'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 group',
                          isActive
                            ? 'text-brand-primary bg-brand-primary/[0.07]'
                            : 'text-fg-muted hover:bg-surface-2 hover:text-fg-primary',
                        )}>
                    <div className="relative">
                      <item.icon className={cn('w-3.5 h-3.5 transition-all duration-200',
                        isActive ? 'text-brand-primary' : 'text-fg-muted group-hover:text-fg-secondary')} />
                      {item.badge > 0 && !isActive && (
                        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-semantic-error text-white text-[9px] font-bold flex items-center justify-center">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-brand-primary" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* User area */}
            <div className="flex items-center gap-2">
              <Link href="/client/settings" className="hidden sm:flex items-center gap-2.5 px-2 py-1 rounded-lg hover:bg-surface-2 transition-colors">
                <div className="ring-2 ring-brand-primary/25 rounded-full">
                  <Avatar name={profile.full_name} url={profile.avatar_url} size="sm" />
                </div>
                <span className="text-xs text-fg-muted font-medium">
                  {profile.full_name.split(' ')[0]}
                </span>
              </Link>
              <NotificationBell userId={profile.id} isOpen={notifOpen} onToggle={() => setNotifOpen(v => !v)} />
              <button onClick={logout} title="Cerrar sesión"
                      className="p-1.5 rounded-lg text-fg-disabled hover:text-semantic-error-text hover:bg-semantic-error/8 transition-all duration-150">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Bottom nav (mobile only) ─────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border/60 bg-background/[0.97] backdrop-blur-xl"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-stretch h-14">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href ||
              (item.href !== '/client' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}
                    className="flex-1 flex flex-col items-center justify-center gap-0.5 relative min-h-[44px]"
                    style={{ WebkitTapHighlightColor: 'transparent' }}>
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-full bg-brand-primary" />
                )}
                {/* Icon */}
                <div className="relative">
                  <item.icon className={cn('w-5 h-5 transition-colors duration-150',
                    isActive ? 'text-brand-primary' : 'text-fg-muted')} />
                  {item.badge > 0 && !isActive && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 rounded-full bg-semantic-error text-white text-[8px] font-bold flex items-center justify-center px-0.5">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                {/* Label */}
                <span className={cn('text-[9px] font-semibold tracking-wide transition-colors duration-150',
                  isActive ? 'text-brand-primary' : 'text-fg-disabled')}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
