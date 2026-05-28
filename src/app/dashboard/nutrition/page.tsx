'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Apple, Plus, Search, ChevronDown, ChevronUp,
  Trash2, X, Clock, Flame, Users,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { cn, formatDate } from '@/lib/utils'
import type { Profile, MealPlan, Meal, FoodItem } from '@/types/database'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MealPlanWithExtras extends MealPlan {
  client: Profile | null
  meals: Meal[]
}

interface FoodDraft {
  id: string
  name: string
  grams: string
  calories: string
  protein: string
  carbs: string
  fat: string
}

interface MealDraft {
  id: string
  name: string
  time: string
  foods: FoodDraft[]
}

function blankFood(): FoodDraft {
  return { id: crypto.randomUUID(), name: '', grams: '', calories: '', protein: '', carbs: '', fat: '' }
}

function blankMeal(): MealDraft {
  return { id: crypto.randomUUID(), name: '', time: '', foods: [blankFood()] }
}

// ─── Macro bar component ──────────────────────────────────────────────────────

function MacroBar({ label, value, pct, color }: { label: string; value: number; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span>{value}g · {Math.round(pct)}%</span>
      </div>
      <div className="h-2 bg-[#334155] rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NutritionPage() {
  const supabase = createClient()

  const [plans, setPlans] = useState<MealPlanWithExtras[]>([])
  const [clients, setClients] = useState<Profile[]>([])
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filterClient, setFilterClient] = useState('')
  const [filterStatus, setFilterStatus] = useState<'active' | 'archived' | ''>('')

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showNewPlanModal, setShowNewPlanModal] = useState(false)
  const [addMealForPlan, setAddMealForPlan] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // ── Load data ──────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setTrainerId(user.id)

    const [
      { data: plansData },
      { data: mealsData },
      { data: tcData },
    ] = await Promise.all([
      supabase.from('meal_plans').select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('meals').select('*').order('order_index'),
      supabase.from('trainer_clients')
        .select('client_id, profile:client_id(id, full_name, avatar_url, phone, bio, specialties, role, created_at, updated_at)')
        .eq('trainer_id', user.id),
    ])

    const clientProfiles: Profile[] = (tcData ?? []).map(tc => tc.profile as unknown as Profile).filter(Boolean)
    setClients(clientProfiles)
    const clientMap = Object.fromEntries(clientProfiles.map(c => [c.id, c]))

    const enriched: MealPlanWithExtras[] = (plansData ?? []).map(p => ({
      ...p,
      client: clientMap[p.client_id] ?? null,
      meals: (mealsData ?? []).filter(m => m.meal_plan_id === p.id) as Meal[],
    }))

    setPlans(enriched)
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData() }, [loadData])

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Archive / restore ──────────────────────────────────────────────────────

  const toggleArchive = async (id: string, current: 'active' | 'archived') => {
    const next = current === 'active' ? 'archived' : 'active'
    const { error } = await supabase.from('meal_plans').update({ status: next }).eq('id', id)
    if (error) { toast.error('Error: ' + error.message); return }
    toast.success(next === 'archived' ? 'Plan archivado' : 'Plan restaurado')
    setPlans(prev => prev.map(p => p.id === id ? { ...p, status: next } : p))
  }

  // ── Delete plan ────────────────────────────────────────────────────────────

  const deletePlan = async (id: string) => {
    const { error } = await supabase.from('meal_plans').delete().eq('id', id)
    if (error) { toast.error('Error eliminando plan: ' + error.message); return }
    toast.success('Plan eliminado')
    setDeleteConfirm(null)
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = plans.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.client?.full_name.toLowerCase().includes(q) ?? false)
    const matchClient = !filterClient || p.client_id === filterClient
    const matchStatus = !filterStatus || p.status === filterStatus
    return matchSearch && matchClient && matchStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[#0EA5E9] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Nutrición</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gestiona los planes de alimentación</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowNewPlanModal(true)}>
          <Plus size={16} /> Nuevo plan
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Buscar planes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={filterClient} onChange={e => setFilterClient(e.target.value)}>
          <option value="">Todos los clientes</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
        <select className="input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}>
          <option value="">Todos</option>
          <option value="active">Activos</option>
          <option value="archived">Archivados</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Apple />}
          title={search || filterClient || filterStatus ? 'Sin resultados' : 'Sin planes de nutrición'}
          description={search || filterClient || filterStatus ? 'Prueba con otros filtros.' : 'Crea el primer plan de alimentación para tus clientes.'}
          action={!search && !filterClient && !filterStatus ? { label: 'Nuevo plan', onClick: () => setShowNewPlanModal(true) } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              expanded={expanded.has(plan.id)}
              onToggle={() => toggleExpand(plan.id)}
              onArchive={() => toggleArchive(plan.id, plan.status)}
              onDelete={() => setDeleteConfirm(plan.id)}
              onAddMeal={() => { setAddMealForPlan(plan.id); setExpanded(prev => { const s = new Set(prev); s.add(plan.id); return s }) }}
              onMealAdded={loadData}
            />
          ))}
        </div>
      )}

      {/* New Plan Modal */}
      <NewPlanModal
        isOpen={showNewPlanModal}
        onClose={() => setShowNewPlanModal(false)}
        trainerId={trainerId!}
        clients={clients}
        onSuccess={() => { setShowNewPlanModal(false); loadData() }}
      />

      {/* Add Meal Modal */}
      {addMealForPlan && (
        <AddMealModal
          isOpen={true}
          onClose={() => setAddMealForPlan(null)}
          planId={addMealForPlan}
          mealCount={plans.find(p => p.id === addMealForPlan)?.meals.length ?? 0}
          onSuccess={() => { setAddMealForPlan(null); loadData() }}
        />
      )}

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar plan" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            ¿Estás seguro de que quieres eliminar este plan? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancelar</button>
            <button type="button" onClick={() => deletePlan(deleteConfirm!)} className="btn-danger flex-1">
              <Trash2 size={15} /> Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, expanded, onToggle, onArchive, onDelete, onAddMeal, onMealAdded }: {
  plan: MealPlanWithExtras
  expanded: boolean
  onToggle: () => void
  onArchive: () => void
  onDelete: () => void
  onAddMeal: () => void
  onMealAdded: () => void
}) {
  const p = plan.protein_target ?? 0
  const c = plan.carbs_target ?? 0
  const f = plan.fat_target ?? 0
  const totalMacroCal = p * 4 + c * 4 + f * 9
  const pPct = totalMacroCal > 0 ? (p * 4 / totalMacroCal) * 100 : 0
  const cPct = totalMacroCal > 0 ? (c * 4 / totalMacroCal) * 100 : 0
  const fPct = totalMacroCal > 0 ? (f * 9 / totalMacroCal) * 100 : 0

  return (
    <div className={cn('card overflow-hidden', plan.status === 'archived' && 'opacity-60')}>
      {/* Card header */}
      <button
        type="button"
        className="w-full p-5 text-left hover:bg-[#334155]/20 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center shrink-0">
            <Apple size={18} className="text-[#10B981]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-white">{plan.title}</span>
              <Badge status={plan.status} />
            </div>
            {plan.client && (
              <div className="flex items-center gap-2 mt-1.5">
                <Avatar name={plan.client.full_name} url={plan.client.avatar_url} size="sm" />
                <span className="text-sm text-slate-400">{plan.client.full_name}</span>
              </div>
            )}
            {plan.calories_target && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                <Flame size={11} className="text-amber-400" />
                <span>{plan.calories_target} kcal / día</span>
              </div>
            )}
          </div>
          <div className="shrink-0 ml-2">
            {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </div>
        </div>

        {/* Macro bars preview */}
        {totalMacroCal > 0 && (
          <div className="mt-4 space-y-2">
            <MacroBar label="Proteína" value={p} pct={pPct} color="bg-sky-500" />
            <MacroBar label="Carbohidratos" value={c} pct={cPct} color="bg-amber-500" />
            <MacroBar label="Grasa" value={f} pct={fPct} color="bg-violet-500" />
          </div>
        )}
      </button>

      {/* Expanded meals */}
      {expanded && (
        <div className="border-t border-[#334155] px-5 pb-5 pt-4 space-y-4">
          {plan.notes && (
            <p className="text-sm text-slate-300">{plan.notes}</p>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300">
              Comidas ({plan.meals.length})
            </h3>
            <button type="button" onClick={onAddMeal} className="btn-primary text-xs py-1.5 px-3">
              <Plus size={13} /> Añadir comida
            </button>
          </div>

          {plan.meals.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-3">Sin comidas añadidas</p>
          ) : (
            <div className="space-y-3">
              {plan.meals.map(meal => (
                <MealRow key={meal.id} meal={meal} />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1 border-t border-[#334155]">
            <button type="button" onClick={onArchive} className="btn-secondary text-xs py-1.5 px-3">
              {plan.status === 'active' ? 'Archivar' : 'Restaurar'}
            </button>
            <button type="button" onClick={onDelete} className="btn-danger text-xs py-1.5 px-3 ml-auto">
              <Trash2 size={13} /> Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Meal Row ─────────────────────────────────────────────────────────────────

function MealRow({ meal }: { meal: Meal }) {
  const [open, setOpen] = useState(false)
  const foods = (meal.foods ?? []) as FoodItem[]
  const totals = foods.reduce(
    (acc, f) => ({ kcal: acc.kcal + f.calories, p: acc.p + f.protein, c: acc.c + f.carbs, f: acc.f + f.fat }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  )

  return (
    <div className="rounded-lg border border-[#334155]/60 bg-[#0F172A]/30 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#334155]/20 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        {meal.time && (
          <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
            <Clock size={11} /> {meal.time}
          </div>
        )}
        <span className="flex-1 font-medium text-sm text-slate-200">{meal.name}</span>
        <span className="text-xs text-slate-400 shrink-0">{Math.round(totals.kcal)} kcal</span>
        {open ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-2">
          {foods.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-2">Sin alimentos</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#334155]">
                    {['Alimento', 'g', 'kcal', 'P', 'C', 'G'].map(h => (
                      <th key={h} className="text-left pb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]/30">
                  {foods.map((food, i) => (
                    <tr key={i}>
                      <td className="py-1.5 pr-3 text-slate-300 font-medium">{food.name}</td>
                      <td className="py-1.5 pr-3 text-slate-400">{food.grams}</td>
                      <td className="py-1.5 pr-3 text-slate-400">{food.calories}</td>
                      <td className="py-1.5 pr-3 text-sky-400">{food.protein}g</td>
                      <td className="py-1.5 pr-3 text-amber-400">{food.carbs}g</td>
                      <td className="py-1.5 text-violet-400">{food.fat}g</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#334155] font-semibold">
                    <td className="pt-2 pr-3 text-slate-300">Total</td>
                    <td className="pt-2 pr-3 text-slate-400">—</td>
                    <td className="pt-2 pr-3 text-slate-300">{Math.round(totals.kcal)}</td>
                    <td className="pt-2 pr-3 text-sky-400">{Math.round(totals.p)}g</td>
                    <td className="pt-2 pr-3 text-amber-400">{Math.round(totals.c)}g</td>
                    <td className="pt-2 text-violet-400">{Math.round(totals.f)}g</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── New Plan Modal ───────────────────────────────────────────────────────────

function NewPlanModal({ isOpen, onClose, trainerId, clients, onSuccess }: {
  isOpen: boolean; onClose: () => void; trainerId: string; clients: Profile[]; onSuccess: () => void
}) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    client_id: '', title: '', calories_target: '',
    protein_target: '', carbs_target: '', fat_target: '', notes: '',
  })

  const p = Number(form.protein_target) || 0
  const c = Number(form.carbs_target) || 0
  const f = Number(form.fat_target) || 0
  const totalCal = p * 4 + c * 4 + f * 9

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return }
    if (!form.client_id) { toast.error('Selecciona un cliente'); return }
    setSaving(true)
    const { error } = await supabase.from('meal_plans').insert({
      trainer_id: trainerId,
      client_id: form.client_id,
      title: form.title.trim(),
      calories_target: form.calories_target ? Number(form.calories_target) : null,
      protein_target: form.protein_target ? Number(form.protein_target) : null,
      carbs_target: form.carbs_target ? Number(form.carbs_target) : null,
      fat_target: form.fat_target ? Number(form.fat_target) : null,
      notes: form.notes.trim() || null,
      status: 'active',
    })
    setSaving(false)
    if (error) { toast.error('Error: ' + error.message); return }
    toast.success('Plan creado correctamente')
    setForm({ client_id: '', title: '', calories_target: '', protein_target: '', carbs_target: '', fat_target: '', notes: '' })
    onSuccess()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo plan nutricional" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label flex items-center gap-1"><Users size={11} /> Cliente *</label>
          {clients.length === 0 ? (
            <p className="text-sm text-slate-400">No tienes clientes activos.</p>
          ) : (
            <select className="input" value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))}>
              <option value="">Seleccionar cliente...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          )}
        </div>
        <div>
          <label className="label">Título del plan *</label>
          <input className="input" placeholder="Ej: Plan volumen Q1 2025" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
        </div>
        <div>
          <label className="label flex items-center gap-1"><Flame size={11} className="text-amber-400" /> Objetivo calórico (kcal)</label>
          <input type="number" className="input" placeholder="2200" value={form.calories_target} onChange={e => setForm(p => ({ ...p, calories_target: e.target.value }))} />
        </div>

        {/* Macro targets */}
        <div>
          <label className="label">Objetivos de macros</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] font-semibold text-sky-400 uppercase tracking-wide mb-1">Proteína (g)</div>
              <input type="number" className="input border-sky-500/30 focus:border-sky-500 text-sm" placeholder="180" value={form.protein_target} onChange={e => setForm(p => ({ ...p, protein_target: e.target.value }))} />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide mb-1">Carbos (g)</div>
              <input type="number" className="input border-amber-500/30 focus:border-amber-500 text-sm" placeholder="250" value={form.carbs_target} onChange={e => setForm(p => ({ ...p, carbs_target: e.target.value }))} />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-violet-400 uppercase tracking-wide mb-1">Grasa (g)</div>
              <input type="number" className="input border-violet-500/30 focus:border-violet-500 text-sm" placeholder="70" value={form.fat_target} onChange={e => setForm(p => ({ ...p, fat_target: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Macro split calculator */}
        {totalCal > 0 && (
          <div className="rounded-xl bg-[#0F172A]/60 border border-[#334155] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Distribución de macros</h4>
              <span className="text-xs text-slate-400">{totalCal} kcal calculadas</span>
            </div>
            <MacroBar label="Proteína" value={p} pct={(p * 4 / totalCal) * 100} color="bg-sky-500" />
            <MacroBar label="Carbohidratos" value={c} pct={(c * 4 / totalCal) * 100} color="bg-amber-500" />
            <MacroBar label="Grasa" value={f} pct={(f * 9 / totalCal) * 100} color="bg-violet-500" />
            {form.calories_target && (
              <p className={cn('text-xs text-center mt-1', Math.abs(Number(form.calories_target) - totalCal) < 50 ? 'text-emerald-400' : 'text-amber-400')}>
                {Math.abs(Number(form.calories_target) - totalCal) < 50
                  ? 'Macros alineados con el objetivo calórico'
                  : `Diferencia de ${Math.abs(Math.round(Number(form.calories_target) - totalCal))} kcal con el objetivo`
                }
              </p>
            )}
          </div>
        )}

        <div>
          <label className="label">Notas</label>
          <textarea className="input resize-none" rows={2} placeholder="Indicaciones, restricciones alimentarias..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Guardando...' : 'Crear plan'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Add Meal Modal ───────────────────────────────────────────────────────────

function AddMealModal({ isOpen, onClose, planId, mealCount, onSuccess }: {
  isOpen: boolean; onClose: () => void; planId: string; mealCount: number; onSuccess: () => void
}) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [meal, setMeal] = useState<MealDraft>(blankMeal())

  const addFood = () => setMeal(prev => ({ ...prev, foods: [...prev.foods, blankFood()] }))
  const removeFood = (id: string) => setMeal(prev => ({ ...prev, foods: prev.foods.filter(f => f.id !== id) }))
  const updateFood = (id: string, field: keyof FoodDraft, value: string) => {
    setMeal(prev => ({ ...prev, foods: prev.foods.map(f => f.id === id ? { ...f, [field]: value } : f) }))
  }

  // Auto-calculate calories from macros when protein/carbs/fat change
  const recalcFood = (id: string, updatedFood: Partial<FoodDraft>) => {
    setMeal(prev => {
      const foods = prev.foods.map(f => {
        if (f.id !== id) return f
        const merged = { ...f, ...updatedFood }
        const p = Number(merged.protein) || 0
        const c = Number(merged.carbs) || 0
        const fa = Number(merged.fat) || 0
        const kcal = Math.round(p * 4 + c * 4 + fa * 9)
        return { ...merged, calories: kcal > 0 ? String(kcal) : merged.calories }
      })
      return { ...prev, foods }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meal.name.trim()) { toast.error('El nombre de la comida es obligatorio'); return }
    setSaving(true)

    const validFoods: FoodItem[] = meal.foods
      .filter(f => f.name.trim())
      .map(f => ({
        name: f.name.trim(),
        grams: Number(f.grams) || 0,
        calories: Number(f.calories) || 0,
        protein: Number(f.protein) || 0,
        carbs: Number(f.carbs) || 0,
        fat: Number(f.fat) || 0,
      }))

    const { error } = await supabase.from('meals').insert({
      meal_plan_id: planId,
      name: meal.name.trim(),
      time: meal.time.trim() || null,
      foods: validFoods,
      order_index: mealCount,
    })

    setSaving(false)
    if (error) { toast.error('Error: ' + error.message); return }
    toast.success('Comida añadida')
    setMeal(blankMeal())
    onSuccess()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir comida" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Nombre de la comida *</label>
            <input className="input" placeholder="Ej: Desayuno" value={meal.name} onChange={e => setMeal(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="label flex items-center gap-1"><Clock size={11} /> Hora</label>
            <input type="time" className="input" value={meal.time} onChange={e => setMeal(p => ({ ...p, time: e.target.value }))} />
          </div>
        </div>

        {/* Foods */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Alimentos</label>
            <button type="button" onClick={addFood} className="text-xs text-[#0EA5E9] hover:underline flex items-center gap-1">
              <Plus size={12} /> Añadir alimento
            </button>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {meal.foods.map((food, i) => (
              <div key={food.id} className="rounded-lg border border-[#334155] bg-[#0F172A]/40 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    className="input flex-1 text-sm"
                    placeholder={`Alimento ${i + 1} (ej: Pechuga de pollo)`}
                    value={food.name}
                    onChange={e => updateFood(food.id, 'name', e.target.value)}
                  />
                  <button type="button" onClick={() => removeFood(food.id)} className="text-slate-500 hover:text-red-400 transition-colors shrink-0">
                    <X size={15} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="label text-[10px]">Gramos</label>
                    <input type="number" className="input text-xs" placeholder="150" value={food.grams} onChange={e => updateFood(food.id, 'grams', e.target.value)} />
                  </div>
                  <div>
                    <label className="label text-[10px] text-sky-400">Proteína (g)</label>
                    <input type="number" step="0.1" className="input text-xs border-sky-500/20" placeholder="30" value={food.protein}
                      onChange={e => recalcFood(food.id, { protein: e.target.value })} />
                  </div>
                  <div>
                    <label className="label text-[10px] text-amber-400">Carbos (g)</label>
                    <input type="number" step="0.1" className="input text-xs border-amber-500/20" placeholder="0" value={food.carbs}
                      onChange={e => recalcFood(food.id, { carbs: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label text-[10px] text-violet-400">Grasa (g)</label>
                    <input type="number" step="0.1" className="input text-xs border-violet-500/20" placeholder="5" value={food.fat}
                      onChange={e => recalcFood(food.id, { fat: e.target.value })} />
                  </div>
                  <div>
                    <label className="label text-[10px] text-amber-500">Calorías (kcal)</label>
                    <input type="number" className="input text-xs" placeholder="Auto" value={food.calories}
                      onChange={e => updateFood(food.id, 'calories', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals preview */}
        {meal.foods.some(f => f.name.trim()) && (() => {
          const validFoods = meal.foods.filter(f => f.name.trim())
          const t = validFoods.reduce(
            (acc, f) => ({ kcal: acc.kcal + (Number(f.calories) || 0), p: acc.p + (Number(f.protein) || 0), c: acc.c + (Number(f.carbs) || 0), fa: acc.fa + (Number(f.fat) || 0) }),
            { kcal: 0, p: 0, c: 0, fa: 0 }
          )
          return (
            <div className="flex gap-4 rounded-lg bg-[#334155]/20 px-4 py-3 text-xs font-medium">
              <span className="text-slate-300">{Math.round(t.kcal)} kcal</span>
              <span className="text-sky-400">{Math.round(t.p)}g P</span>
              <span className="text-amber-400">{Math.round(t.c)}g C</span>
              <span className="text-violet-400">{Math.round(t.fa)}g G</span>
            </div>
          )
        })()}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Guardando...' : 'Añadir comida'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
