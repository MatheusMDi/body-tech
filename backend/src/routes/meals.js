import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

router.get('/', async (req, res) => {
  const userId = req.user?.id
  const { date } = req.query

  const query = supabase
    .from('meals')
    .select('*, meal_flags(flag)')
    .eq('user_id', userId)
    .order('logged_at', { ascending: true })

  if (date) {
    query.gte('logged_at', `${date}T00:00:00`)
    query.lte('logged_at', `${date}T23:59:59`)
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.post('/', async (req, res) => {
  const userId = req.user?.id
  const { description, protein_g, water_ml, flags = [], is_outside_window = false } = req.body

  const { data: meal, error } = await supabase
    .from('meals')
    .insert({ user_id: userId, description, protein_g, water_ml, is_outside_window })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  if (flags.length > 0) {
    await supabase.from('meal_flags').insert(
      flags.map(flag => ({ meal_id: meal.id, flag }))
    )
  }

  // Update daily record totals
  const today = new Date().toISOString().split('T')[0]
  await updateDailyTotals(userId, today)

  res.json(meal)
})

async function updateDailyTotals(userId, date) {
  const { data: meals } = await supabase
    .from('meals')
    .select('protein_g, water_ml, meal_flags(flag)')
    .eq('user_id', userId)
    .gte('logged_at', `${date}T00:00:00`)
    .lte('logged_at', `${date}T23:59:59`)

  if (!meals) return

  const totalProtein = meals.reduce((s, m) => s + (m.protein_g || 0), 0)
  const totalWater = meals.reduce((s, m) => s + (m.water_ml || 0), 0)
  const allFlags = meals.flatMap(m => m.meal_flags?.map(f => f.flag) ?? [])
  const uniqueFlags = [...new Set(allFlags)]

  await supabase.from('daily_records').upsert({
    user_id: userId,
    date,
    total_protein_g: totalProtein,
    total_water_ml: totalWater,
    flags: uniqueFlags,
    proteina_batida: totalProtein >= 160,
    agua_batida: totalWater >= 4000,
  }, { onConflict: 'user_id,date' })
}

export default router
