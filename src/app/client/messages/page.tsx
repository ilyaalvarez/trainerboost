'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Send, Loader2, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Message, Profile } from '@/types/database'
import { timeAgo } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import EmptyState from '@/components/ui/EmptyState'

interface MessageWithSender extends Message {
  sender: Pick<Profile, 'full_name' | 'avatar_url'>
}

export default function ClientMessagesPage() {
  const supabase     = useMemo(() => createClient(), [])
  const bottomRef    = useRef<HTMLDivElement>(null)
  const [messages, setMessages]   = useState<MessageWithSender[]>([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(true)
  const [sending, setSending]     = useState(false)
  const [trainer, setTrainer]     = useState<Profile | null>(null)
  const [myId, setMyId]           = useState<string | null>(null)

  const fetchMessages = useCallback(async (userId: string) => {
    const { data } = await supabase.from('messages')
      .select('*, sender:sender_id(full_name, avatar_url)')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true })

    setMessages((data || []) as MessageWithSender[])
    setLoading(false)

    await supabase.from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('receiver_id', userId)
      .is('read_at', null)

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [supabase])

  useEffect(() => {
    let channelRef: ReturnType<typeof supabase.channel> | null = null

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setMyId(user.id)

      const { data: tc } = await supabase.from('trainer_clients')
        .select('trainer:trainer_id(*)')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .single()

      if (tc) setTrainer(tc.trainer as unknown as Profile)

      await fetchMessages(user.id)

      const channel = supabase.channel('client-messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        }, () => fetchMessages(user.id))
        .subscribe()

      channelRef = channel
    }

    init()
    return () => { if (channelRef) supabase.removeChannel(channelRef) }
  }, [supabase, fetchMessages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !trainer || !myId) return
    setSending(true)

    const { error } = await supabase.from('messages').insert({
      sender_id: myId,
      receiver_id: trainer.id,
      content: input.trim(),
    })

    setSending(false)
    if (error) { toast.error(error.message); return }
    setInput('')
    fetchMessages(myId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  if (!trainer) {
    return (
      <EmptyState
        icon={<MessageSquare className="w-8 h-8 text-slate-500" />}
        title="Sin entrenador asignado"
        description="Cuando te unas con un entrenador podrás chatear aquí."
      />
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] animate-fade-in">
      {/* Header */}
      <div className="card p-4 flex items-center gap-3 mb-4">
        <Avatar name={trainer.full_name} url={trainer.avatar_url} size="md" />
        <div>
          <div className="font-semibold text-white">{trainer.full_name}</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Tu entrenador
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 card p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Empieza la conversación con tu entrenador
          </div>
        ) : (
          messages.map(msg => {
            const isMine = msg.sender_id === myId
            return (
              <div key={msg.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMine && (
                  <Avatar name={msg.sender?.full_name || '?'} url={msg.sender?.avatar_url} size="sm" />
                )}
                <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-brand-primary text-white rounded-tr-none'
                      : 'bg-surface-2 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-slate-500 px-1">{timeAgo(msg.created_at)}</span>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-3 mt-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="input flex-1"
          placeholder="Escribe un mensaje..."
          autoComplete="off"
        />
        <button type="submit" disabled={sending || !input.trim()} className="btn-primary px-4">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  )
}
