import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { parseTimeToHour } from '../lib/utils.js'

const DEFAULTS = {
  fastStartHour: 20,
  fastEndHour: 14,
  fastStartTime: '20:00',
  fastEndTime: '14:00',
  waterGoalMl: 4000,
  waterGoalL: 4.0,
  proteinGoalG: 160,
  trains: false,
  trainingTime: '18:00',
  trainingModality: null,
  trainingDaysPerWeek: 4,
  activeSupplements: [],
  notificationsEnabled: true,
  notificationPreferences: {},
  onboardingCompleted: false,
  theme: 'dark',
}

export function useUserSettings(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  // Re-fetch when window regains focus
  useEffect(() => {
    function onFocus() { fetch() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetch])

  const settings = deriveSettings(profile)

  async function updateSetting(fields) {
    if (!userId) return
    const { data } = await supabase
      .from('profiles')
      .update(fields)
      .eq('id', userId)
      .select()
      .single()
    if (data) setProfile(data)
    return data
  }

  return { settings, profile, loading, updateSetting, refresh: fetch }
}

function deriveSettings(profile) {
  if (!profile) return DEFAULTS

  const fastStartHour = parseTimeToHour(profile.fasting_start) ?? DEFAULTS.fastStartHour
  const fastEndHour   = parseTimeToHour(profile.fasting_end)   ?? DEFAULTS.fastEndHour

  const weightKg = profile.weight_goal ?? profile.height_cm
    ? (profile.weight_goal ?? 80)
    : 80

  const proteinGoalG = profile.protein_goal
    ?? Math.round(weightKg * 2)

  return {
    fastStartHour,
    fastEndHour,
    fastStartTime: profile.fasting_start ?? DEFAULTS.fastStartTime,
    fastEndTime:   profile.fasting_end   ?? DEFAULTS.fastEndTime,
    waterGoalMl:   profile.water_goal_ml ?? DEFAULTS.waterGoalMl,
    waterGoalL:    (profile.water_goal_ml ?? DEFAULTS.waterGoalMl) / 1000,
    proteinGoalG,
    trains:                  profile.trains                   ?? DEFAULTS.trains,
    trainingTime:            profile.training_time            ?? DEFAULTS.trainingTime,
    trainingModality:        profile.training_modality        ?? DEFAULTS.trainingModality,
    trainingDaysPerWeek:     profile.training_days_per_week   ?? DEFAULTS.trainingDaysPerWeek,
    activeSupplements:       profile.active_supplements       ?? DEFAULTS.activeSupplements,
    notificationsEnabled:    profile.notifications_enabled    ?? DEFAULTS.notificationsEnabled,
    notificationPreferences: profile.notification_preferences ?? DEFAULTS.notificationPreferences,
    onboardingCompleted:     profile.onboarding_completed     ?? DEFAULTS.onboardingCompleted,
    theme:                   profile.theme                    ?? DEFAULTS.theme,
    name:                    profile.name,
    heightCm:                profile.height_cm,
    weightGoalKg:            profile.weight_goal,
    goalWeightKg:            profile.goal_weight_kg,
  }
}
