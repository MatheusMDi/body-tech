import { useState, useEffect } from 'react'
import { useMeals } from '../../../hooks/useMeals.js'
import { supabase } from '../../../lib/supabase.js'
import { todayDateString, pct } from '../../../lib/utils.js'

export default function CardCalories({ userId, layout }) {
  const { totals, meals, loading: mealsLoading } = useMeals(userId, todayDateString())
  const [calorieGoal, setCalorieGoal] = useState(null)
  const [cycleLoading, setCycleLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setCycleLoading(false); return }
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('protocol_cycles')
        .select('calorie_goal')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (!cancelled) {
        setCalorieGoal(data?.calorie_goal ?? null)
        setCycleLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [userId])

  const loading = mealsLoading || cycleLoading

  if (loading) {
    return (
      <div className="card p-3 animate-pulse" style={{ minHeight: 96 }}>
        <div className="h-3 w-16 rounded" style={{ background: 'var(--theme-border)' }} />
      </div>
    )
  }

  // Calculate kcal from macros: protein*4 + carb*4 + fat*9
  const consumedKcal = Math.round(
    meals.reduce((sum, m) => {
      return sum + (m.protein_g || 0) * 4 + (m.carb_g || 0) * 4 + (m.fat_g || 0) * 9
    }, 0)
  )

  const progressPct = calorieGoal ? pct(consumedKcal, calorieGoal) : 0

  return (
    <div className="card p-3 flex flex-col gap-1.5 min-h-[96px]">
      <div className="flex items-center gap-1.5">
        <span className="text-lg">🔥</span>
        <span
          className="text-[11px] font-bold uppercase tracking-wide"
          style={{ color: 'var(--theme-text-faint)' }}
        >
          Calorias
        </span>
      </div>
      <div className="text-[22px] font-bold" style={{ color: 'var(--theme-text)' }}>
        {consumedKcal.toLocaleString('pt-BR')}
        {calorieGoal && (
          <span className="text-[13px] font-normal ml-0.5" style={{ color: 'var(--theme-text-muted)' }}>
            /{calorieGoal.toLocaleString('pt-BR')}
          </span>
        )}
        <span className="text-[11px] font-normal ml-0.5" style={{ color: 'var(--theme-text-faint)' }}>
          kcal
        </span>
      </div>
      {calorieGoal && (
        <>
          <div className="h-1 rounded-full" style={{ backgroundColor: 'var(--theme-border)' }}>
            <div
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(progressPct, 100)}%`,
                backgroundColor: progressPct > 110 ? '#ef4444' : '#76b900',
              }}
            />
          </div>
          <div className="text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
            {progressPct}% da meta
          </div>
        </>
      )}
      {!calorieGoal && (
        <div className="text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>
          Sem ciclo ativo
        </div>
      )}
    </div>
  )
}
