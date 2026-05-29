'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Users, Search, Copy, RefreshCw, ChevronLeft, ChevronRight,
  UserPlus, Loader2, Mail, ArrowRight, Dumbbell, Clock,
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
  const [maxClients, setMaxClients] = useState(0)

  // UI state
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState<FilterTab>('all')
  const [page, setPage]           = useState(1)

  // Invite modal
  const [inviteOpen, setInviteOpen]       = useState(false)
  const [invitation, setInvitation]       = useState<Invitation | null>(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [emailInput, setEmailInput]       = useState('')
  const [emailSending, setEmailSending]   = useState(false)

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [{ data, error }, { data: subData }] = await Promise.all([
        supabase
          .from('trainer_clients')
          .select('*, profile:client_id(*)')
          .eq('trainer_id', user.id)
          .order('started_at', { ascending: false }),
        supabase
          .from('subscriptions')
          .select('max_clients')
          .eq('user_id', user.id)
          .single(),
      ])

      if (error) throw error
      setMaxClients(subData?.max_clients ?? 0)

      // Fetch last routine for each client
      const clientIds = (data ?? []).map((c: ClientWithProfile) => c.client_id)
      const routineMap: Record<string, string | null> = {}

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

    // Enforce the plan's client limit before issuing a new invite.
    const activeCount = clients.filter(c => c.status === 'active').length
    if (activeCount >= maxClients) {
      toast.error(
        maxClients === 0
          ? 'Activa un plan para empezar a añadir clientes.'
          : `Has alcanzado el límite de ${maxClients} clientes de tu plan. Actualízalo para añadir más.`,
      )
      return
    }

    setInviteLoading(true)
    try {
      // Cryptographically-random code (not guessable, unlike Math.random()).
      const code = crypto.randomUUID().replace(/-/g, '').slice(0, 12).toLowerCase()
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
    navigator.clipboard.writeText(invitation.code.toUpperCase())
    toast.success('Código copiado al portapapeles')
  }

  async function sendInviteEmail() {
    if (!invitation || !emailInput.trim()) return
    setEmailSending(true)
    try {
      // Update invitation with email first
      await supabase.from('invitations').update({ email: emailInput.trim() }).eq('id', invitation.id)
      const res = await fetch('/api/invite/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId: invitation.id }),
      })
      if (!res.ok) throw new Error('Error al enviar')
      toast.success(`Invitación enviada a ${emailInput.trim()}`)
      setEmailInput('')
    } catch {
      toast.error('No se pudo enviar el email')
    } finally {
      setEmailSending(false)
    }
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

        {/* Filter tabs */}
        <div className="flex gap-1 border-b border-border/40 relative pb-0">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                'tab-btn',
                filter === tab.value ? 'tab-btn-active' : ''
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
        <div className="space-y-4">
          {/* Client card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
            {paginated.map((client) => {
              const profile = client.profile

              const statusBar: Record<string, string> = {
                active:  'linear-gradient(90deg, #10B981, #0EA5E9)',
                paused:  'linear-gradient(90deg, #F59E0B, #EF4444)',
                ended:   'linear-gradient(90deg, #475569, #64748B)',
                pending: 'linear-gradient(90deg, #0EA5E9, #7C3AED)',
              }
              const bar = statusBar[client.status] ?? statusBar.ended

              const startDate = new Date(client.started_at)
              const now = new Date()
              const monthsDiff =
                (now.getFullYear() - startDate.getFullYear()) * 12 +
                (now.getMonth() - startDate.getMonth())
              const timeLabel =
                monthsDiff <= 0 ? 'Este mes' :
                monthsDiff === 1 ? '1 mes' :
                `${monthsDiff} meses`

              return (
                <div
                  key={client.id}
                  className="card card-interactive overflow-hidden"
                >
                  {/* Colored accent bar with shimmer */}
                  <div className="h-1.5 rounded-t-2xl relative overflow-hidden" style={{ background: bar }}>
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  </div>

                  <div className="p-5">
                    {/* Avatar + name + badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="ring-2 ring-white/10 rounded-full shrink-0">
                          <Avatar
                            name={profile?.full_name ?? '?'}
                            url={profile?.avatar_url}
                            size="md"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white text-sm leading-tight truncate">
                            {profile?.full_name ?? '—'}
                          </div>
                          {profile?.phone && (
                            <div className="text-xs text-slate-500 mt-0.5 truncate">{profile.phone}</div>
                          )}
                        </div>
                      </div>
                      <Badge status={client.status} />
                    </div>

                    {/* Mini stats */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(30,41,59,0.8)' }}>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">
                          <Clock className="w-2.5 h-2.5" /> Cliente desde
                        </div>
                        <div className="text-sm font-semibold text-slate-200">{timeLabel}</div>
                      </div>
                      <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(30,41,59,0.8)' }}>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">
                          <Dumbbell className="w-2.5 h-2.5" /> Última rutina
                        </div>
                        <div className="text-sm font-semibold text-slate-200">
                          {client.lastRoutine
                            ? timeAgo(client.lastRoutine)
                            : <span className="text-slate-500 font-normal text-xs">Sin asignar</span>
                          }
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/dashboard/clients/${profile?.id}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-sm group"
                      style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}
                    >
                      Ver perfil completo
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="card px-4 py-3 flex items-center justify-between">
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
              <div className="font-mono text-2xl font-bold text-white tracking-[0.25em] text-center bg-[#0F172A] border border-[#334155] rounded-xl py-4 px-5 select-all">
                {invitation.code.toUpperCase()}
              </div>

              {/* Expires */}
              <p className="text-xs text-center text-slate-500">
                Expira el {formatDate(invitation.expires_at, 'dd/MM/yyyy HH:mm')}
              </p>

              {/* Copy + refresh */}
              <div className="flex gap-2">
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

              {/* Send by email */}
              <div className="border-t border-border pt-4 space-y-2">
                <p className="text-xs text-slate-500">O enviar por email directamente</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendInviteEmail()}
                    placeholder="cliente@email.com"
                    className="input flex-1 text-sm"
                  />
                  <button
                    onClick={sendInviteEmail}
                    disabled={emailSending || !emailInput.trim()}
                    className="btn-secondary px-3 disabled:opacity-50"
                  >
                    {emailSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  </button>
                </div>
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
