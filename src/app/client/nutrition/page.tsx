'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Loader2, UtensilsCrossed, Download, Droplets, Plus, Minus, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { MealPlan, Meal, FoodItem } from '@/types/database'
import EmptyState from '@/components/ui/EmptyState'


interface MealPlanWithMeals extends MealPlan {
  meals: Meal[]
}

function MacroBar({ label, value, max, color }: {
  label: string; value: number; max: number; color: string
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-fg-muted">{label}</span>
        <span className="font-mono font-semibold text-fg-primary">{value}g / {max}g</span>
      </div>
      <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function ClientNutritionPage() {
  const supabase = useMemo(() => createClient(), [])
  const [plan, setPlan]         = useState<MealPlanWithMeals | null>(null)
  const [loading, setLoading]   = useState(true)
  const [checkedFoods, setCheckedFoods] = useState<Set<string>>(new Set())
  const [waterGlasses, setWaterGlasses] = useState(0)
  const [userId, setUserId]     = useState<string | null>(null)
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const WATER_GOAL = 8

  useEffect(() => {
    async function fetchPlan() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [{ data }, { data: tc }] = await Promise.all([
        supabase.from('meal_plans')
          .select('*, meals(*)')
          .eq('client_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        supabase.from('trainer_clients')
          .select('trainer_id')
          .eq('client_id', user.id)
          .eq('status', 'active')
          .single(),
      ])

      if (tc) setTrainerId(tc.trainer_id)
      if (data) {
        const sorted = {
          ...data,
          meals: (data.meals as Meal[]).sort((a, b) => a.order_index - b.order_index),
        }
        setPlan(sorted as MealPlanWithMeals)
      }
      setLoading(false)
    }
    fetchPlan()
  }, [supabase])

  // Load food tracking state from localStorage on mount / plan change
  useEffect(() => {
    if (!plan) return
    const today = new Date().toISOString().split('T')[0]
    const saved = localStorage.getItem(`food-tracking-${plan.id}-${today}`)
    if (saved) {
      try { setCheckedFoods(new Set(JSON.parse(saved) as string[])) } catch {}
    } else {
      setCheckedFoods(new Set())
    }
  }, [plan])

  // Load water tracking from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const saved = localStorage.getItem(`water-tracking-${today}`)
    if (saved) setWaterGlasses(parseInt(saved, 10) || 0)
  }, [])

  const adjustWater = (delta: number) => {
    setWaterGlasses(prev => {
      const next = Math.max(0, Math.min(WATER_GOAL + 4, prev + delta))
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem(`water-tracking-${today}`, String(next))
      return next
    })
  }

  const toggleFood = (mealIdx: number, foodIdx: number) => {
    const key = `${mealIdx}-${foodIdx}`
    setCheckedFoods(prev => {
      const n = new Set(prev)
      if (n.has(key)) n.delete(key); else n.add(key)
      const today = new Date().toISOString().split('T')[0]
      if (plan) {
        localStorage.setItem(`food-tracking-${plan.id}-${today}`, JSON.stringify(Array.from(n)))
      }
      return n
    })
  }

  // Calculate totals from all meals
  const totals = plan?.meals.reduce((acc, meal) => {
    const foods = meal.foods as FoodItem[]
    foods.forEach(f => {
      acc.calories += f.calories || 0
      acc.protein  += f.protein  || 0
      acc.carbs    += f.carbs    || 0
      acc.fat      += f.fat      || 0
    })
    return acc
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 })

  // Calculate consumed totals from checked foods only
  const consumed = plan?.meals.reduce((acc, meal, mealIdx) => {
    const foods = meal.foods as FoodItem[]
    foods.forEach((f, foodIdx) => {
      if (checkedFoods.has(`${mealIdx}-${foodIdx}`)) {
        acc.calories += f.calories || 0
        acc.protein  += f.protein  || 0
        acc.carbs    += f.carbs    || 0
        acc.fat      += f.fat      || 0
      }
    })
    return acc
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 })

  const totalFoodsCount = plan?.meals.reduce((acc, m) => acc + (m.foods as FoodItem[]).length, 0) ?? 0
  const allMealsDone = totalFoodsCount > 0 && checkedFoods.size >= totalFoodsCount

  // Notify trainer once per day when all meals are completed
  useEffect(() => {
    if (!allMealsDone || !trainerId || !userId || !plan) return
    const today = new Date().toISOString().split('T')[0]
    const key = `nutrition-notif-${plan.id}-${today}`
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
    supabase.from('notifications').insert({
      user_id: trainerId,
      type: 'system',
      title: '¡Plan de nutrición completado!',
      body: 'Tu cliente ha completado todos los alimentos del día.',
      link: `/dashboard/clients/${userId}`,
    }).then(() => {})
  }, [allMealsDone, trainerId, userId, plan, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  if (!plan) {
    return (
      <EmptyState
        icon={<UtensilsCrossed className="w-8 h-8 text-fg-muted" />}
        title="Sin plan nutricional"
        description="Tu entrenador todavía no te ha asignado un plan. Escríbele un mensaje para empezar."
        action={{ label: 'Escribir a mi entrenador', onClick: () => { window.location.href = '/client/messages' } }}
      />
    )
  }

  async function handleExportPdf() {
    if (!plan) return
    const { exportNutritionPdf } = await import('@/lib/exportPdf')
    await exportNutritionPdf({ ...plan, meals: plan.meals ?? [] }, '')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg-primary">{plan.title}</h1>
          <p className="text-fg-muted text-sm mt-0.5">Plan nutricional activo</p>
        </div>
        <button onClick={handleExportPdf} className="btn-secondary flex-shrink-0 text-sm">
          <Download className="w-4 h-4" />
          PDF
        </button>
      </div>

      {/* Macros overview */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-fg-primary">Objetivos del día</h2>
          {checkedFoods.size > 0 && (
            <span className="text-xs text-fg-muted">
              Consumido: <span className="text-fg-primary font-semibold">{consumed?.calories ?? 0} kcal</span>
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Calorías', value: totals?.calories ?? 0, consumed: consumed?.calories ?? 0, target: plan.calories_target ?? 0, unit: 'kcal', color: 'text-fg-primary' },
            { label: 'Proteína', value: totals?.protein ?? 0, consumed: consumed?.protein ?? 0, target: plan.protein_target ?? 0, unit: 'g', color: 'text-semantic-info-text' },
            { label: 'Carbos', value: totals?.carbs ?? 0, consumed: consumed?.carbs ?? 0, target: plan.carbs_target ?? 0, unit: 'g', color: 'text-semantic-warning-text' },
            { label: 'Grasa', value: totals?.fat ?? 0, consumed: consumed?.fat ?? 0, target: plan.fat_target ?? 0, unit: 'g', color: 'text-brand-secondary-text' },
          ].map(m => (
            <div key={m.label} className="text-center p-3 rounded-xl bg-surface-2">
              <div className={`font-mono text-xl font-bold ${m.color}`}>
                {checkedFoods.size > 0 ? m.consumed : m.value}
              </div>
              <div className="text-xs text-fg-muted mt-0.5">{m.label}</div>
              {m.target > 0 && (
                <div className="text-xs text-fg-disabled mt-0.5">/ {m.target}{m.unit}</div>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {plan.protein_target && <MacroBar label="Proteína" value={checkedFoods.size > 0 ? (consumed?.protein ?? 0) : (totals?.protein ?? 0)} max={plan.protein_target} color="bg-semantic-info" />}
          {plan.carbs_target   && <MacroBar label="Carbos"   value={checkedFoods.size > 0 ? (consumed?.carbs ?? 0) : (totals?.carbs ?? 0)}     max={plan.carbs_target}   color="bg-semantic-warning" />}
          {plan.fat_target     && <MacroBar label="Grasa"    value={checkedFoods.size > 0 ? (consumed?.fat ?? 0) : (totals?.fat ?? 0)}         max={plan.fat_target}     color="bg-brand-secondary" />}
        </div>
      </div>

      {/* Daily tracking header */}
      {(() => {
        const todayLabel = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
        const totalFoods = totalFoodsCount
        const checkedCount = checkedFoods.size
        const pct = totalFoods > 0 ? Math.round(checkedCount / totalFoods * 100) : 0
        const allDone = allMealsDone
        const circumference = 2 * Math.PI * 28
        return (
          <>
            <div className={`card p-4 mb-4 flex items-center justify-between transition-colors ${allDone ? 'border-brand-accent/30 bg-gradient-to-br from-brand-accent/[0.06] to-brand-accent/[0.02]' : ''}`}>
              <div>
                <p className="text-sm font-semibold text-fg-primary capitalize">{todayLabel}</p>
                <p className="text-xs text-fg-muted mt-0.5">{checkedCount} de {totalFoods} alimentos completados</p>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" strokeWidth="4" className="stroke-slate-700" fill="none" />
                  <circle cx="32" cy="32" r="28" strokeWidth="4" fill="none"
                    className={allDone ? 'stroke-emerald-400' : 'stroke-brand-primary'}
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={`${circumference * (1 - checkedCount / Math.max(totalFoods, 1))}`}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.3s' }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  {allDone
                    ? <Trophy className="w-5 h-5 text-semantic-success-text" />
                    : <span className="text-xs font-bold text-fg-primary">{pct}%</span>}
                </div>
              </div>
            </div>
            {allDone && (
              <div className="rounded-xl p-4 flex items-center gap-3 mb-4 animate-fade-in bg-gradient-to-br from-brand-accent/10 to-semantic-info/[0.06] border border-brand-accent/25">
                <div className="w-10 h-10 rounded-xl bg-semantic-success/20 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-semantic-success-text" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-fg-primary">¡Plan completado! 🎉</p>
                  <p className="text-xs text-fg-muted mt-0.5">Has completado todos los alimentos del día. ¡Excelente disciplina!</p>
                </div>
              </div>
            )}
          </>
        )
      })()}

      {/* Water tracking */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-semantic-info-text" />
            <span className="font-semibold text-fg-primary text-sm">Hidratación</span>
          </div>
          <span className="text-xs text-fg-muted font-mono">{waterGlasses}/{WATER_GOAL} vasos</span>
        </div>
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {Array.from({ length: WATER_GOAL }).map((_, i) => (
            <button
              key={i}
              onClick={() => adjustWater(i < waterGlasses ? -(waterGlasses - i) : (i + 1 - waterGlasses))}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                i < waterGlasses
                  ? 'bg-semantic-info text-white'
                  : 'bg-surface-2 text-fg-disabled hover:text-fg-muted border border-border/50'
              }`}
              title={`${i + 1} vasos`}
            >
              <Droplets className="w-4 h-4" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => adjustWater(-1)} disabled={waterGlasses === 0}
            className="btn-ghost py-1 px-2 text-xs disabled:opacity-30">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
            <div className="h-full bg-semantic-info rounded-full transition-all duration-300"
                 style={{ width: `${Math.min(100, (waterGlasses / WATER_GOAL) * 100)}%` }} />
          </div>
          <button onClick={() => adjustWater(1)} disabled={waterGlasses >= WATER_GOAL + 4}
            className="btn-ghost py-1 px-2 text-xs disabled:opacity-30">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {waterGlasses >= WATER_GOAL && (
          <p className="text-semantic-success-text text-xs font-semibold mt-2 text-center">
            ¡Objetivo de hidratación alcanzado! 💧
          </p>
        )}
      </div>

      {/* Meals */}
      <div className="space-y-4">
        {plan.meals.map((meal, mealIdx) => {
          const foods = meal.foods as FoodItem[]
          const mealCals = foods.reduce((s, f) => s + (f.calories || 0), 0)
          return (
            <div key={meal.id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-fg-primary">{meal.name}</h3>
                  {meal.time && <span className="text-xs text-fg-muted">{meal.time}</span>}
                </div>
                <span className="font-mono text-sm font-bold text-brand-primary">{mealCals} kcal</span>
              </div>
              <div className="space-y-2">
                {foods.map((food, foodIdx) => {
                  const isChecked = checkedFoods.has(`${mealIdx}-${foodIdx}`)
                  return (
                    <div key={foodIdx} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                      <button
                        onClick={() => toggleFood(mealIdx, foodIdx)}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-all shrink-0 ${
                          isChecked ? 'bg-semantic-success border-semantic-success' : 'border-border-strong hover:border-border-bright'
                        }`}
                        aria-label={isChecked ? 'Desmarcar alimento' : 'Marcar alimento como comido'}
                      >
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex items-center justify-between flex-1">
                        <div>
                          <span className={`text-sm transition-colors ${isChecked ? 'text-fg-muted line-through' : 'text-fg-primary'}`}>{food.name}</span>
                          <span className="text-xs text-fg-muted ml-2">{food.grams}g</span>
                        </div>
                        <div className="flex gap-4 text-xs text-fg-muted font-mono">
                          <span>{food.calories}kcal</span>
                          <span className="text-semantic-info-text">{food.protein}p</span>
                          <span className="text-semantic-warning-text">{food.carbs}c</span>
                          <span className="text-brand-secondary-text">{food.fat}g</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {foods.length === 0 && (
                  <p className="text-xs text-fg-muted italic">Sin alimentos configurados</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {plan.notes && (
        <div className="card p-5">
          <h3 className="font-semibold text-fg-primary mb-2">Notas del entrenador</h3>
          <p className="text-sm text-fg-muted leading-relaxed">{plan.notes}</p>
        </div>
      )}
    </div>
  )
}
