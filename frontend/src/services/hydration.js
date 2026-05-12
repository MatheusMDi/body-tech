import { supabase } from '../lib/supabase.js'
import { todayDateString } from '../lib/utils.js'

// ─── Hydration Messages Per Urgency ──────────────────────────────────────────

const HYDRATION_MESSAGES = {
  green: [
    'Ótimo trabalho! Continue assim.',
    'Hidratação em dia. Seu corpo agradece!',
    'Você está arrasando na hidratação hoje.',
    'Meta atingida! Mantenha o ritmo.',
    'Excelente! Você está bem hidratado.',
  ],
  yellow: [
    'Que tal um copo de água agora?',
    'Você está quase lá — mais um pouco!',
    'Lembrete gentil: hora de hidratar.',
    'Um copo de água agora faz toda a diferença.',
    'Mantenha o ritmo — você está no caminho certo.',
  ],
  orange: [
    'Atenção: você está abaixo da meta de hidratação.',
    'Seu corpo precisa de água — beba agora!',
    'Hidratação baixa pode afetar seu desempenho.',
    'Pause e tome um copo d\'água agora.',
    'Não esqueça da água — seu corpo depende dela.',
  ],
  red: [
    'Alerta! Você está muito desidratado hoje.',
    'Beba água imediatamente — sua saúde importa.',
    'Hidratação crítica — priorize isso agora.',
    'Seu corpo está com sede — atenda esse sinal!',
    'Pare o que está fazendo e beba água agora.',
  ],
}

// Track the last message shown per urgency to avoid repetition
const _lastMessageIndex = { green: -1, yellow: -1, orange: -1, red: -1 }

// ─── Exported Functions ───────────────────────────────────────────────────────

/**
 * Analyze the last N days of water intake patterns for a user.
 *
 * @param {string} userId
 * @param {number} days  - how many days of history to analyze (default 7)
 * @returns {{ dates: string[], waterMl: number[], avgMl: number, daysLogged: number }}
 */
export async function getHydrationPattern(userId, days = 7) {
  const endDate = todayDateString()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - (days - 1))
  const startDateStr = startDate.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('daily_records')
    .select('date, water_ml')
    .eq('user_id', userId)
    .gte('date', startDateStr)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) throw error

  const records = data ?? []
  const daysLogged = records.filter((r) => r.water_ml > 0).length
  const totalMl = records.reduce((sum, r) => sum + (r.water_ml || 0), 0)
  const avgMl = daysLogged > 0 ? Math.round(totalMl / daysLogged) : 0

  return {
    dates: records.map((r) => r.date),
    waterMl: records.map((r) => r.water_ml || 0),
    avgMl,
    daysLogged,
  }
}

/**
 * Calculate hydration urgency level based on today's intake vs goal.
 *
 * Thresholds (percentage of daily goal consumed so far, adjusted for time of day):
 *  - green:  >= 80% of expected intake at this hour
 *  - yellow: >= 50%
 *  - orange: >= 25%
 *  - red:    < 25%
 *
 * @param {string} userId
 * @param {number} waterGoalMl
 * @returns {'green'|'yellow'|'orange'|'red'}
 */
export async function calculateHydrationUrgency(userId, waterGoalMl) {
  const today = todayDateString()

  const { data, error } = await supabase
    .from('daily_records')
    .select('water_ml')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()

  if (error) return 'yellow'

  const consumed = data?.water_ml || 0
  const goal = waterGoalMl || 2000

  // Calculate how much of the goal should ideally be consumed by this hour
  // Assumes drinking is spread across waking hours (6:00–22:00 = 16h window)
  const now = new Date()
  const currentHour = now.getHours()
  const wakingStart = 6
  const wakingEnd = 22
  const totalWakingHours = wakingEnd - wakingStart
  const elapsedWakingHours = Math.max(0, Math.min(currentHour - wakingStart, totalWakingHours))
  const expectedFraction = elapsedWakingHours / totalWakingHours
  const expectedMl = goal * expectedFraction

  // If it's very early, use a simpler absolute threshold
  if (expectedMl < 200) {
    const pct = consumed / goal
    if (pct >= 0.5) return 'green'
    if (pct >= 0.25) return 'yellow'
    return 'orange'
  }

  const ratio = expectedMl > 0 ? consumed / expectedMl : consumed / goal

  if (ratio >= 0.8) return 'green'
  if (ratio >= 0.5) return 'yellow'
  if (ratio >= 0.25) return 'orange'
  return 'red'
}

/**
 * Get an adaptive hydration message for the given urgency level.
 * Cycles through messages without repeating the last one shown.
 *
 * @param {'green'|'yellow'|'orange'|'red'} urgency
 * @param {number} remaining_ml  - remaining ml to reach goal
 * @returns {string}
 */
export function getHydrationMessage(urgency, remaining_ml) {
  const level = urgency in HYDRATION_MESSAGES ? urgency : 'yellow'
  const messages = HYDRATION_MESSAGES[level]
  const lastIdx = _lastMessageIndex[level]

  // Pick a random index that is different from the last one shown
  let idx
  if (messages.length === 1) {
    idx = 0
  } else {
    do {
      idx = Math.floor(Math.random() * messages.length)
    } while (idx === lastIdx)
  }

  _lastMessageIndex[level] = idx
  let message = messages[idx]

  // Append remaining amount for actionable urgency levels
  if ((level === 'yellow' || level === 'orange' || level === 'red') && remaining_ml > 0) {
    const remainingL = remaining_ml >= 1000
      ? `${(remaining_ml / 1000).toFixed(1)}L`
      : `${Math.round(remaining_ml)}ml`
    message += ` Faltam ${remainingL}.`
  }

  return message
}

/**
 * Check whether today is a training day for the user
 * (i.e., they have at least one workout_session with today's date).
 *
 * @param {string} userId
 * @returns {boolean}
 */
export async function isTodayTrainingDay(userId) {
  const today = todayDateString()

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('session_date', today)
    .limit(1)

  if (error) return false
  return (data?.length ?? 0) > 0
}

/**
 * Get the adjusted water goal for today.
 * Adds 500ml on training days.
 *
 * @param {string} userId
 * @param {number} baseGoalMl
 * @returns {number} adjusted goal in ml
 */
export async function getAdjustedWaterGoal(userId, baseGoalMl) {
  const isTraining = await isTodayTrainingDay(userId)
  return isTraining ? baseGoalMl + 500 : baseGoalMl
}
