'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CreditCard, ExternalLink, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import EmptyState from '@/components/ui/EmptyState'

interface Invoice {
  id: string
  description: string
  amount_cents: number
  currency: string
  status: 'pending' | 'paid' | 'cancelled' | 'expired'
  stripe_payment_link: string | null
  due_date: string | null
  paid_at: string | null
  created_at: string
}

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente', icon: Clock,        cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  paid:      { label: 'Pagado',    icon: CheckCircle2, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled: { label: 'Cancelado', icon: XCircle,      cls: 'text-fg-disabled bg-surface-2 border-border' },
  expired:   { label: 'Expirado',  icon: XCircle,      cls: 'text-fg-disabled bg-surface-2 border-border' },
}

export default function ClientInvoicesPage() {
  const supabase = createClient()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      setInvoices(data ?? [])
      setLoading(false)
    }
    load()
  }, [supabase])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-fg-muted" />
    </div>
  )

  if (invoices.length === 0) return (
    <EmptyState
      icon={<CreditCard className="w-8 h-8" />}
      title="Sin cobros pendientes"
      description="Cuando tu entrenador te envíe un cobro aparecerá aquí."
    />
  )

  const total = invoices.reduce((s, inv) => s + (inv.status === 'paid' ? inv.amount_cents : 0), 0)
  const pending = invoices.filter(inv => inv.status === 'pending').reduce((s, inv) => s + inv.amount_cents, 0)

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-xl font-bold text-fg-primary">Mis cobros</h1>
        <p className="text-sm text-fg-muted mt-0.5">Historial de pagos a tu entrenador</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold font-mono text-fg-primary">{(total / 100).toFixed(0)}€</div>
          <div className="text-xs text-fg-muted mt-1">Total pagado</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold font-mono text-amber-400">{(pending / 100).toFixed(0)}€</div>
          <div className="text-xs text-fg-muted mt-1">Pendiente</div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {invoices.map(inv => {
          const cfg = STATUS_CONFIG[inv.status]
          const Icon = cfg.icon
          return (
            <div key={inv.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-fg-primary truncate">{inv.description}</div>
                  <div className="text-xs text-fg-muted mt-0.5">
                    {new Date(inv.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {inv.due_date && ` · Vence ${new Date(inv.due_date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold font-mono text-fg-primary">{(inv.amount_cents / 100).toFixed(2)}€</div>
                  <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1', cfg.cls)}>
                    <Icon className="w-2.5 h-2.5" /> {cfg.label}
                  </span>
                </div>
              </div>
              {inv.status === 'pending' && inv.stripe_payment_link && (
                <a
                  href={inv.stripe_payment_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-brand-primary text-black text-sm font-semibold hover:bg-brand-primary/90 transition-opacity"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Pagar ahora
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
