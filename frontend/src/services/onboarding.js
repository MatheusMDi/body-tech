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
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
}

export async function saveOnboardingStep(userId, step, data) {
  if (!userId) return
  await supabase
    .from('user_settings')
    .upsert(
      { user_id: userId, onboarding_step: step, ...data },
      { onConflict: 'user_id' }
    )
}

export async function completeOnboarding(userId, allData) {
  if (!userId) return
  const { data, error } = await supabase
    .from('user_settings')
    .upsert(
      { user_id: userId, ...allData, onboarding_completed: true },
      { onConflict: 'user_id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}
