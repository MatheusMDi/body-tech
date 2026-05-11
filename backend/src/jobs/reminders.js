import cron from 'node-cron'
import { supabase } from '../config/supabase.js'
import { sendPushToUser } from '../services/pushService.js'
import { checkWaterAlert, checkProteinAlert, flagMissingSupplements, checkFastingCompletion } from '../services/fastingService.js'

const TIMEZONE = process.env.TZ || 'America/Sao_Paulo'

// Subtract minutes from a HH:MM string → returns HH:MM
function subtractMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m - mins
  const wrapped = ((total % 1440) + 1440) % 1440
  return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`
}

function currentHHMM() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

// Per-user dynamic scheduler — runs every minute
export function startReminderJobs() {
  cron.schedule('* * * * *', async () => {
    const hhmm = currentHHMM()

    // Fetch all users with their profiles
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, fasting_start, fasting_end, training_time, notifications_enabled, notification_preferences, active_supplements')

    if (error || !users?.length) return

    for (const user of users) {
      if (user.notifications_enabled === false) continue

      const prefs  = user.notification_preferences ?? {}
      const userId = user.id

      const fastStart   = user.fasting_start   ?? '20:00'
      const fastEnd     = user.fasting_end     ?? '14:00'
      const trainTime   = user.training_time   ?? '18:00'
      const supplements = user.active_supplements ?? []

      // Helper: check if pref is enabled (defaults to true)
      const prefOn = (key) => prefs[key] !== false

      // ── Window open reminders ──────────────────────────
      if (prefOn('window_open')) {
        if (hhmm === subtractMinutes(fastEnd, 15)) {
          await sendPushToUser(userId, 'Body Tech', `🍽️ Janela abre em 15min — prepare sua primeira refeição`)
        }
        if (hhmm === fastEnd.slice(0, 5)) {
          await sendPushToUser(userId, 'Body Tech', `✅ Janela aberta — pode comer agora`)
        }
      }

      // ── Window close reminders ─────────────────────────
      if (prefOn('window_close')) {
        if (hhmm === subtractMinutes(fastStart, 15)) {
          await sendPushToUser(userId, 'Body Tech', `⚠️ Janela fecha em 15min`)
        }
        if (hhmm === fastStart.slice(0, 5)) {
          await sendPushToUser(userId, 'Body Tech', `🌙 Janela fechada — jejum iniciado`)
        }
      }

      // ── Pre-workout ────────────────────────────────────
      if (prefOn('pre_workout')) {
        if (hhmm === subtractMinutes(trainTime, 15)) {
          await sendPushToUser(userId, 'Body Tech', `🏃 Pré-treino em 15min — Whey + fruta`)
        }
        if (hhmm === trainTime.slice(0, 5)) {
          await sendPushToUser(userId, 'Body Tech', `🏋️ Hora do treino — pré-treino agora`)
        }
      }

      // ── Post-workout (60min after train) ───────────────
      if (prefOn('post_workout')) {
        const postTime = addMinutesToHHMM(trainTime, 60)
        if (hhmm === postTime) {
          await sendPushToUser(userId, 'Body Tech', `💪 Pós-treino — refeição principal agora`)
        }
      }

      // ── Supplements (only active ones) ────────────────
      if (prefOn('supplement') && supplements.length > 0) {
        // Creatine at training time
        if (supplements.includes('creatina') && hhmm === trainTime.slice(0, 5)) {
          await sendPushToUser(userId, 'Suplementos', `💊 Creatina — tome agora`)
        }
        // ZMA 90min after window closes
        if (supplements.includes('zma')) {
          const zmaTime = addMinutesToHHMM(fastStart, 90)
          if (hhmm === zmaTime) {
            await sendPushToUser(userId, 'Suplementos', `💊 ZMA antes de dormir`)
          }
        }
        // Omega3 / Multi / D3K2 at window open
        const morningSupps = ['omega3','multivitaminico','d3k2'].filter(s => supplements.includes(s))
        if (morningSupps.length > 0 && hhmm === fastEnd.slice(0, 5)) {
          await sendPushToUser(userId, 'Suplementos', `💊 ${morningSupps.join(' + ')} com a refeição`)
        }
      }
    }
  }, { timezone: TIMEZONE })

  // ── Static maintenance jobs ────────────────────────────────
  cron.schedule('0 18 * * *', async () => {
    await checkWaterAlert()
  }, { timezone: TIMEZONE })

  cron.schedule('0 19 * * *', async () => {
    await checkProteinAlert()
  }, { timezone: TIMEZONE })

  cron.schedule('1 14 * * *', async () => {
    await checkFastingCompletion()
  }, { timezone: TIMEZONE })

  cron.schedule('0 20 * * *', async () => {
    await flagMissingSupplements()
  }, { timezone: TIMEZONE })

  // ── Adaptive hydration reminders — every hour ─────────────
  const lastHydrationMessage = new Map() // userId -> last message index

  const HYDRATION_MESSAGES = {
    yellow: [
      '💧 Você está um pouco atrás na hidratação hoje',
      '💧 Lembre de beber água ao longo do dia',
      '💧 Hydratação em dia é fundamental',
    ],
    orange: [
      '💧 Meta de água: faltam {remaining}L para hoje',
      '⚠️ Menos da metade da meta de água — beba agora',
      '💧 Atenção à hidratação — você está abaixo do ritmo',
    ],
    red: [
      '🚨 Só algumas horas para fechar o dia — {remaining}L ainda faltando',
      '🚨 Hidratação crítica — beba água agora',
      '🚨 Meta de água longe de ser atingida hoje',
    ],
  }

  function pickHydrationMessage(level, userId, remaining) {
    const messages = HYDRATION_MESSAGES[level]
    const lastIdx = lastHydrationMessage.get(userId) ?? -1
    const nextIdx = (lastIdx + 1) % messages.length
    lastHydrationMessage.set(userId, nextIdx)
    return messages[nextIdx].replace('{remaining}', remaining.toFixed(1))
  }

  cron.schedule('0 * * * *', async () => {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, water_goal_ml, training_time, trains, notifications_enabled, notification_preferences')

    if (error || !users?.length) return

    const today = new Date().toISOString().slice(0, 10)
    const nowHour = new Date().getHours()

    for (const user of users) {
      if (user.notifications_enabled === false) continue

      const prefs = user.notification_preferences ?? {}
      const prefOn = (key) => prefs[key] !== false

      const userId = user.id
      const goalMl = user.water_goal_ml ?? 3000

      // Get today's water intake
      const { data: waterRows } = await supabase
        .from('meals')
        .select('water_ml')
        .eq('user_id', userId)
        .eq('meal_date', today)
        .eq('is_water', true)

      const intakeMl = (waterRows ?? []).reduce((sum, r) => sum + (r.water_ml ?? 0), 0)

      // Calculate urgency
      const dayFraction = Math.max(nowHour / 24, 0.01)
      const expectedFraction = dayFraction
      const actualFraction = intakeMl / goalMl
      const ratio = actualFraction / expectedFraction // 1.0 = perfectly on track

      let urgencyLevel = null
      if (ratio < 0.3) urgencyLevel = 'red'
      else if (ratio < 0.5) urgencyLevel = 'orange'
      else if (ratio < 0.8) urgencyLevel = 'yellow'
      // >= 0.8 = green, no reminder

      if (urgencyLevel && prefOn('hydration')) {
        const remainingL = Math.max((goalMl - intakeMl) / 1000, 0)
        const msg = pickHydrationMessage(urgencyLevel, userId, remainingL)
        await sendPushToUser(userId, 'Hidratação', msg)
      }

      // Pre-training hydration reminder — 30min before training_time
      if (user.trains && user.training_time && prefOn('hydration')) {
        const trainHHMM = user.training_time.slice(0, 5)
        const reminderHHMM = subtractMinutes(trainHHMM, 30)
        const currentHHMM = `${String(nowHour).padStart(2, '0')}:00`
        if (currentHHMM === reminderHHMM.slice(0, 3) + '00') {
          await sendPushToUser(userId, 'Treino', '🏋️ Treino em 30min — hidrate-se agora')
        }
      }
    }
  }, { timezone: TIMEZONE })

  // ── Daily PR summary — 11:59 PM ───────────────────────────
  cron.schedule('59 23 * * *', async () => {
    const today = new Date().toISOString().slice(0, 10)

    const { data: records, error } = await supabase
      .from('personal_records')
      .select('user_id, exercise_name')
      .eq('achieved_at', today)

    if (error || !records?.length) return

    // Group by user
    const byUser = {}
    for (const r of records) {
      if (!byUser[r.user_id]) byUser[r.user_id] = []
      byUser[r.user_id].push(r.exercise_name)
    }

    for (const [userId, exercises] of Object.entries(byUser)) {
      // Check notifications enabled
      const { data: profile } = await supabase
        .from('profiles')
        .select('notifications_enabled')
        .eq('id', userId)
        .single()

      if (profile?.notifications_enabled === false) continue

      const names = [...new Set(exercises)].join(', ')
      await sendPushToUser(userId, 'Body Tech', `🏆 Novos PRs hoje: ${names}`)
    }
  }, { timezone: TIMEZONE })

  console.log('[cron] Per-user dynamic reminder jobs started')
}

function addMinutesToHHMM(timeStr, mins) {
  const [h, m] = timeStr.split(':').map(Number)
  const total  = ((h * 60 + m + mins) % 1440 + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
