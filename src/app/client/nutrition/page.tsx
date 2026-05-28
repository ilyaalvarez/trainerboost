'use client'

import { useEffect, useState } from 'react'
import { Loader2, UtensilsCrossed, Download } from 'lucide-react'
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
        <span className="text-slate-400">{label}</span>
        <span className="font-mono font-semibold text-white">{value}g / {max}g</span>
      </div>
      <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function ClientNutritionPage() {
  const supabase = createClient()
  const [plan, setPlan]     = useState<MealPlanWithMeals | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlan() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from('meal_plans')
        .select('*, meals(*)')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

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
  }, [])

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
        icon={<UtensilsCrossed className="w-8 h-8 text-slate-500" />}
        title="Sin plan nutricional"
        description="Tu entrenador todavía no te ha asignado un plan. Escríbele un mensaje."
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
          <h1 className="text-2xl font-bold text-white">{plan.title}</h1>
          <p className="text-slate-400 text-sm mt-0.5">Plan nutricional activo</p>
        </div>
        <button onClick={handleExportPdf} className="btn-secondary flex-shrink-0 text-sm">
          <Download className="w-4 h-4" />
          PDF
        </button>
      </div>

      {/* Macros overview */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-white">Objetivos del día</h2>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Calorías', value: totals?.calories ?? 0, target: plan.calories_target ?? 0, unit: 'kcal', color: 'text-white' },
            { label: 'Proteína', value: totals?.protein ?? 0, target: plan.protein_target ?? 0, unit: 'g', color: 'text-sky-400' },
            { label: 'Carbos', value: totals?.carbs ?? 0, target: plan.carbs_target ?? 0, unit: 'g', color: 'text-amber-400' },
            { label: 'Grasa', value: totals?.fat ?? 0, target: plan.fat_target ?? 0, unit: 'g', color: 'text-violet-400' },
          ].map(m => (
            <div key={m.label} className="text-center p-3 rounded-xl bg-surface-2">
              <div className={`font-mono text-xl font-bold ${m.color}`}>
                {m.value}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{m.label}</div>
              {m.target > 0 && (
                <div className="text-xs text-slate-600 mt-0.5">/ {m.target}{m.unit}</div>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {plan.protein_target && <MacroBar label="Proteína" value={totals?.protein ?? 0} max={plan.protein_target} color="bg-sky-400" />}
          {plan.carbs_target   && <MacroBar label="Carbos"   value={totals?.carbs ?? 0}   max={plan.carbs_target}   color="bg-amber-400" />}
          {plan.fat_target     && <MacroBar label="Grasa"    value={totals?.fat ?? 0}     max={plan.fat_target}     color="bg-violet-400" />}
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        {plan.meals.map(meal => {
          const foods = meal.foods as FoodItem[]
          const mealCals = foods.reduce((s, f) => s + (f.calories || 0), 0)
          return (
            <div key={meal.id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white">{meal.name}</h3>
                  {meal.time && <span className="text-xs text-slate-400">{meal.time}</span>}
                </div>
                <span className="font-mono text-sm font-bold text-brand-primary">{mealCals} kcal</span>
              </div>
              <div className="space-y-2">
                {foods.map((food, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <span className="text-sm text-white">{food.name}</span>
                      <span className="text-xs text-slate-500 ml-2">{food.grams}g</span>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-400 font-mono">
                      <span>{food.calories}kcal</span>
                      <span className="text-sky-400">{food.protein}p</span>
                      <span className="text-amber-400">{food.carbs}c</span>
                      <span className="text-violet-400">{food.fat}g</span>
                    </div>
                  </div>
                ))}
                {foods.length === 0 && (
                  <p className="text-xs text-slate-500 italic">Sin alimentos configurados</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {plan.notes && (
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-2">Notas del entrenador</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{plan.notes}</p>
        </div>
      )}
    </div>
  )
}
