import { supabase } from '../lib/supabase.js'
import { todayDateString } from '../lib/utils.js'
import { PREDEFINED_WORKOUT_TEMPLATES } from '../constants/cyclePresets.js'

/**
 * Save a completed workout session to the database.
 *
 * @param {object} data - { userId, format, name, exercises, result, rpe, notes, durationMinutes, cycleId? }
 * @returns {object} saved session row
 */
export async function saveWorkoutSession(data) {
  const {
    userId,
    format,
    name,
    exercises,
    result,
    rpe,
    notes,
    durationMinutes,
    cycleId,
  } = data

  const { data: row, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id:          userId,
      format:           format || null,
      name:             name || null,
      exercises:        exercises ?? [],
      result:           result ?? null,
      rpe:              rpe ?? null,
      notes:            notes ?? null,
      duration_minutes: durationMinutes ?? null,
      cycle_id:         cycleId ?? null,
      session_date:     todayDateString(),
    })
    .select()
    .single()

  if (error) throw error
  return row
}

/**
 * Get recent workout sessions for a user.
 *
 * @param {string} userId
 * @param {number} limit
 * @returns {object[]}
 */
export async function getWorkoutHistory(userId, limit = 30) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('session_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

/**
 * Get the workout session for today, if any.
 *
 * @param {string} userId
 * @returns {object|null}
 */
export async function getTodayWorkout(userId) {
  const today = todayDateString()

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('session_date', today)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Check if a given value would be a new PR for the user.
 *
 * @param {string} userId
 * @param {string} exerciseName
 * @param {string} recordType  - e.g. '1rm', 'max_reps', 'best_time'
 * @param {number} value
 * @returns {{ isPR: boolean, previousBest: object|null, improvement: number|null }}
 */
export async function checkForPR(userId, exerciseName, recordType, value) {
  const numericValue = parseFloat(value)
  if (isNaN(numericValue)) return { isPR: false, previousBest: null, improvement: null }

  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_name', exerciseName)
    .eq('record_type', recordType || '1rm')
    .order('value', { ascending: false })
    .limit(1)

  if (error) return { isPR: false, previousBest: null, improvement: null }

  const previousBest = data?.[0] ?? null
  if (!previousBest) return { isPR: true, previousBest: null, improvement: null }

  const prevValue = parseFloat(previousBest.value)
  const isPR = numericValue > prevValue
  const improvement = isPR ? Math.round((numericValue - prevValue) * 100) / 100 : null

  return { isPR, previousBest, improvement }
}

/**
 * Save a personal record.
 *
 * @param {string} userId
 * @param {string} exerciseName
 * @param {string} recordType
 * @param {number} value
 * @param {string} unit
 * @param {string|null} sessionId
 * @returns {object} saved PR row
 */
export async function savePR(userId, exerciseName, recordType, value, unit, sessionId) {
  const { data, error } = await supabase
    .from('personal_records')
    .insert({
      user_id:            userId,
      exercise_name:      exerciseName,
      record_type:        recordType || '1rm',
      value:              parseFloat(value),
      unit:               unit ?? 'kg',
      workout_session_id: sessionId ?? null,
      achieved_at:        new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get PR history for a specific exercise.
 *
 * @param {string} userId
 * @param {string} exerciseName
 * @returns {object[]}
 */
export async function getPRHistory(userId, exerciseName) {
  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_name', exerciseName)
    .order('achieved_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Get all PRs for a user, grouped by exercise (returns the best per exercise).
 *
 * @param {string} userId
 * @returns {object[]}
 */
export async function getAllPRs(userId) {
  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false })

  if (error) throw error
  if (!data) return []

  // Keep only the best (highest value) per exercise + record_type combination
  const bestMap = new Map()
  for (const pr of data) {
    const key = `${pr.exercise_name}__${pr.record_type}`
    const existing = bestMap.get(key)
    if (!existing || parseFloat(pr.value) > parseFloat(existing.value)) {
      bestMap.set(key, pr)
    }
  }

  return Array.from(bestMap.values())
}

/**
 * Save a workout layout as a reusable template.
 *
 * @param {string} userId
 * @param {string} name
 * @param {string} format
 * @param {object} structure
 * @returns {object} saved template row
 */
export async function saveWorkoutTemplate(userId, name, format, structure) {
  const { data, error } = await supabase
    .from('workout_templates')
    .insert({
      user_id:   userId,
      name,
      format,
      structure: structure ?? {},
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get all workout templates for a user: user-saved + predefined.
 *
 * @param {string} userId
 * @returns {object[]} user templates first, then predefined
 */
export async function getWorkoutTemplates(userId) {
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const userTemplates = (data ?? []).map((t) => ({ ...t, is_predefined: false }))
  const predefined = PREDEFINED_WORKOUT_TEMPLATES.map((t) => ({ ...t, is_predefined: true }))

  return [...userTemplates, ...predefined]
}

/**
 * Calculate the current workout streak (consecutive calendar days with a session).
 *
 * @param {string} userId
 * @returns {number} streak length in days
 */
export async function getWorkoutStreak(userId) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('session_date')
    .eq('user_id', userId)
    .order('session_date', { ascending: false })
    .limit(90) // enough to find any reasonable streak

  if (error) throw error
  if (!data || data.length === 0) return 0

  // Deduplicate dates
  const uniqueDates = [...new Set(data.map((r) => r.session_date))].sort().reverse()

  const today = todayDateString()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  // Streak must include today or yesterday to be considered active
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterdayStr) return 0

  let streak = 0
  let expected = uniqueDates[0]

  for (const date of uniqueDates) {
    if (date === expected) {
      streak++
      const prev = new Date(expected)
      prev.setDate(prev.getDate() - 1)
      expected = prev.toISOString().slice(0, 10)
    } else {
      break
    }
  }

  return streak
}

/**
 * Extract the best weight value from an exercise's sets array.
 * Returns { value, unit } or null if no weight data found.
 */
export function extractBestWeightFromSets(sets) {
  if (!sets || sets.length === 0) return null
  let best = null
  for (const set of sets) {
    const w = parseFloat(set.weight)
    if (!isNaN(w) && w > 0) {
      if (best === null || w > best) best = w
    }
  }
  return best !== null ? { value: best, unit: 'kg' } : null
}
