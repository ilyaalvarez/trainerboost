'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Search, Clock, Flame, ChevronDown, ChevronUp, ArrowLeft, CalendarDays, Plus, X, Loader2, Check } from 'lucide-react'
import type { Receta, DietSlot, RecipeCategory } from '@/types/database'

const CATEGORIES: { value: RecipeCategory | 'all'; label: string; color: string }[] = [
  { value: 'all',       label: 'Todas',    color: 'bg-surface-2 text-fg-secondary' },
  { value: 'desayuno',  label: 'Desayuno', color: 'bg-amber-500/15 text-amber-400' },
  { value: 'comida',    label: 'Comida',   color: 'bg-emerald-500/15 text-emerald-400' },
  { value: 'cena',      label: 'Cena',     color: 'bg-violet-500/15 text-violet-400' },
  { value: 'snack',     label: 'Snack',    color: 'bg-sky-500/15 text-sky-400' },
]

const SLOT_COLORS: Record<DietSlot, string> = {
  desayuno: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  comida:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  cena:     'bg-violet-500/15 text-violet-400 border-violet-500/20',
  snack:    'bg-sky-500/15 text-sky-400 border-sky-500/20',
}

interface Client { id: string; full_name: string }

interface AssignModalState {
  receta: Receta
  clientId: string
  slot: DietSlot
  dayDate: string
}

