'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { Search, Users, CalendarDays, MessageSquare, Dumbbell, Apple, TrendingUp, Settings, BarChart2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/ui/Avatar'

interface NavItem {
  type: 'nav'
  label: string
  href: string
  icon: React.ReactNode
  keywords: string
}

interface ClientItem {
  type: 'client'
  id: string
  name: string
  avatar_url: string | null
  href: string
}

type Item = NavItem | ClientItem

const NAV_ITEMS: NavItem[] = [
  { type: 'nav', label: 'Panel principal',    href: '/dashboard',              icon: <TrendingUp className="w-4 h-4" />,    keywords: 'dashboard home inicio panel' },
  { type: 'nav', label: 'Mis clientes',       href: '/dashboard/clients',      icon: <Users className="w-4 h-4" />,         keywords: 'clientes lista gestión' },
  { type: 'nav', label: 'Rutinas',            href: '/dashboard/routines',     icon: <Dumbbell className="w-4 h-4" />,      keywords: 'rutinas ejercicios entrenamiento' },
  { type: 'nav', label: 'Nutrición',          href: '/dashboard/nutrition',    icon: <Apple className="w-4 h-4" />,         keywords: 'nutrición planes comida macros' },
  { type: 'nav', label: 'Citas',              href: '/dashboard/appointments', icon: <CalendarDays className="w-4 h-4" />,  keywords: 'citas calendario agenda sesiones' },
  { type: 'nav', label: 'Mensajes',           href: '/dashboard/messages',     icon: <MessageSquare className="w-4 h-4" />, keywords: 'mensajes chat comunicación' },
  { type: 'nav', label: 'Analíticas',         href: '/dashboard/analytics',    icon: <BarChart2 className="w-4 h-4" />,     keywords: 'analytics analíticas estadísticas progreso' },
  { type: 'nav', label: 'Configuración',      href: '/dashboard/settings',     icon: <Settings className="w-4 h-4" />,      keywords: 'settings configuración perfil contraseña' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function CommandPalette({ isOpen, onClose }: Props) {
  const [query, setQuery]     = useState('')
  const [clients, setClients] = useState<ClientItem[]>([])
  const [active, setActive]   = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router   = useRouter()

  useEffect(() => {
    if (!isOpen) return
    const supabase = createClient()
    async function loadClients() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('trainer_clients')
        .select('client_id, profiles!client_id(full_name, avatar_url)')
        .eq('trainer_id', user.id)
        .eq('status', 'active')
        .limit(50)
      setClients(
        (data ?? []).map(r => {
          const p = r.profiles as unknown as { full_name: string; avatar_url: string | null }
          return { type: 'client' as const, id: r.client_id, name: p.full_name, avatar_url: p.avatar_url, href: `/dashboard/clients/${r.client_id}` }
        })
      )
    }
    loadClients()
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [isOpen])

  const filteredNav = NAV_ITEMS.filter(i =>
    !query || i.label.toLowerCase().includes(query.toLowerCase()) || i.keywords.includes(query.toLowerCase())
  )

  const filteredClients = clients.filter(c =>
    !query || c.name.toLowerCase().includes(query.toLowerCase())
  )

  const allItems: Item[] = [...filteredNav, ...filteredClients]

  useEffect(() => { setActive(0) }, [query])

  const navigate = useCallback((item: Item) => {
    router.push(item.href)
    onClose()
    setQuery('')
  }, [router, onClose])

  useEffect(() => {
    if (!isOpen) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); setQuery('') }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, allItems.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
      if (e.key === 'Enter') { e.preventDefault(); if (allItems[active]) navigate(allItems[active]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, allItems, active, navigate, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4"
      style={{ background: 'rgba(7,12,24,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
        style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar páginas o clientes..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] text-slate-500 border border-border/60 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {allItems.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Sin resultados</p>
          ) : (
            <>
              {filteredNav.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Páginas</p>
                  {filteredNav.map((item, i) => (
                    <button
                      key={item.href}
                      onClick={() => navigate(item)}
                      onMouseEnter={() => setActive(i)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${active === i ? 'bg-brand-primary/10' : 'hover:bg-surface-2'}`}
                    >
                      <span className={`shrink-0 ${active === i ? 'text-brand-primary' : 'text-slate-500'}`}>{item.icon}</span>
                      <span className={`text-sm font-medium ${active === i ? 'text-brand-primary' : 'text-slate-200'}`}>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
              {filteredClients.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Clientes</p>
                  {filteredClients.map((item, i) => {
                    const idx = filteredNav.length + i
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item)}
                        onMouseEnter={() => setActive(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${active === idx ? 'bg-brand-primary/10' : 'hover:bg-surface-2'}`}
                      >
                        <Avatar name={item.name} url={item.avatar_url} size="sm" />
                        <span className={`text-sm font-medium ${active === idx ? 'text-brand-primary' : 'text-slate-200'}`}>{item.name}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border/40 text-[11px] text-slate-600">
          <span><kbd className="font-mono">↑↓</kbd> navegar</span>
          <span><kbd className="font-mono">↵</kbd> abrir</span>
          <span><kbd className="font-mono">Esc</kbd> cerrar</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
