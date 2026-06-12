'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Send, MessageSquare, Loader2, Search, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, timeAgo, formatDate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import type { Message, Profile } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
  /** The other participant (not the current trainer) */
  partnerId: string
  partner: Profile
  lastMessage: Message
  unreadCount: number
}

interface MessageWithSender extends Message {
  sender: Profile
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupByDay(messages: MessageWithSender[]): Array<{ date: string; msgs: MessageWithSender[] }> {
  const groups: Record<string, MessageWithSender[]> = {}
  for (const m of messages) {
    const day = m.created_at.slice(0, 10)
    if (!groups[day]) groups[day] = []
    groups[day].push(m)
  }
  return Object.entries(groups).map(([date, msgs]) => ({ date, msgs }))
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const supabase = createClient()

  // Auth
  const [userId, setUserId]   = useState<string | null>(null)
  const [myProfile, setMyProfile] = useState<Profile | null>(null)

  // Conversations list
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [convoLoading, setConvoLoading]   = useState(true)
  const [convoSearch, setConvoSearch]     = useState('')

  // Active thread
  const [activeConvo, setActiveConvo]   = useState<Conversation | null>(null)
  const [messages, setMessages]         = useState<MessageWithSender[]>([])
  const [threadLoading, setThreadLoading] = useState(false)

  // Mobile panel view
  const [mobilePanelView, setMobilePanelView] = useState<'list' | 'thread'>('list')

  // Compose
  const [draft, setDraft]       = useState('')
  const [sending, setSending]   = useState(false)

  // Refs
  const bottomRef   = useRef<HTMLDivElement>(null)
  const channelRef  = useRef<RealtimeChannel | null>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)

  // ── Init ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      if (profile) setMyProfile(profile as Profile)

      await loadConversations(user.id)
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load conversations ───────────────────────────────────────────────────

  const loadConversations = useCallback(async (uid: string) => {
    setConvoLoading(true)
    try {
      // Fetch all messages where the trainer is a participant
      const { data: allMessages, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(*), receiver:receiver_id(*)')
        .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group by conversation partner
      const convoMap = new Map<string, { msgs: Message[]; partner: Profile }>()

      for (const msg of allMessages ?? []) {
        const partnerId = msg.sender_id === uid ? msg.receiver_id : msg.sender_id
        const partnerProfile = (msg.sender_id === uid
          ? msg.receiver
          : msg.sender) as Profile

        if (!partnerProfile) continue

        if (!convoMap.has(partnerId)) {
          convoMap.set(partnerId, { msgs: [], partner: partnerProfile })
        }
        convoMap.get(partnerId)!.msgs.push(msg as Message)
      }

      const convos: Conversation[] = Array.from(convoMap.entries()).map(([partnerId, { msgs, partner }]) => {
        const unread = msgs.filter(m => m.receiver_id === uid && !m.read_at).length
        return {
          partnerId,
          partner,
          lastMessage: msgs[0], // already sorted descending
          unreadCount: unread,
        }
      })

      // Sort by last message time
      convos.sort((a, b) =>
        new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      )

      setConversations(convos)
    } catch (err: unknown) {
      toast.error('Error al cargar mensajes')
      console.error(err)
    } finally {
      setConvoLoading(false)
    }
  }, [supabase])

  // ── Open conversation ────────────────────────────────────────────────────

  const openConversation = useCallback(async (convo: Conversation) => {
    if (!userId) return
    setActiveConvo(convo)
    setMobilePanelView('thread')
    setMessages([])
    setThreadLoading(true)

    // Unsubscribe previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(*)')
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${convo.partnerId}),` +
          `and(sender_id.eq.${convo.partnerId},receiver_id.eq.${userId})`
        )
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages((data ?? []) as MessageWithSender[])

      // Mark unread messages as read
      const unreadIds = (data ?? [])
        .filter((m: Message) => m.receiver_id === userId && !m.read_at)
        .map((m: Message) => m.id)

      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadIds)

        // Update local conversation unread count
        setConversations(prev =>
          prev.map(c => c.partnerId === convo.partnerId ? { ...c, unreadCount: 0 } : c)
        )
      }
    } catch (err: unknown) {
      toast.error('Error al cargar la conversación')
      console.error(err)
    } finally {
      setThreadLoading(false)
    }

    // Subscribe to real-time updates for this conversation
    const channel = supabase
      .channel(`messages:${[userId, convo.partnerId].sort().join('-')}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          const msg = payload.new as Message
          // Only care about this partner's messages
          if (msg.sender_id !== convo.partnerId) return

          // Fetch sender profile
          const { data: sender } = await supabase
            .from('profiles').select('*').eq('id', msg.sender_id).single()

          const fullMsg: MessageWithSender = {
            ...msg,
            sender: sender as Profile,
          }

          setMessages(prev => [...prev, fullMsg])

          // Mark as read immediately
          await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('id', msg.id)

          // Refresh conversations list
          loadConversations(userId)
        }
      )
      .subscribe()

