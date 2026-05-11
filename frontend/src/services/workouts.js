import { supabase } from '../lib/supabase.js'
import { todayDateString } from '../lib/utils.js'

/**
 * Save a completed workout session to the database.
 */
export async function saveWorkoutSession({
  userId,
  format,
  name,
  exercises,
  result,
  rpe,
  notes,
  durationMinutes,
}) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userId,
      format,
      name: name || null,
      exercises: exercises ?? [],
      result: result ?? null,
      rpe: rpe ?? null,
      notes: notes ?? null,
      duration_minutes: durationMinutes ?? null,
      session_date: todayDateString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Check if a given exercise value is a new PR for the user.
 * Returns the existing best record (or null if none) and whether this is a PR.
 */
export async function checkForPR({ userId, exerciseName, value, unit }) {
  if (!value || isNaN(parseFloat(value))) return { isPR: false, previous: null }

  const numericValue = parseFloat(value)

  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_name', exerciseName)
    .order('value', { ascending: false })
    .limit(1)

  if (error) return { isPR: false, previous: null }

  const best = data?.[0] ?? null
  if (!best) return { isPR: true, previous: null }

  const isPR = numericValue > parseFloat(best.value)
  return { isPR, previous: best }
}

/**
 * Save a personal record to the database.
 */
export async function savePR({
  userId,
  exerciseName,
  value,
  unit,
  category,
  workoutSessionId,
}) {
  const { data, error } = await supabase
    .from('personal_records')
    .insert({
      user_id: userId,
      exercise_name: exerciseName,
      value: parseFloat(value),
      unit: unit ?? 'kg',
      category: category ?? null,
      workout_session_id: workoutSessionId ?? null,
      achieved_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Save a workout as a reusable template.
 */
export async function saveWorkoutTemplate({ userId, name, format, exercises, description }) {
  const { data, error } = await supabase
    .from('workout_templates')
    .insert({
      user_id: userId,
      name,
      format,
      exercises: exercises ?? [],
      description: description ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
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
