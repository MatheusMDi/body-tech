import { supabase } from '../lib/supabase.js'

export const PREDEFINED_RULES = [
  // Restrictions
  { key: 'no_sugar',        name: 'Sem açúcar refinado',   emoji: '🚫', type: 'restriction', points_on_success: 5, points_on_failure: 5 },
  { key: 'no_alcohol',      name: 'Sem álcool',             emoji: '🚫', type: 'restriction', points_on_success: 8, points_on_failure: 10 },
  { key: 'no_ultraprocessed',name: 'Sem ultraprocessados',  emoji: '🚫', type: 'restriction', points_on_success: 5, points_on_failure: 5 },
  { key: 'no_gluten',       name: 'Sem glúten',             emoji: '🌾', type: 'restriction', points_on_success: 5, points_on_failure: 5 },
  { key: 'no_lactose',      name: 'Sem lactose',            emoji: '🥛', type: 'restriction', points_on_success: 5, points_on_failure: 5 },
  { key: 'no_fried',        name: 'Sem frituras',           emoji: '🍟', type: 'restriction', points_on_success: 5, points_on_failure: 5 },
  { key: 'no_soda',         name: 'Sem refrigerante',       emoji: '🥤', type: 'restriction', points_on_success: 3, points_on_failure: 3 },
  { key: 'no_fastfood',     name: 'Sem fast food',          emoji: '🍔', type: 'restriction', points_on_success: 5, points_on_failure: 5 },
  // Habits
  { key: 'sleep_early',     name: 'Dormir antes das 23h',   emoji: '🌙', type: 'habit', points_on_success: 5, points_on_failure: 3 },
  { key: '10k_steps',       name: '10.000 passos por dia',  emoji: '👟', type: 'habit', points_on_success: 8, points_on_failure: 0 },
  { key: 'meditation',      name: 'Meditação diária',       emoji: '🧘', type: 'habit', points_on_success: 5, points_on_failure: 0 },
  { key: 'reading',         name: 'Leitura 30min',          emoji: '📚', type: 'habit', points_on_success: 5, points_on_failure: 0 },
  { key: 'no_screens_22',   name: 'Sem tela após 22h',      emoji: '📵', type: 'habit', points_on_success: 5, points_on_failure: 3 },
  { key: 'cold_shower',     name: 'Banho frio pela manhã',  emoji: '🚿', type: 'habit', points_on_success: 5, points_on_failure: 0 },
  { key: 'gratitude',       name: 'Gratidão diária',        emoji: '📝', type: 'habit', points_on_success: 3, points_on_failure: 0 },
  // Performance
  { key: 'train_daily',     name: 'Treinar todos os dias',  emoji: '💪', type: 'habit', points_on_success: 10, points_on_failure: 5 },
  { key: 'stretch',         name: 'Alongamento pós-treino', emoji: '🤸', type: 'habit', points_on_success: 3, points_on_failure: 0 },
  { key: 'protein_goal',    name: 'Proteína batida',        emoji: '🥩', type: 'habit', points_on_success: 8, points_on_failure: 3 },
  { key: 'water_goal',      name: 'Água batida',            emoji: '💧', type: 'habit', points_on_success: 5, points_on_failure: 2 },
]

export const PREDEFINED_BONUSES = [
  { key: 'extra_walk',   name: 'Caminhada extra',      emoji: '🚶', type: 'bonus', points_on_success: 5 },
  { key: 'sauna',        name: 'Sauna',                emoji: '🧖', type: 'bonus', points_on_success: 5 },
  { key: 'zone2_fasted', name: 'Zona 2 em jejum',      emoji: '🏃', type: 'bonus', points_on_success: 10 },
  { key: 'sleep_8h',     name: 'Sono 8h+',             emoji: '😴', type: 'bonus', points_on_success: 8 },
  { key: 'clean_day',    name: 'Dia 100% limpo',        emoji: '⭐', type: 'bonus', points_on_success: 15 },
]

export async function getRules(userId) {
  if (!userId) return []
  const { data } = await supabase
    .from('user_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function getAllRules(userId) {
  if (!userId) return []
  const { data } = await supabase
    .from('user_rules')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function createRule(userId, ruleData) {
  const { data, error } = await supabase
    .from('user_rules')
    .insert({ user_id: userId, ...ruleData })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRule(ruleId, fields) {
  const { data, error } = await supabase
    .from('user_rules')
    .update(fields)
    .eq('id', ruleId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRule(ruleId) {
  await supabase.from('user_rules').delete().eq('id', ruleId)
}

export async function getDailyRules(userId, date) {
  if (!userId) return []
  const { data } = await supabase
    .from('daily_rules')
    .select('*, rule:user_rules(*)')
    .eq('user_id', userId)
    .eq('rule_date', date)
  return data ?? []
}

export async function setDailyRuleStatus(userId, ruleId, date, status, pointsApplied) {
  const { data, error } = await supabase
    .from('daily_rules')
    .upsert(
      { user_id: userId, rule_id: ruleId, rule_date: date, status, points_applied: pointsApplied },
      { onConflict: 'user_id,rule_id,rule_date' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function seedPredefinedRules(userId, keys) {
  const toInsert = PREDEFINED_RULES
    .filter(r => keys.includes(r.key))
    .map(r => ({
      user_id: userId,
      name: r.name,
      emoji: r.emoji,
      type: r.type,
      is_predefined: true,
      predefined_key: r.key,
      points_on_success: r.points_on_success,
      points_on_failure: r.points_on_failure,
      is_active: true,
    }))

  if (toInsert.length === 0) return []
  const { data } = await supabase.from('user_rules').insert(toInsert).select()
  return data ?? []
}
