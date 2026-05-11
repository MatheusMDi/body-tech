import { supabase } from '../config/supabase.js'
import { PROTOCOL } from '../config/constants.js'
import { sendPushToAll } from './pushService.js'

export async function checkFastingCompletion() {
  const today = new Date().toISOString().split('T')[0]
  const windowOpen = `${today}T${String(PROTOCOL.FASTING_END_HOUR).padStart(2, '0')}:00:00`
  const dayStart = `${today}T00:00:00`

  // Check all users who have no meals between midnight and 14:00 (i.e., kept the fast)
  const { data: users } = await supabase.from('profiles').select('id')
  if (!users) return

  for (const { id: userId } of users) {
    const { count } = await supabase
      .from('meals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('logged_at', dayStart)
      .lte('logged_at', windowOpen)

    if (count === 0) {
      await supabase.from('daily_records').upsert(
        { user_id: userId, date: today, fast_complete: true, fast_hours: PROTOCOL.FASTING_DURATION_HOURS },
        { onConflict: 'user_id,date' }
      )
    }
  }
}

export async function checkWaterAlert() {
  const today = new Date().toISOString().split('T')[0]
  const dayStart = `${today}T00:00:00`
  const now = new Date().toISOString()

  const { data: users } = await supabase.from('profiles').select('id')
  if (!users) return

  for (const { id: userId } of users) {
    const { data: meals } = await supabase
      .from('meals')
      .select('water_ml')
      .eq('user_id', userId)
      .gte('logged_at', dayStart)
      .lte('logged_at', now)

    const totalWater = (meals || []).reduce((s, m) => s + (m.water_ml || 0), 0)
    if (totalWater < PROTOCOL.WATER_GOAL_ML / 2) {
      await sendPushToAll(
        'Body Tech — Água',
        `⚠️ Você tomou apenas ${(totalWater / 1000).toFixed(1)}L hoje. Meta: ${PROTOCOL.WATER_GOAL_ML / 1000}L`
      )
    }
  }
}

export async function checkProteinAlert() {
  const today = new Date().toISOString().split('T')[0]
  const dayStart = `${today}T00:00:00`
  const now = new Date().toISOString()

  const { data: users } = await supabase.from('profiles').select('id')
  if (!users) return

  for (const { id: userId } of users) {
    const { data: meals } = await supabase
      .from('meals')
      .select('protein_g')
      .eq('user_id', userId)
      .gte('logged_at', dayStart)
      .lte('logged_at', now)

    const totalProtein = (meals || []).reduce((s, m) => s + (m.protein_g || 0), 0)
    if (totalProtein < PROTOCOL.PROTEIN_GOAL_G / 2) {
      await sendPushToAll(
        'Body Tech — Proteína',
        `⚠️ Você consumiu ${Math.round(totalProtein)}g de proteína. Meta: ${PROTOCOL.PROTEIN_GOAL_G}g`
      )
    }
  }
}

export async function flagMissingSupplements() {
  const today = new Date().toISOString().split('T')[0]

  const { data: users } = await supabase.from('profiles').select('id')
  if (!users) return

  for (const { id: userId } of users) {
    const { data: creatinaMeals } = await supabase
      .from('meal_flags')
      .select('id')
      .eq('flag', 'CREATINA')
      .gte('created_at', `${today}T00:00:00`)

    if (!creatinaMeals?.length) {
      await supabase.from('daily_records').upsert(
        { user_id: userId, date: today },
        { onConflict: 'user_id,date' }
      )
      // Add to flags array via RPC or direct update
      const { data: rec } = await supabase
        .from('daily_records')
        .select('flags')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      const existingFlags = rec?.flags ?? []
      if (!existingFlags.includes('CREATINA_ESQUECIDA')) {
        await supabase.from('daily_records').update({
          flags: [...existingFlags, 'CREATINA_ESQUECIDA']
        }).eq('user_id', userId).eq('date', today)
      }
    }
  }
}
