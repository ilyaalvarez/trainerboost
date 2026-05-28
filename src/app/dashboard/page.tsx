import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Users, CalendarDays, MessageSquare, TrendingUp, Plus, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatRelative, formatDate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import StatsCard from '@/components/ui/StatsCard'


export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today    = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const [
    { data: clients },
    { data: todayAppointments },
    { count: unreadCount },
    { data: recentMessages },
    { data: subscription },
  ] = await Promise.all([
    supabase.from('trainer_clients')
      .select('*, profile:client_id(id, full_name, avatar_url)')
      .eq('trainer_id', user.id)
      .eq('status', 'active'),
    supabase.from('appointments')
      .select('*, client:client_id(full_name, avatar_url)')
      .eq('trainer_id', user.id)
      .gte('scheduled_at', `${todayStr}T00:00:00`)
      .lte('scheduled_at', `${todayStr}T23:59:59`)
      .neq('status', 'cancelled')
      .order('scheduled_at'),
    supabase.from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .is('read_at', null),
    supabase.from('messages')
      .select('*, sender:sender_id(full_name, avatar_url)')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
  ])

  const activeClients = clients?.length ?? 0
  const maxClients    = subscription?.max_clients ?? 0

  return (
    <div className="space-y-8">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel principal</h1>
          <p className="text-slate-400 text-sm mt-0.5 capitalize">
            {formatDate(today, "EEEE, d MMMM yyyy")}
          </p>
        </div>
        <Link href="/dashboard/clients" className="btn-primary">
          <Plus className="w-4 h-4" /> Añadir cliente
        </Link>
      </div>

      {/* ── Limit warning ─────────────────────────────────────────────── */}
      {subscription?.status === 'active' && maxClients < 999999 && activeClients >= maxClients && (
        <div className="p-4 rounded-xl border flex items-center justify-between gap-4"
             style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.25)' }}>
          <p className="text-amber-400 text-sm font-medium">
            Has alcanzado el límite de {maxClients} clientes de tu plan.
          </p>
          <Link href="/pricing" className="text-xs font-bold text-amber-400 hover:underline whitespace-nowrap">
            Actualizar plan →
          </Link>
        </div>
      )}

      {/* ── KPIs ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-100">
        <StatsCard
          label="Clientes activos"
          value={activeClients}
          icon={<Users className="w-5 h-5" />}
          color="primary"
        />
        <StatsCard
          label="Citas hoy"
          value={todayAppointments?.length ?? 0}
          icon={<CalendarDays className="w-5 h-5" />}
          color="accent"
        />
        <StatsCard
          label="Mensajes sin leer"
          value={unreadCount ?? 0}
          icon={<MessageSquare className="w-5 h-5" />}
          color="secondary"
        />
        <StatsCard
          label="Capacidad usada"
          value={maxClients > 0 ? `${Math.round((activeClients / maxClients) * 100)}%` : '—'}
          icon={<TrendingUp className="w-5 h-5" />}
          color="warning"
        />
      </div>

      {/* ── Appointments + Messages ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up delay-200">

        {/* Today's appointments */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Citas de hoy</h2>
            <Link href="/dashboard/appointments" className="text-xs text-brand-primary hover:underline font-medium">
              Ver todas →
            </Link>
          </div>

          {!todayAppointments?.length ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center mx-auto mb-3">
                <CalendarDays className="w-6 h-6 opacity-40" />
              </div>
              <p className="font-medium text-slate-400 mb-1">Sin citas hoy</p>
              <p className="text-xs">Tus citas de hoy aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayAppointments.map(apt => (
                <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}
                  >
                    <Clock className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-white truncate">
                      {(apt.client as { full_name: string })?.full_name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatRelative(apt.scheduled_at)} · {apt.duration_minutes}min
                    </div>
                  </div>
                  <Badge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent messages */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Mensajes recientes</h2>
            <Link href="/dashboard/messages" className="text-xs text-brand-primary hover:underline font-medium">
              Ver todos →
            </Link>
          </div>

          {!recentMessages?.length ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 opacity-40" />
              </div>
              <p className="font-medium text-slate-400 mb-1">Sin mensajes</p>
              <p className="text-xs">Los mensajes de tus clientes aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentMessages.map(msg => {
                const sender = msg.sender as { full_name: string; avatar_url: string | null }
                return (
                  <Link
                    key={msg.id}
                    href="/dashboard/messages"
                    className="flex items-start gap-3 p-3 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors"
                  >
                    <Avatar name={sender?.full_name || '?'} url={sender?.avatar_url} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm text-white truncate">
                          {sender?.full_name}
                        </span>
                        {!msg.read_at && (
                          <span className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">{msg.content}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Client list ───────────────────────────────────────────────── */}
      <div className="card p-6 animate-fade-in-up delay-300">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-white">Mis clientes</h2>
          <Link href="/dashboard/clients" className="text-xs text-brand-primary hover:underline font-medium">
            Gestionar →
          </Link>
        </div>

        {!clients?.length ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 opacity-30" />
            </div>
            <p className="font-medium text-slate-400 mb-1">Sin clientes todavía</p>
            <p className="mb-4">Invita a tu primer cliente para empezar</p>
            <Link href="/dashboard/clients" className="btn-primary text-xs px-4 py-2">
              <Plus className="w-3.5 h-3.5" /> Añadir cliente
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                  <th className="text-left pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th className="text-left pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Desde</th>
                  <th className="text-right pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {clients.slice(0, 8).map(c => {
                  const profile = c.profile as { id: string; full_name: string; avatar_url: string | null }
                  return (
                    <tr key={c.id} className="group hover:bg-surface-2/50 transition-colors rounded-lg">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={profile?.full_name || '?'} url={profile?.avatar_url} size="sm" />
                          <span className="font-medium text-white">{profile?.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3"><Badge status={c.status} /></td>
                      <td className="py-3 text-slate-400 hidden sm:table-cell">{formatDate(c.started_at)}</td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/dashboard/clients/${profile?.id}`}
                          className="text-xs text-brand-primary opacity-0 group-hover:opacity-100 hover:underline transition-opacity font-medium"
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
        )}
      </div>
    </div>
  )
}
