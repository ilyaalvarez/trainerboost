'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Users, Search, Copy, RefreshCw, ChevronLeft, ChevronRight,
  UserPlus, Loader2, Mail, ArrowRight, Clock,
  Tag, X, FileDown,
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

const PRESET_TAGS = [
  { label: 'Pérdida de peso',   color: 'bg-semantic-warning/20 text-semantic-warning-text border border-semantic-warning/30' },
  { label: 'Ganancia muscular', color: 'bg-semantic-info/20 text-semantic-info-text border border-semantic-info/30' },
  { label: 'Resistencia',       color: 'bg-semantic-success/20 text-semantic-success-text border border-semantic-success/30' },
  { label: 'Rehabilitación',    color: 'bg-brand-secondary/20 text-brand-secondary-text border border-brand-secondary/30' },
  { label: 'Tonificación',      color: 'bg-brand-rose/15 text-brand-rose border border-brand-rose/30' },
  { label: 'Principiante',      color: 'bg-surface-4 text-fg-secondary border border-border-strong' },
  { label: 'Senior',            color: 'bg-semantic-warning/20 text-semantic-warning-text border border-semantic-warning/30' },
  { label: 'Online',            color: 'bg-semantic-info/20 text-semantic-info-text border border-semantic-info/30' },
] as const
const TAG_COLOR: Record<string, string> = Object.fromEntries(PRESET_TAGS.map(t => [t.label, t.color]))

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientRow extends ClientWithProfile {
  lastRoutine?: string | null
  lastProgressLog?: string | null
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
  const [search, setSearch]                 = useState('')
  const [filter, setFilter]                 = useState<FilterTab>('all')
  const [page, setPage]                     = useState(1)
  const [tagFilter, setTagFilter]           = useState<string | null>(null)
  const [editingTagsFor, setEditingTagsFor] = useState<string | null>(null)

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

      const clientIds = (data ?? []).map((c: ClientWithProfile) => c.client_id)
      const routineMap: Record<string, string | null> = {}
      const progressMap: Record<string, string | null> = {}

      if (clientIds.length > 0) {
        const [{ data: routines }, { data: progressLogs }] = await Promise.all([
          supabase
            .from('latest_routine_per_client')
            .select('client_id, latest_routine_at')
            .in('client_id', clientIds),
          supabase
            .from('latest_progress_per_client')
            .select('client_id, latest_progress_at')
            .in('client_id', clientIds),
        ])

        if (routines) {
          for (const r of routines) routineMap[r.client_id] = r.latest_routine_at as string
        }
        if (progressLogs) {
          for (const l of progressLogs) progressMap[l.client_id] = l.latest_progress_at as string
        }
      }

      setClients(
        (data ?? []).map((c: ClientWithProfile) => ({
          ...c,
          lastRoutine:     routineMap[c.client_id]  ?? null,
          lastProgressLog: progressMap[c.client_id] ?? null,
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

  // ── Realtime: new client joins or status changes ─────────────────────────
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`trainer-clients-rt:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trainer_clients', filter: `trainer_id=eq.${userId}` },
        async (payload) => {
          const { data: newRow } = await supabase
            .from('trainer_clients')
            .select('*, profile:client_id(*)')
            .eq('id', payload.new.id)
            .single()
          if (newRow) {
            setClients(prev => [{ ...(newRow as ClientWithProfile), lastRoutine: null, lastProgressLog: null }, ...prev])
            toast.success(`Nuevo cliente: ${(newRow as ClientWithProfile).profile?.full_name ?? 'Cliente'}`)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'trainer_clients', filter: `trainer_id=eq.${userId}` },
        async (payload) => {
          const { data: updatedRow } = await supabase
            .from('trainer_clients')
            .select('*, profile:client_id(*)')
            .eq('id', payload.new.id)
            .single()
          if (updatedRow) {
            setClients(prev => prev.map(c => c.id === payload.new.id ? { ...c, ...(updatedRow as ClientWithProfile) } : c))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  // ── Filtered + paginated ─────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = clients
    if (filter !== 'all') list = list.filter(c => c.status === filter)
    if (tagFilter) list = list.filter(c => (c.tags ?? []).includes(tagFilter))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c => c.profile?.full_name?.toLowerCase().includes(q))
    }
    return list
  }, [clients, filter, search, tagFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const allTags = useMemo(() => {
    const set = new Set<string>()
    clients.forEach(c => (c.tags ?? []).forEach(t => set.add(t)))
    return Array.from(set)
  }, [clients])

  useEffect(() => { setPage(1) }, [filter, search])

  // ── Invite logic ─────────────────────────────────────────────────────────

  async function generateInvite() {
    if (!userId) return

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
      const code = crypto.randomUUID().replace(/-/g, '').slice(0, 12).toLowerCase()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('invitations')
        .insert({ trainer_id: userId, code, expires_at: expiresAt })
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

  async function updateTags(clientId: string, tags: string[]) {
    if (!userId) return
    const { error } = await supabase.from('trainer_clients').update({ tags }).eq('id', clientId).eq('trainer_id', userId)
    if (error) { toast.error('No se pudieron guardar las etiquetas'); return }
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, tags } : c))
  }

  function exportCsv() {
    const rows = [
      ['Nombre', 'Teléfono', 'Estado', 'Etiquetas', 'Cliente desde', 'Última rutina', 'Último progreso'],
      ...filtered.map(c => [
        c.profile?.full_name ?? '',
        c.profile?.phone ?? '',
        c.status,
        (c.tags ?? []).join('; '),
        c.started_at ? new Date(c.started_at).toLocaleDateString('es-ES') : '',
        c.lastRoutine ? new Date(c.lastRoutine).toLocaleDateString('es-ES') : '',
        c.lastProgressLog ? new Date(c.lastProgressLog).toLocaleDateString('es-ES') : '',
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg-primary">Clientes</h1>
          <p className="text-fg-muted text-sm mt-0.5">
            {loading ? '…' : `${clients.length} cliente${clients.length !== 1 ? 's' : ''} en total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {clients.length > 0 && (
            <button onClick={exportCsv} className="btn-secondary text-sm" title="Exportar como CSV">
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          )}
          <button onClick={openInviteModal} className="btn-primary">
            <UserPlus className="w-4 h-4" />
            Invitar cliente
          </button>
        </div>
      </div>

      {/* ── Search + filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted pointer-events-none" />
          <input
            type="text"
            className="input pl-9"
            placeholder="Buscar cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-1 border-b border-border/40 relative pb-0">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn('tab-btn', filter === tab.value ? 'tab-btn-active' : '')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tag filter row ── */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setTagFilter(t => t === tag ? null : tag)}
              className={cn(
                'text-xs px-3 py-1 rounded-full border transition-all',
                TAG_COLOR[tag] ?? 'bg-surface-3 text-fg-secondary border-border-strong',
                tagFilter === tag ? 'ring-2 ring-white/30 scale-105' : 'opacity-70 hover:opacity-100'
              )}
            >
              {tag}
              {tagFilter === tag && <X className="w-3 h-3 ml-1 inline" />}
            </button>
          ))}
        </div>
      )}

      {/* ── Table / empty ── */}
      {loading ? (
        <div className="card p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-fg-muted animate-spin" />
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
                active:  '#8FD43A',
                paused:  '#F59E0B',
                ended:   '#475569',
                pending: '#0EA5E9',
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
                <div key={client.id} className="card card-interactive overflow-hidden">
                  {/* Colored accent bar */}
                  <div className="h-px rounded-t-2xl" style={{ background: bar }} />

                  <div className="p-5">
                    {/* Avatar + name + badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="ring-2 ring-white/10 rounded-full shrink-0">
                          <Avatar name={profile?.full_name ?? '?'} url={profile?.avatar_url} size="md" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-fg-primary text-sm leading-tight truncate">
                            {profile?.full_name ?? '—'}
                          </div>
                          {profile?.phone && (
                            <div className="text-xs text-fg-disabled mt-0.5 truncate">{profile.phone}</div>
                          )}
                        </div>
                      </div>
                      <Badge status={client.status} />
                    </div>

                    {/* Mini stats */}
                    {(() => {
                      const daysSinceProg = client.lastProgressLog
                        ? Math.floor((Date.now() - new Date(client.lastProgressLog).getTime()) / 86400000)
                        : null
                      const actDot =
                        daysSinceProg === null ? 'bg-fg-disabled' :
                        daysSinceProg <= 7     ? 'bg-semantic-success' :
                        daysSinceProg <= 14    ? 'bg-semantic-warning' :
                                                 'bg-semantic-error'
                      return (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="rounded-lg px-3 py-2.5 bg-surface-3">
                            <div className="flex items-center gap-1 text-[10px] text-fg-muted uppercase tracking-wide mb-0.5">
                              <Clock className="w-2.5 h-2.5" /> Cliente desde
                            </div>
                            <div className="text-sm font-semibold text-fg-primary">{timeLabel}</div>
                          </div>
                          <div className="rounded-lg px-3 py-2.5 bg-surface-3">
                            <div className="flex items-center gap-1 text-[10px] text-fg-muted uppercase tracking-wide mb-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${actDot}`} />
                              Último progreso
                            </div>
                            <div className="text-sm font-semibold text-fg-primary">
                              {client.lastProgressLog
                                ? timeAgo(client.lastProgressLog)
                                : <span className="text-fg-disabled font-normal text-xs">Sin registros</span>
                              }
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {/* Tags */}
                    <div className="mb-3 relative">
                      <div className="flex flex-wrap gap-1.5 items-center min-h-[24px]">
                        {(client.tags ?? []).map(tag => (
                          <span key={tag} className={cn('text-[10px] px-2 py-0.5 rounded-full', TAG_COLOR[tag] ?? 'bg-surface-3 text-fg-secondary border border-border-strong')}>
                            {tag}
                          </span>
                        ))}
                        <button
                          onClick={e => { e.stopPropagation(); setEditingTagsFor(editingTagsFor === client.id ? null : client.id) }}
                          className="w-5 h-5 rounded-full border border-dashed border-border-strong hover:border-brand-primary flex items-center justify-center text-fg-disabled hover:text-brand-primary transition-colors"
                          title="Editar etiquetas"
                          aria-label="Editar etiquetas"
                        >
                          <Tag className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {editingTagsFor === client.id && (
                        <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-xl border border-border bg-surface-2 p-2 shadow-xl">
                          <div className="flex flex-wrap gap-1.5">
                            {PRESET_TAGS.map(({ label, color }) => {
                              const active = (client.tags ?? []).includes(label)
                              return (
                                <button
                                  key={label}
                                  onClick={() => {
                                    const cur = client.tags ?? []
                                    const next = active ? cur.filter(t => t !== label) : [...cur, label]
                                    updateTags(client.id, next)
                                  }}
                                  className={cn(
                                    'text-[10px] px-2 py-0.5 rounded-full border transition-all',
                                    color,
                                    active ? 'ring-1 ring-white/40' : 'opacity-50 hover:opacity-100'
                                  )}
                                >
                                  {active && '✓ '}{label}
                                </button>
                              )
                            })}
                          </div>
                          <button
                            onClick={() => setEditingTagsFor(null)}
                            className="mt-2 text-[10px] text-fg-muted hover:text-fg-primary w-full text-center transition-colors"
                          >
                            Cerrar
                          </button>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/dashboard/clients/${profile?.id}`}
                      className="btn-secondary w-full justify-center group text-sm py-2"
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
              <p className="text-xs text-fg-muted">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Página anterior"
                  className="p-1.5 rounded-lg text-fg-muted hover:text-fg-primary hover:bg-surface-3 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                        ? 'bg-brand-primary text-black'
                        : 'text-fg-muted hover:bg-surface-3 hover:text-fg-primary'
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Página siguiente"
                  className="p-1.5 rounded-lg text-fg-muted hover:text-fg-primary hover:bg-surface-3 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Invite Modal ── */}
      <Modal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} title="Invitar cliente" size="sm">
        <div className="space-y-5">
          <p className="text-fg-muted text-sm leading-relaxed">
            Comparte este código con tu cliente. Al registrarse con él, quedará
            automáticamente vinculado a tu cuenta. El código expira en 7 días.
          </p>

          {inviteLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-fg-muted animate-spin" />
            </div>
          ) : invitation ? (
            <div className="space-y-3">
              {/* Code display */}
              <div className="font-mono text-2xl font-bold text-fg-primary tracking-[0.25em] text-center bg-background border border-border rounded-xl py-4 px-5 select-all">
                {invitation.code.toUpperCase()}
              </div>

              <p className="text-xs text-center text-fg-muted">
                Expira el {formatDate(invitation.expires_at, 'dd/MM/yyyy HH:mm')}
              </p>

              <div className="flex gap-2">
                <button onClick={copyCode} className="btn-primary flex-1">
                  <Copy className="w-4 h-4" />
                  Copiar código
                </button>
                <button onClick={generateInvite} className="btn-secondary px-3" title="Generar nuevo código">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <p className="text-xs text-fg-muted">O enviar por email directamente</p>
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
              <p className="text-fg-muted text-sm">No se pudo generar el código.</p>
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
