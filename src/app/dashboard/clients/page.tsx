'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Users, Search, Plus, Copy, RefreshCw, ChevronLeft, ChevronRight,
  UserPlus, Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, formatDate, timeAgo } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import type { ClientWithProfile, ClientStatus, Invitation } from '@/types/database'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

type FilterTab = 'all' | ClientStatus

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all',    label: 'Todos'     },
  { value: 'active', label: 'Activos'   },
  { value: 'paused', label: 'Pausados'  },
  { value: 'ended',  label: 'Terminados'},
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientRow extends ClientWithProfile {
  lastRoutine?: string | null
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const supabase = createClient()

  // Data
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // UI state
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState<FilterTab>('all')
  const [page, setPage]           = useState(1)

  // Invite modal
  const [inviteOpen, setInviteOpen]     = useState(false)
  const [invitation, setInvitation]     = useState<Invitation | null>(null)
  const [inviteLoading, setInviteLoading] = useState(false)

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data, error } = await supabase
        .from('trainer_clients')
        .select('*, profile:client_id(*)')
        .eq('trainer_id', user.id)
        .order('started_at', { ascending: false })

      if (error) throw error

      // Fetch last routine for each client
      const clientIds = (data ?? []).map((c: ClientWithProfile) => c.client_id)
      let routineMap: Record<string, string | null> = {}

      if (clientIds.length > 0) {
        const { data: routines } = await supabase
          .from('routines')
          .select('client_id, created_at')
          .in('client_id', clientIds)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (routines) {
          for (const r of routines) {
            if (!routineMap[r.client_id]) {
              routineMap[r.client_id] = r.created_at
            }
          }
        }
      }

      setClients(
        (data ?? []).map((c: ClientWithProfile) => ({
          ...c,
          lastRoutine: routineMap[c.client_id] ?? null,
        }))
      )
    } catch (err: unknown) {
      toast.error('Error al cargar clientes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { fetchClients() }, [fetchClients])

  // ── Filtered + paginated ─────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = clients
    if (filter !== 'all') list = list.filter(c => c.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.profile?.full_name?.toLowerCase().includes(q)
      )
    }
    return list
  }, [clients, filter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [filter, search])

  // ── Invite logic ─────────────────────────────────────────────────────────

  async function generateInvite() {
    if (!userId) return
    setInviteLoading(true)
    try {
      // Generate a random 8-char alphanumeric code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('invitations')
        .insert({
          trainer_id: userId,
          code,
          expires_at: expiresAt,
        })
        .select()
        .single()

      if (error) throw error
      setInvitation(data as Invitation)
    } catch (err: unknown) {
      toast.error('Error al generar código de invitación')
      console.error(err)
    } finally {
      setInviteLoading(false)
    }
  }

  function openInviteModal() {
    setInvitation(null)
    setInviteOpen(true)
    generateInvite()
  }

  function copyCode() {
    if (!invitation) return
    navigator.clipboard.writeText(invitation.code)
    toast.success('Código copiado al portapapeles')
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {loading ? '…' : `${clients.length} cliente${clients.length !== 1 ? 's' : ''} en total`}
          </p>
        </div>
        <button onClick={openInviteModal} className="btn-primary">
          <UserPlus className="w-4 h-4" />
          Invitar cliente
        </button>
      </div>

      {/* ── Search + filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            className="input pl-9"
            placeholder="Buscar cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border',
                filter === tab.value
                  ? 'bg-[#0EA5E9] border-[#0EA5E9] text-white'
                  : 'bg-[#1E293B] border-[#334155] text-slate-400 hover:border-slate-500 hover:text-slate-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table / empty ── */}
      {loading ? (
        <div className="card p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title={search || filter !== 'all' ? 'Sin resultados' : 'Sin clientes todavía'}
          description={
            search || filter !== 'all'
              ? 'Prueba con otros filtros o términos de búsqueda.'
              : 'Invita a tu primer cliente para empezar a gestionar su entrenamiento.'
          }
          action={
            !search && filter === 'all'
              ? { label: 'Invitar primer cliente', onClick: openInviteModal }
              : undefined
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  {['Cliente', 'Estado', 'Desde', 'Última rutina', 'Acciones'].map((h, i) => (
                    <th
                      key={h}
                      className={cn(
                        'px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide',
                        i === 0 ? 'text-left' : i === 4 ? 'text-right' : 'text-left'
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]/50">
                {paginated.map(client => {
                  const profile = client.profile
                  return (
                    <tr
                      key={client.id}
                      className="group hover:bg-[#334155]/20 transition-colors"
                    >
                      {/* Avatar + name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={profile?.full_name ?? '?'}
                            url={profile?.avatar_url}
                            size="sm"
                          />
                          <div>
                            <div className="font-medium text-white leading-tight">
                              {profile?.full_name ?? '—'}
                            </div>
                            {profile?.phone && (
                              <div className="text-xs text-slate-500 mt-0.5">{profile.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge status={client.status} />
                      </td>

                      {/* Started at */}
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {formatDate(client.started_at)}
                      </td>

                      {/* Last routine */}
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {client.lastRoutine ? timeAgo(client.lastRoutine) : <span className="text-slate-600">—</span>}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/clients/${profile?.id}`}
                          className={cn(
                            'inline-flex items-center gap-1 text-xs font-medium',
                            'text-[#0EA5E9] opacity-0 group-hover:opacity-100',
                            'hover:underline transition-opacity'
                          )}
                        >
                          Ver perfil →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-[#334155] flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'w-7 h-7 rounded-lg text-xs font-semibold transition-colors',
                      p === page
                        ? 'bg-[#0EA5E9] text-white'
                        : 'text-slate-400 hover:bg-[#334155] hover:text-white'
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Invite Modal ── */}
      <Modal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invitar cliente"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-slate-400 text-sm leading-relaxed">
            Comparte este código con tu cliente. Al registrarse con él, quedará
            automáticamente vinculado a tu cuenta. El código expira en 7 días.
          </p>

          {inviteLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
            </div>
          ) : invitation ? (
            <div className="space-y-3">
              {/* Code display */}
              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono text-2xl font-bold text-white tracking-[0.25em] text-center bg-[#0F172A] border border-[#334155] rounded-xl py-4 px-5 select-all">
                  {invitation.code}
                </div>
              </div>

              {/* Expires */}
              <p className="text-xs text-center text-slate-500">
                Expira el {formatDate(invitation.expires_at, 'dd/MM/yyyy HH:mm')}
              </p>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button onClick={copyCode} className="btn-primary flex-1">
                  <Copy className="w-4 h-4" />
                  Copiar código
                </button>
                <button
                  onClick={generateInvite}
                  className="btn-secondary px-3"
                  title="Generar nuevo código"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm">No se pudo generar el código.</p>
              <button onClick={generateInvite} className="btn-secondary mt-3">
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
