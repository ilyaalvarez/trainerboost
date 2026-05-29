'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'
import DashboardSidebar from './DashboardSidebar'
import Avatar from '@/components/ui/Avatar'
import type { Profile, Subscription } from '@/types/database'

interface Props {
  profile: Profile
  subscription: Subscription | null
  unreadMessages: number
  children: React.ReactNode
}

export default function DashboardShell({ profile, subscription, unreadMessages, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ── Desktop sidebar (always visible ≥ md) ────────────────────── */}
      <div className="hidden md:flex shrink-0">
        <DashboardSidebar
          profile={profile}
          subscription={subscription}
          unreadMessages={unreadMessages}
        />
      </div>

      {/* ── Mobile overlay sidebar ────────────────────────────────────── */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed left-0 top-0 h-full z-50 md:hidden animate-slide-right">
            <DashboardSidebar
              profile={profile}
              subscription={subscription}
              unreadMessages={unreadMessages}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <div
          className="h-14 flex items-center justify-between px-4 border-b md:hidden shrink-0 backdrop-blur-xl"
          style={{
            background: 'rgba(15,23,42,0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-2 transition-all duration-200 active:scale-95"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 origin-left ${sidebarOpen ? 'rotate-45 translate-x-0.5' : ''}`} />
              <span className={`block h-0.5 bg-current rounded-full transition-all duration-200 ${sidebarOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 origin-left ${sidebarOpen ? '-rotate-45 translate-x-0.5' : ''}`} />
            </div>
          </button>

          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shadow-glow-sm"
              style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">TrainerBoost</span>
          </div>

          <div className="ring-2 ring-brand-primary/20 rounded-full">
            <Avatar name={profile.full_name} url={profile.avatar_url} size="sm" />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
