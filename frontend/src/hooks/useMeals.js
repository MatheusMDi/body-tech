import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { todayDateString } from '../lib/utils.js'

export function useMeals(userId, date = todayDateString()) {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [totals, setTotals] = useState({ protein_g: 0, water_ml: 0 })

  const fetchMeals = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const startOfDay = `${date}T00:00:00`
    const endOfDay = `${date}T23:59:59`

    const { data, error } = await supabase
      .from('meals')
      .select('*, meal_flags(flag)')
      .eq('user_id', userId)
      .gte('logged_at', startOfDay)
      .lte('logged_at', endOfDay)
      .order('logged_at', { ascending: true })

    if (!error && data) {
      setMeals(data)
      const protein = data.reduce((s, m) => s + (m.protein_g || 0), 0)
      const water = data.reduce((s, m) => s + (m.water_ml || 0), 0)
      setTotals({ protein_g: protein, water_ml: water })
    }
    setLoading(false)
  }, [userId, date])

  useEffect(() => {
    fetchMeals()
  }, [fetchMeals])

  async function addMeal({ description, protein_g, water_ml, flags = [], is_outside_window = false }) {
    if (!userId) return { error: new Error('Not authenticated') }

    const { data: meal, error } = await supabase
      .from('meals')
      .insert({ user_id: userId, description, protein_g, water_ml, is_outside_window })
      .select()
      .single()

    if (error) return { error }

    if (flags.length > 0) {
      await supabase.from('meal_flags').insert(
        flags.map(flag => ({ meal_id: meal.id, flag }))
      )
    }

    await fetchMeals()
    return { data: meal, error: null }
  }

  async function addFlagToMeal(mealId, flag) {
    await supabase.from('meal_flags').insert({ meal_id: mealId, flag })
    await fetchMeals()
  }

  return { meals, loading, totals, addMeal, addFlagToMeal, refresh: fetchMeals }
}
