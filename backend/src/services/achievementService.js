import { supabase } from '../config/supabase.js'
import { sendPushToUser } from './pushService.js'

const ACHIEVEMENTS = {
  PRIMEIRA_SEMANA:     { target: 7,  label: 'Primeira Semana 🔥',   check: 'fastStreak' },
  MES_SOLIDO:          { target: 30, label: 'Mês Sólido 💪',         check: 'fastStreak' },
  PROTOCOLO_ELITE:     { target: 60, label: 'Protocolo Elite 🏆',    check: 'fastStreak' },
  META_BATIDA:         { target: 1,  label: 'Meta Batida 🥩',         check: 'proteinOnce' },
  CONSISTENCIA_PROTEINA:{ target: 14, label: 'Consistência 🥩',       check: 'proteinStreak' },
  MAQUINA_PROTEINA:    { target: 30, label: 'Máquina 🥩',             check: 'proteinStreak' },
  SEMANA_LIMPA:        { target: 7,  label: 'Semana Limpa 🚫',        check: 'cleanStreak' },
  MES_LIMPO:           { target: 30, label: 'Mês Limpo 🚫',           check: 'cleanStreak' },
  PRIMEIRO_KG:         { target: 1,  label: 'Primeiro Kg 📉',         check: 'weightLoss' },
  CINCO_KG:            { target: 5,  label: 'Cinco Kg 📉',            check: 'weightLoss' },
  DEZ_KG:              { target: 10, label: 'Dez Kg 📉',              check: 'weightLoss' },
  ATLETA:              { target: 20, label: 'Atleta 🏋️',              check: 'workouts' },
  DEDICADO:            { target: 50, label: 'Dedicado 🏋️',            check: 'workouts' },
}

export async function checkAndUnlockAchievements(userId) {
  const { data: already } = await supabase
    .from('achievements')
    .select('achievement_key')
    .eq('user_id', userId)

  const unlockedKeys = new Set(already?.map(a => a.achievement_key) ?? [])

  const [records, metrics] = await Promise.all([
    supabase.from('daily_records').select('*').eq('user_id', userId).order('date'),
    supabase.from('body_metrics').select('weight_kg, measured_at').eq('user_id', userId).order('measured_at'),
  ])

  const rows = records.data ?? []
  const bodyData = metrics.data ?? []

  const scores = {
    fastStreak: computeFastStreak(rows),
    proteinOnce: rows.some(r => r.proteina_batida) ? 1 : 0,
    proteinStreak: computeProteinStreak(rows),
    cleanStreak: computeCleanStreak(rows),
    weightLoss: computeWeightLoss(bodyData),
    workouts: rows.filter(r => r.treino_feito).length,
  }

  const newlyUnlocked = []

  for (const [key, def] of Object.entries(ACHIEVEMENTS)) {
    if (unlockedKeys.has(key)) continue
    const score = scores[def.check] ?? 0
    if (score >= def.target) {
      await supabase.from('achievements').insert({ user_id: userId, achievement_key: key })
      newlyUnlocked.push(def.label)
    }
  }

  if (newlyUnlocked.length > 0) {
    await sendPushToUser(
      userId,
      '🏆 Conquista desbloqueada!',
      newlyUnlocked.join(', ')
    )
  }

  return newlyUnlocked
}

function computeFastStreak(rows) {
  let max = 0
  let streak = 0
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date))
  for (const r of sorted) {
    if (r.fast_complete) { streak++; if (streak > max) max = streak }
    else streak = 0
  }
  return max
}

function computeProteinStreak(rows) {
  let max = 0
  let streak = 0
  for (const r of rows) {
    if (r.proteina_batida) { streak++; if (streak > max) max = streak }
    else streak = 0
  }
  return max
}

function computeCleanStreak(rows) {
  let max = 0
  let streak = 0
  for (const r of rows) {
    const flags = r.flags ?? []
    if (!flags.includes('ALCOOL') && !flags.includes('ACUCAR')) {
      streak++
      if (streak > max) max = streak
    } else {
      streak = 0
    }
  }
  return max
}

function computeWeightLoss(bodyData) {
  if (bodyData.length < 2) return 0
  const loss = bodyData[0].weight_kg - bodyData[bodyData.length - 1].weight_kg
  return Math.max(0, loss)
}
