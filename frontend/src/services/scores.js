import { supabase } from '../lib/supabase.js'

const BASE_SCORE = 100
const FLAG_PENALTY = 5

export async function getDailyScore(userId, date) {
  if (!userId) return null
  const { data } = await supabase
    .from('daily_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('score_date', date)
    .single()
  return data
}

export async function getScoreHistory(userId, days = 30) {
  if (!userId) return []
  const since = new Date()
  since.setDate(since.getDate() - days)
  const { data } = await supabase
    .from('daily_scores')
    .select('score_date, final_score')
    .eq('user_id', userId)
    .gte('score_date', since.toISOString().split('T')[0])
    .order('score_date', { ascending: true })
  return data ?? []
}

export async function getScoreStats(userId) {
  const history = await getScoreHistory(userId, 90)
  if (history.length === 0) return { avg: 0, best: 0, streak: 0 }

  const scores = history.map(h => h.final_score)
  const avg  = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  const best = Math.max(...scores)

  // Count current streak of days with score >= 100
  let streak = 0
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].final_score >= 100) streak++
    else break
  }

  return { avg, best, streak }
}

export async function recalculateDailyScore(userId, date) {
  if (!userId) return null

  // Get all active rules and their daily status
  const [rulesRes, dailyRulesRes, recordRes] = await Promise.all([
    supabase.from('user_rules').select('*').eq('user_id', userId).eq('is_active', true),
    supabase.from('daily_rules').select('*').eq('user_id', userId).eq('rule_date', date),
    supabase.from('daily_records').select('flags').eq('user_id', userId).eq('date', date).single(),
  ])

  const rules      = rulesRes.data ?? []
  const dailyRules = dailyRulesRes.data ?? []
  const flags      = recordRes.data?.flags ?? []

  const dailyRuleMap = Object.fromEntries(dailyRules.map(dr => [dr.rule_id, dr]))

  let bonusPoints   = 0
  let penaltyPoints = 0
  const breakdown   = {}

  for (const rule of rules) {
    const entry = dailyRuleMap[rule.id]
    if (!entry) continue

    if (entry.status === 'completed') {
      bonusPoints += rule.points_on_success
      breakdown[rule.name] = `+${rule.points_on_success}`
    } else if (entry.status === 'failed') {
      penaltyPoints += rule.points_on_failure
      breakdown[rule.name] = `-${rule.points_on_failure}`
    }
  }

  // Penalty for negative flags
  const negativeFlags = flags.filter(f => ['ALCOOL', 'ACUCAR', 'ULTRAPROCESSADO', 'FORA_DA_JANELA'].includes(f))
  for (const flag of negativeFlags) {
    penaltyPoints += FLAG_PENALTY
    breakdown[flag] = `-${FLAG_PENALTY}`
  }

  const finalScore = BASE_SCORE + bonusPoints - penaltyPoints

  const { data, error } = await supabase
    .from('daily_scores')
    .upsert(
      {
        user_id: userId,
        score_date: date,
        base_score: BASE_SCORE,
        bonus_points: bonusPoints,
        penalty_points: penaltyPoints,
        final_score: finalScore,
        breakdown,
      },
      { onConflict: 'user_id,score_date' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}