    channelRef.current = channel
    inputRef.current?.focus()
  }, [userId, supabase, loadConversations])

  // ── Auto-scroll to bottom ────────────────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ─────────────────────────────────────────────────────────

  async function sendMessage() {
    const content = draft.trim()
    if (!content || !userId || !activeConvo || sending) return

    setSending(true)
    setDraft('')

    // Optimistic insert
    const optimistic: MessageWithSender = {
      id: `optimistic-${Date.now()}`,
      sender_id: userId,
      receiver_id: activeConvo.partnerId,
      content,
      read_at: null,
      created_at: new Date().toISOString(),
      sender: myProfile!,
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          receiver_id: activeConvo.partnerId,
          content,
        })
        .select('*, sender:sender_id(*)')
        .single()

      if (error) throw error

      // Fire push notification to receiver (fire-and-forget)
      fetch('/api/push/notify-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: activeConvo.partnerId, content }),
      }).catch(() => {})

      // Replace optimistic
      setMessages(prev =>
        prev.map(m => m.id === optimistic.id ? (data as MessageWithSender) : m)
      )

      // Refresh conversations sidebar
      loadConversations(userId)
    } catch (err: unknown) {
      toast.error('Error al enviar el mensaje')
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setDraft(content) // restore draft
      console.error(err)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Cleanup realtime on unmount ──────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [supabase])

  // ── Filtered conversations ───────────────────────────────────────────────

  const filteredConvos = conversations.filter(c =>
    c.partner.full_name.toLowerCase().includes(convoSearch.toLowerCase())
  )

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in -m-6 lg:-m-8 h-[calc(100vh-0px)]" style={{ height: 'calc(100vh - 0px)' }}>
      <div className="flex h-full border border-border/60 rounded-xl overflow-hidden bg-surface">

        {/* ═══════════════════════════════════════════════════════════════
            LEFT PANEL — Conversation list
        ═══════════════════════════════════════════════════════════════ */}
        <div className={cn("flex-shrink-0 flex flex-col border-r border-border/60 w-full md:w-72", mobilePanelView === 'thread' ? 'hidden md:flex' : 'flex')}>
          {/* Header */}
          <div className="px-4 py-4 border-b border-border/60">
            <h2 className="font-semibold text-white text-base mb-3">Mensajes</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fg-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar..."
                value={convoSearch}
                onChange={e => setConvoSearch(e.target.value)}
                className="input pl-8 text-xs py-1.5"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {convoLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-fg-muted animate-spin" />
              </div>
            ) : filteredConvos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-2">
                <MessageSquare className="w-8 h-8 text-fg-disabled" />
                <p className="text-fg-muted text-sm">Sin conversaciones</p>
              </div>
            ) : (
              filteredConvos.map(convo => {
                const isActive  = activeConvo?.partnerId === convo.partnerId
                const isUnread  = convo.unreadCount > 0
                const isMine    = convo.lastMessage.sender_id === userId

                return (
                  <button
                    key={convo.partnerId}
                    onClick={() => openConversation(convo)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left transition-all duration-150',
                      'border-b border-border/60/50',
                      isActive
                        ? 'bg-brand-primary/10 border-l-2 border-l-brand-primary'
                        : 'hover:bg-surface-2/40'
                    )}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <Avatar name={convo.partner.full_name} url={convo.partner.avatar_url} size="sm" />
                      {isUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-primary border-2 border-surface" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={cn('text-sm truncate', isUnread ? 'font-semibold text-fg-primary' : 'font-medium text-fg-secondary')}>
                          {convo.partner.full_name}
                        </span>
                        <span className="text-[10px] text-fg-muted shrink-0">
                          {timeAgo(convo.lastMessage.created_at)}
                        </span>
                      </div>
                      <p className={cn(
                        'text-xs truncate',
                        isUnread ? 'text-fg-primary' : 'text-fg-muted'
                      )}>
                        {isMine && <span className="text-fg-disabled">Tú: </span>}
                        {convo.lastMessage.content}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            RIGHT PANEL — Chat thread
        ═══════════════════════════════════════════════════════════════ */}
        <div className={cn("flex-1 flex flex-col min-w-0", mobilePanelView === 'list' ? 'hidden md:flex' : 'flex')}>
          {activeConvo ? (
            <>
              {/* Thread header */}
              <div className="px-5 py-3.5 border-b border-border/60 flex items-center gap-3 shrink-0">
                <button
                  onClick={() => { setMobilePanelView('list'); setActiveConvo(null) }}
                  className="md:hidden p-1 -ml-1 text-fg-secondary hover:text-fg-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <Avatar
                  name={activeConvo.partner.full_name}
                  url={activeConvo.partner.avatar_url}
                  size="sm"
                />
                <div>
                  <div className="font-semibold text-fg-primary text-sm">{activeConvo.partner.full_name}</div>
                  <div className="text-xs text-fg-muted">Cliente</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
                {threadLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-5 h-5 text-fg-muted animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                    <MessageSquare className="w-8 h-8 text-fg-disabled" />
                    <p className="text-fg-muted text-sm">No hay mensajes todavía. ¡Di hola!</p>
                  </div>
                ) : (
                  groupByDay(messages).map(({ date, msgs }) => (
                    <div key={date}>
                      {/* Day separator */}
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-border/50" />
                        <span className="text-[11px] text-fg-muted font-medium px-2">
                          {formatDate(date, 'EEE dd MMM')}
                        </span>
                        <div className="flex-1 h-px bg-border/50" />
                      </div>

                      {msgs.map((msg, idx) => {
                        const isMine   = msg.sender_id === userId
                        const prevMsg  = idx > 0 ? msgs[idx - 1] : null
                        const showAvatar = !isMine && msg.sender_id !== prevMsg?.sender_id

                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              'flex gap-2 items-end mb-1',
                              isMine ? 'justify-end' : 'justify-start'
                            )}
                          >
                            {/* Partner avatar (only on first message in a cluster) */}
                            {!isMine && (
                              <div className="w-6 shrink-0 mb-0.5">
                                {showAvatar && (
                                  <Avatar
                                    name={msg.sender?.full_name ?? '?'}
                                    url={msg.sender?.avatar_url}
                                    size="sm"
                                  />
                                )}
                              </div>
                            )}

                            <div className={cn('max-w-[70%] flex flex-col', isMine ? 'items-end' : 'items-start')}>
                              <div
                                className={cn(
                                  'px-3.5 py-2 rounded-2xl text-sm leading-relaxed animate-message-in',
                                  isMine
                                    ? 'bg-brand-primary text-black rounded-br-sm'
                                    : 'bg-surface-3 text-fg-primary rounded-bl-sm'
                                )}
                              >
                                {msg.content}
                              </div>
                              <span className="text-[10px] text-fg-disabled mt-0.5 px-1">
                                {formatDate(msg.created_at, 'HH:mm')}
                                {isMine && msg.read_at && (
                                  <span className="ml-1 text-brand-primary">✓✓</span>
                                )}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Compose area */}
              <div className="shrink-0 px-4 py-3 border-t border-border/60">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje… (Enter para enviar)"
                    className={cn(
                      'input flex-1 resize-none min-h-[40px] max-h-32 py-2.5 leading-relaxed',
                      'scrollbar-thin'
                    )}
                    style={{ height: 'auto' }}
                    maxLength={1000}
                    onInput={(e) => {
                      const el = e.currentTarget
                      el.style.height = 'auto'
                      el.style.height = `${Math.min(el.scrollHeight, 128)}px`
                    }}
                    disabled={sending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!draft.trim() || sending}
                    className="btn-primary h-10 w-10 p-0 rounded-xl shrink-0 disabled:opacity-40 active:scale-90 transition-transform duration-100"
                    title="Enviar"
                  >
                    {sending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </button>
                </div>
                <p className="text-[10px] text-fg-disabled mt-1.5 text-right">
                  Shift+Enter para nueva línea
                </p>
              </div>
            </>
          ) : (
            /* No active conversation */
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-fg-muted" />
              </div>
              <div>
                <h3 className="font-semibold text-fg-primary mb-1">Selecciona una conversación</h3>
                <p className="text-fg-muted text-sm">
                  Elige un cliente de la lista para ver y enviar mensajes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
