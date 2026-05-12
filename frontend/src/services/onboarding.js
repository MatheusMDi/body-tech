import { supabase } from '../lib/supabase.js'

export function calculateProteinGoal(weightKg) {
  return Math.round(weightKg * 2)
}

export function suggestFastingWindow(protocol) {
  const defaults = {
    '16:8':  { start: '22:00', end: '14:00' },
    '18:6':  { start: '20:00', end: '14:00' },
    '20:4':  { start: '20:00', end: '16:00' },
  }
  return defaults[protocol] ?? { start: '20:00', end: '14:00' }
}

export async function getOnboardingProgress(userId) {
  if (!userId) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function saveOnboardingStep(userId, step, data) {
  if (!userId) return
  const mapped = mapOnboardingToProfile(data)
  await supabase
    .from('profiles')
    .upsert(
      { id: userId, onboarding_step: step, ...mapped },
      { onConflict: 'id' }
    )
}

export async function completeOnboarding(userId, allData) {
  if (!userId) return
  const mapped = mapOnboardingToProfile(allData)
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, ...mapped, onboarding_completed: true },
      { onConflict: 'id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

// Maps onboarding field names → profiles column names
function mapOnboardingToProfile(data) {
  const out = {}
  if (data.name                    != null) out.name                     = data.name
  if (data.weight_kg               != null) out.weight_goal              = data.weight_kg
  if (data.height_cm               != null) out.height_cm                = data.height_cm
  if (data.goal_weight_kg          != null) out.goal_weight_kg           = data.goal_weight_kg
  if (data.fasting_protocol        != null) out.fasting_protocol         = data.fasting_protocol
  if (data.fast_start_time         != null) out.fasting_start            = data.fast_start_time
  if (data.fast_end_time           != null) out.fasting_end              = data.fast_end_time
  if (data.water_goal_liters       != null) out.water_goal_ml            = Math.round(data.water_goal_liters * 1000)
  if (data.protein_goal_g          != null) out.protein_goal             = data.protein_goal_g
  if (data.trains                  != null) out.trains                   = data.trains
  if (data.training_modality       != null) out.training_modality        = data.training_modality
  if (data.training_time           != null) out.training_time            = data.training_time
  if (data.training_days_per_week  != null) out.training_days_per_week   = data.training_days_per_week
  if (data.active_supplements      != null) out.active_supplements       = data.active_supplements
  if (data.notifications_enabled   != null) out.notifications_enabled    = data.notifications_enabled
  if (data.notification_preferences!= null) out.notification_preferences = data.notification_preferences
  if (data.focus_goals             != null) out.focus_goals              = data.focus_goals
  return out
}
