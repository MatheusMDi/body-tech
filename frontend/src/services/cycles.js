import { supabase } from '../lib/supabase.js'

/**
 * Fetch the active cycle for a user (status = 'active').
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
 * Start a new cycle.
 * config: { cycle_type, name, calorie_goal, protein_goal_g, carb_goal_g, fat_goal_g,
 *           duration_weeks, weight_goal_kg, active_rule_ids, custom_goals }
 */
export async function startCycle(userId, config) {
  const { data, error } = await supabase
    .from('protocol_cycles')
    .insert({
      user_id:        userId,
      status:         'active',
      started_at:     new Date().toISOString(),
      cycle_type:     config.cycle_type,
      name:           config.name,
      calorie_goal:   config.calorie_goal,
      protein_goal_g: config.protein_goal_g,
      carb_goal_g:    config.carb_goal_g,
      fat_goal_g:     config.fat_goal_g,
      duration_weeks: config.duration_weeks ?? null,
      weight_goal_kg: config.weight_goal_kg ?? null,
      active_rule_ids:config.active_rule_ids ?? [],
      custom_goals:   config.custom_goals ?? {},
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * End an active cycle and attach a report.
 */
export async function endCycle(cycleId, report = {}) {
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
 * Cancel an active cycle without a report.
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
 * Calculate daily calories for a profile + cycle combination.
 * Convenience wrapper — components can also call calculateNutritionPlan directly.
 */
export function calculateCaloriesForProfile(profile, cycleType) {
  const { calculateNutritionPlan } = require('../utils/nutrition.js')
  return calculateNutritionPlan({ profile, cycleType })
}

/**
 * Fetch cycle templates saved by the user.
 */
export async function getTemplates(userId) {
  const { data, error } = await supabase
    .from('cycle_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Save a cycle config as a reusable template.
 */
export async function saveTemplate(userId, template) {
  const { data, error } = await supabase
    .from('cycle_templates')
    .insert({
      user_id:        userId,
      name:           template.name,
      cycle_type:     template.cycle_type,
      duration_weeks: template.duration_weeks ?? null,
      calorie_goal:   template.calorie_goal ?? null,
      protein_goal_g: template.protein_goal_g ?? null,
      carb_goal_g:    template.carb_goal_g ?? null,
      fat_goal_g:     template.fat_goal_g ?? null,
      custom_goals:   template.custom_goals ?? {},
      active_rule_ids:template.active_rule_ids ?? [],
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a user template.
 */
export async function deleteTemplate(templateId, userId) {
  const { error } = await supabase
    .from('cycle_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', userId)

  if (error) throw error
}
