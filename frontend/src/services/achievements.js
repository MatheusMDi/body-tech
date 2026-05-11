import { supabase } from '../lib/supabase.js'
import { ACHIEVEMENTS } from '../lib/constants.js'

export async function getUnlockedAchievements(userId) {
  const { data } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })
  return data ?? []
}

export async function computeAchievementProgress(userId) {
  const [records, metrics, unlocked] = await Promise.all([
    supabase
      .from('daily_records')
      .select('date, fast_complete, proteina_batida, agua_batida, treino_feito, flags')
      .eq('user_id', userId)
      .order('date', { ascending: true }),
    supabase
      .from('body_metrics')
      .select('weight_kg, measured_at')
      .eq('user_id', userId)
      .order('measured_at', { ascending: true }),
    getUnlockedAchievements(userId),
  ])

  const rows = records.data ?? []
  const bodyData = metrics.data ?? []
  const unlockedKeys = new Set(unlocked.map(u => u.achievement_key))

  const results = {}

  for (const [key, def] of Object.entries(ACHIEVEMENTS)) {
    const alreadyUnlocked = unlockedKeys.has(key)
    let progress = 0

    switch (key) {
      case 'PRIMEIRA_SEMANA':
      case 'MES_SOLIDO':
      case 'PROTOCOLO_ELITE':
        progress = computeFastStreak(rows, def.target)
        break
      case 'META_BATIDA':
        progress = rows.some(r => r.proteina_batida) ? def.target : 0
        break
      case 'CONSISTENCIA_PROTEINA':
      case 'MAQUINA_PROTEINA':
        progress = computeConsecutiveProtein(rows, def.target)
        break
      case 'SEMANA_LIMPA':
      case 'MES_LIMPO':
        progress = computeCleanStreak(rows, def.target)
        break
      case 'PRIMEIRO_KG':
      case 'CINCO_KG':
      case 'DEZ_KG':
        progress = computeWeightLoss(bodyData, def.target)
        break
      case 'ATLETA':
      case 'DEDICADO':
        progress = rows.filter(r => r.treino_feito).length
        break
      default:
        progress = 0
    }

    results[key] = { ...def, progress, unlocked: alreadyUnlocked }
  }

  return results
}

function computeFastStreak(rows, target) {
  let streak = 0
  let max = 0
  const sorted = [...rows].sort((a, b) => b.date.localeCompare(a.date))

  for (let i = 0; i < sorted.length; i++) {
    if (!sorted[i].fast_complete) { streak = 0; continue }
    if (i === 0) { streak = 1; continue }
    const prev = new Date(sorted[i - 1].date)
    const curr = new Date(sorted[i].date)
    const diff = Math.round((prev - curr) / 86400000)
    streak = diff === 1 ? streak + 1 : 1
    if (streak > max) max = streak
  }

  return Math.min(max || streak, target)
}

function computeConsecutiveProtein(rows, target) {
  let streak = 0
  let max = 0
  for (const r of rows) {
    if (r.proteina_batida) { streak++; if (streak > max) max = streak }
    else streak = 0
  }
  return Math.min(max, target)
}

function computeCleanStreak(rows, target) {
  let streak = 0
  let max = 0
  for (const r of rows) {
    const flags = r.flags ?? []
    if (!flags.includes('ALCOOL') && !flags.includes('ACUCAR')) {
      streak++
      if (streak > max) max = streak
    } else {
      streak = 0
    }
  }
  return Math.min(max, target)
}

function computeWeightLoss(bodyData, target) {
  if (bodyData.length < 2) return 0
  const first = bodyData[0].weight_kg
  const last = bodyData[bodyData.length - 1].weight_kg
  const loss = first - last
  return Math.min(Math.max(0, loss), target)
}