export default function RecetasPage() {
  const supabase = useMemo(() => createClient(), [])
  const router   = useRouter()

  const [recetas,    setRecetas]    = useState<Receta[]>([])
  const [loading,    setLoading]    = useState(true)
  const [query,      setQuery]      = useState('')
  const [catFilter,  setCatFilter]  = useState<RecipeCategory | 'all'>('all')
  const [expanded,   setExpanded]   = useState<string | null>(null)
  const [clients,    setClients]    = useState<Client[]>([])
  const [assigning,  setAssigning]  = useState<AssignModalState | null>(null)
  const [saving,     setSaving]     = useState(false)

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const [{ data: recetasData }, { data: clientsData }] = await Promise.all([
      supabase.from('recetas').select('*').eq('es_publica', true).order('nombre'),
      supabase.from('trainer_clients')
        .select('client_id, profiles!client_id(id, full_name)')
        .eq('trainer_id', user.id)
        .eq('status', 'active'),
    ])

    setRecetas((recetasData ?? []) as Receta[])
    setClients(
      ((clientsData ?? []) as unknown as { client_id: string; profiles: { id: string; full_name: string } }[])
        .map(r => ({ id: r.client_id, full_name: r.profiles?.full_name ?? '—' }))
    )
    setLoading(false)
  }, [supabase, router])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = useMemo(() => recetas.filter(r => {
    const matchesCat = catFilter === 'all' || r.categoria === catFilter
    const matchesQ = !query || r.nombre.toLowerCase().includes(query.toLowerCase()) ||
      r.ingredientes.toLowerCase().includes(query.toLowerCase())
    return matchesCat && matchesQ
  }), [recetas, catFilter, query])

  async function handleAssign() {
    if (!assigning) return
    setSaving(true)
    const { error } = await supabase.from('diet_assignments').upsert({
      trainer_id: (await supabase.auth.getUser()).data.user?.id,
      client_id:  assigning.clientId,
      receta_id:  assigning.receta.id,
      slot:       assigning.slot,
      day_date:   assigning.dayDate,
    }, { onConflict: 'trainer_id,client_id,slot,day_date' })
    setSaving(false)
    if (error) { toast.error('Error al asignar'); return }
    toast.success(`"${assigning.receta.nombre}" asignada ✓`)
    setAssigning(null)
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg text-fg-muted hover:text-fg-primary hover:bg-surface-2 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-fg-primary">Biblioteca de recetas</h1>
          <p className="text-fg-muted text-sm mt-0.5">{recetas.length} recetas · Asigna recetas a tus clientes por día y slot</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar receta o ingrediente..."
            className="input pl-9 w-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCatFilter(c.value as RecipeCategory | 'all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                catFilter === c.value
                  ? `${c.color} border-current`
                  : 'bg-surface-2 text-fg-muted border-border hover:border-border-strong'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-fg-muted">{filtered.length} recetas encontradas</p>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-fg-muted">Sin recetas con ese filtro.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => {
            const cat = CATEGORIES.find(c => c.value === r.categoria)
            const isOpen = expanded === r.id
            return (
              <div key={r.id} className="card overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-surface-2/40 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                >
                  {/* Category badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cat?.color}`}>
                    {cat?.label}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-fg-primary text-sm">{r.nombre}</div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-fg-muted flex-wrap">
                      <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {r.calorias} kcal</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.tiempo_prep} min</span>
                      <span>{r.proteinas}g P · {r.carbohidratos}g C · {r.grasas}g G</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        setAssigning({
                          receta: r,
                          clientId: clients[0]?.id ?? '',
                          slot: r.categoria as DietSlot,
                          dayDate: todayStr,
                        })
                      }}
                      className="flex items-center gap-1.5 text-xs text-brand-primary hover:text-brand-primary/80 font-semibold px-2 py-1 rounded-lg hover:bg-brand-primary/10 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Asignar
                    </button>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-fg-muted" /> : <ChevronDown className="w-4 h-4 text-fg-muted" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-border/50 px-4 pb-4 pt-3 space-y-3">
                    <div>
                      <p className="text-[11px] font-semibold text-fg-muted uppercase tracking-wider mb-1">Ingredientes</p>
                      <p className="text-sm text-fg-secondary leading-relaxed">{r.ingredientes}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-fg-muted uppercase tracking-wider mb-1">Preparación</p>
                      <p className="text-sm text-fg-secondary leading-relaxed">{r.instrucciones}</p>
                    </div>
                    {/* Macros detail */}
                    <div className="flex gap-3 flex-wrap">
                      {[
                        { label: 'Calorías', value: `${r.calorias} kcal`, color: 'text-semantic-warning-text' },
                        { label: 'Proteínas', value: `${r.proteinas}g`, color: 'text-semantic-info-text' },
                        { label: 'Carbohidratos', value: `${r.carbohidratos}g`, color: 'text-emerald-400' },
                        { label: 'Grasas', value: `${r.grasas}g`, color: 'text-violet-400' },
                      ].map(m => (
                        <div key={m.label} className="card px-3 py-2 text-center bg-surface-2/60">
                          <div className={`text-sm font-bold ${m.color}`}>{m.value}</div>
                          <div className="text-[10px] text-fg-muted">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Assign modal */}
      {assigning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setAssigning(null)}>
          <div className="card w-full max-w-sm p-6 space-y-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-fg-primary text-sm">Asignar receta</h3>
                <p className="text-xs text-fg-muted mt-0.5 truncate max-w-[240px]">{assigning.receta.nombre}</p>
              </div>
              <button onClick={() => setAssigning(null)} className="p-1.5 rounded-lg text-fg-muted hover:text-fg-primary hover:bg-surface-2 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Client */}
              <div>
                <label className="label">Cliente</label>
                <select
                  value={assigning.clientId}
                  onChange={e => setAssigning(p => p ? { ...p, clientId: e.target.value } : p)}
                  className="input w-full"
                >
                  {clients.length === 0 && <option value="">Sin clientes activos</option>}
                  {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>

              {/* Day */}
              <div>
                <label className="label">Día</label>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-fg-muted shrink-0" />
                  <input
                    type="date"
                    value={assigning.dayDate}
                    min={todayStr}
                    onChange={e => setAssigning(p => p ? { ...p, dayDate: e.target.value } : p)}
                    className="input flex-1"
                  />
                </div>
              </div>

              {/* Slot */}
              <div>
                <label className="label">Momento del día</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['desayuno', 'comida', 'cena', 'snack'] as DietSlot[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setAssigning(p => p ? { ...p, slot: s } : p)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        assigning.slot === s
                          ? SLOT_COLORS[s]
                          : 'bg-surface-2 text-fg-muted border-border hover:border-border-strong'
                      }`}
                    >
                      {assigning.slot === s && <Check className="w-3 h-3" />}
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setAssigning(null)} className="btn-secondary flex-1 py-2 text-sm">Cancelar</button>
              <button
                onClick={handleAssign}
                disabled={saving || !assigning.clientId}
                className="btn-primary flex-1 py-2 text-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Asignar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
