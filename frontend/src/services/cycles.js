import { supabase } from '../lib/supabase.js'
import { calculateNutritionPlan } from '../utils/nutrition.js'
import { CYCLE_TYPES, PREDEFINED_CYCLE_TEMPLATES } from '../constants/cyclePresets.js'

/**
 * Fetch the active cycle for a user (status = 'active').
 *
 * @param {string} userId
 * @returns {object|null}
 */
export async function getActiveCycle(userId) {
  const { data, error } = await supabase
    .from('protocol_cycles')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Fetch past cycles (non-active), newest first.
 *
 * @param {string} userId
 * @returns {object[]}
 */
export async function getCycleHistory(userId) {
  const { data, error } = await supabase
    .from('protocol_cycles')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'active')
    .order('started_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Start a new cycle. Automatically ends any currently active cycle first.
 *
 * @param {string} userId
 * @param {object} config - { type, name, durationWeeks?, calorieGoal?, proteinGoalG?,
 *                           carbGoalG?, fatGoalG?, weightGoalKg?, activeRules?, customGoals? }
 * @returns {object} the created cycle row
 */
export async function startCycle(userId, config) {
  // End any currently active cycle before starting a new one
  const active = await getActiveCycle(userId)
  if (active) {
    await supabase
      .from('protocol_cycles')
      .update({ status: 'cancelled', ended_at: new Date().toISOString() })
      .eq('id', active.id)
  }

  const cycleType = config.type || config.cycle_type || 'custom'
  const cycleLabel = CYCLE_TYPES[cycleType]?.label || config.name || 'Ciclo'

  const { data, error } = await supabase
    .from('protocol_cycles')
    .insert({
      user_id:        userId,
      status:         'active',
      started_at:     new Date().toISOString(),
      cycle_type:     cycleType,
      name:           config.name || cycleLabel,
      calorie_goal:   config.calorieGoal ?? config.calorie_goal ?? null,
      protein_goal_g: config.proteinGoalG ?? config.protein_goal_g ?? null,
      carb_goal_g:    config.carbGoalG ?? config.carb_goal_g ?? null,
      fat_goal_g:     config.fatGoalG ?? config.fat_goal_g ?? null,
      duration_weeks: config.durationWeeks ?? config.duration_weeks ?? null,
      weight_goal_kg: config.weightGoalKg ?? config.weight_goal_kg ?? null,
      active_rules:   config.activeRules ?? config.active_rules ?? [],
      custom_goals:   config.customGoals ?? config.custom_goals ?? {},
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * End a cycle by setting status to 'completed' and generating a report.
 *
 * @param {string} cycleId
 * @param {string} userId
 * @returns {object} updated cycle row
 */
export async function endCycle(cycleId, userId) {
  const report = await generateCycleReport(cycleId, userId)

  const { data, error } = await supabase
    .from('protocol_cycles')
    .update({
      status:   'completed',
      ended_at: new Date().toISOString(),
      report,
    })
    .eq('id', cycleId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Cancel a cycle without generating a report.
 *
 * @param {string} cycleId
 * @returns {object} updated cycle row
 */
export async function cancelCycle(cycleId) {
  const { data, error } = await supabase
    .from('protocol_cycles')
    .update({
      status:   'cancelled',
      ended_at: new Date().toISOString(),
    })
    .eq('id', cycleId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Generate a summary report for a completed cycle.
 * Reads daily_records, workout_sessions, and weight entries.
 *
 * @param {string} cycleId
 * @param {string} userId
 * @returns {object} report object
 */
export async function generateCycleReport(cycleId, userId) {
  // Fetch the cycle to know the date range
  const { data: cycle, error: cycleError } = await supabase
    .from('protocol_cycles')
    .select('*')
    .eq('id', cycleId)
    .single()

  if (cycleError || !cycle) return { error: 'Cycle not found', generated_at: new Date().toISOString() }

  const startDate = cycle.started_at
  const endDate = cycle.ended_at || new Date().toISOString()

  // Fetch workout sessions in range
  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('id, session_date, duration_minutes, rpe')
    .eq('user_id', userId)
    .gte('session_date', startDate.slice(0, 10))
    .lte('session_date', endDate.slice(0, 10))

  // Fetch daily records (water, calories, protein) in range
  const { data: dailyRecords } = await supabase
    .from('daily_records')
    .select('date, water_ml, calories_kcal, protein_g, sleep_hours, weight_kg')
    .eq('user_id', userId)
    .gte('date', startDate.slice(0, 10))
    .lte('date', endDate.slice(0, 10))

  const totalWorkouts = sessions?.length ?? 0
  const avgRpe =
    sessions && sessions.length > 0
      ? Math.round((sessions.reduce((sum, s) => sum + (s.rpe || 0), 0) / sessions.length) * 10) / 10
      : null

  const daysWithData = dailyRecords?.length ?? 0
  const avgCalories =
    daysWithData > 0
      ? Math.round(dailyRecords.reduce((sum, r) => sum + (r.calories_kcal || 0), 0) / daysWithData)
      : null
  const avgProtein =
    daysWithData > 0
      ? Math.round(dailyRecords.reduce((sum, r) => sum + (r.protein_g || 0), 0) / daysWithData)
      : null
  const avgWater =
    daysWithData > 0
      ? Math.round(dailyRecords.reduce((sum, r) => sum + (r.water_ml || 0), 0) / daysWithData)
      : null
  const avgSleep =
    daysWithData > 0
      ? Math.round((dailyRecords.reduce((sum, r) => sum + (r.sleep_hours || 0), 0) / daysWithData) * 10) / 10
      : null

  const weightEntries = dailyRecords?.filter((r) => r.weight_kg) ?? []
  const startWeight = weightEntries[0]?.weight_kg ?? null
  const endWeight = weightEntries[weightEntries.length - 1]?.weight_kg ?? null
  const weightDelta = startWeight && endWeight ? Math.round((endWeight - startWeight) * 10) / 10 : null

  const durationDays = Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
  )

  return {
    generated_at: new Date().toISOString(),
    duration_days: durationDays,
    total_workouts: totalWorkouts,
    avg_rpe: avgRpe,
    avg_calories_kcal: avgCalories,
    avg_protein_g: avgProtein,
    avg_water_ml: avgWater,
    avg_sleep_hours: avgSleep,
    start_weight_kg: startWeight,
    end_weight_kg: endWeight,
    weight_delta_kg: weightDelta,
  }
}

/**
 * Save a cycle config as a reusable template.
 *
 * @param {string} userId
 * @param {object} config - same shape as startCycle config
 * @returns {object} saved template row
 */
export async function saveTemplate(userId, config) {
  const { data, error } = await supabase
    .from('cycle_templates')
    .insert({
      user_id:        userId,
      name:           config.name,
      cycle_type:     config.type || config.cycle_type || 'custom',
      duration_weeks: config.durationWeeks ?? config.duration_weeks ?? null,
      calorie_goal:   config.calorieGoal ?? config.calorie_goal ?? null,
      protein_goal_g: config.proteinGoalG ?? config.protein_goal_g ?? null,
      carb_goal_g:    config.carbGoalG ?? config.carb_goal_g ?? null,
      fat_goal_g:     config.fatGoalG ?? config.fat_goal_g ?? null,
      custom_goals:   config.customGoals ?? config.custom_goals ?? {},
      active_rules:   config.activeRules ?? config.active_rules ?? [],
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get all templates available to the user:
 * user-saved templates from DB + predefined templates from constants.
 *
 * @param {string} userId
 * @returns {object[]} combined list, user templates first
 */
export async function getTemplates(userId) {
  const { data, error } = await supabase
    .from('cycle_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const userTemplates = (data ?? []).map((t) => ({ ...t, is_predefined: false }))
  const predefined = PREDEFINED_CYCLE_TEMPLATES.map((t) => ({ ...t, is_predefined: true }))

  return [...userTemplates, ...predefined]
}

/**
 * Thin wrapper around calculateNutritionPlan for use inside cycle screens.
 *
 * @param {object} profile  - profiles table row
 * @param {string} cycleType
 * @returns {{ bmr, tdee, targetCalories, macros }}
 */
export function calculateCaloriesForProfile(profile, cycleType) {
  return calculateNutritionPlan(profile, cycleType)
}
