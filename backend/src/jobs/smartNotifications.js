import cron from 'node-cron'
import { supabase } from '../config/supabase.js'
import { sendPushToUser } from '../services/pushService.js'
import { checkAndUnlockAchievements } from '../services/achievementService.js'

const TIMEZONE = process.env.TZ || 'America/Sao_Paulo'

async function getAllUsers() {
  const { data } = await supabase.from('profiles').select('id')
  return data ?? []
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export function startSmartNotificationJobs() {
  // ── 07:30 — sleep reminder if yesterday not registered ──
  cron.schedule('30 7 * * *', async () => {
    const yesterday = yesterdayStr()
    const users = await getAllUsers()

    for (const { id } of users) {
      const { data } = await supabase
        .from('sleep_logs')
        .select('id')
        .eq('user_id', id)
        .eq('log_date', yesterday)
        .single()

      if (!data) {
        await sendPushToUser(id, 'Body Tech — Sono', '😴 Registre como foi seu sono de ontem')
      }
    }
  }, { timezone: TIMEZONE })

  // ── 21:30 — daily summary ──
  cron.schedule('30 21 * * *', async () => {
    const today = todayStr()
    const users = await getAllUsers()

    for (const { id } of users) {
      const { data: rec } = await supabase
        .from('daily_records')
        .select('fast_complete, total_protein_g, total_water_ml, flags')
        .eq('user_id', id)
        .eq('date', today)
        .single()

      if (!rec) continue

      const jejum = rec.fast_complete ? '✅ Jejum' : '❌ Jejum'
      const agua = `💧 ${((rec.total_water_ml || 0) / 1000).toFixed(1)}L/4L`
      const prot = `🥩 ${Math.round(rec.total_protein_g || 0)}g/160g`

      // Fetch streak
      const { data: recs } = await supabase
        .from('daily_records')
        .select('date, fast_complete')
        .eq('user_id', id)
        .order('date', { ascending: false })
        .limit(90)

      let streak = 0
      for (const r of (recs ?? [])) {
        if (r.fast_complete) streak++
        else break
      }

      await sendPushToUser(
        id,
        'Body Tech — Resumo do Dia',
        `${jejum} | ${agua} | ${prot} | 🔥 Streak: ${streak}d`
      )
    }
  }, { timezone: TIMEZONE })

  // ── Medidas atrasadas — daily check at 09:00 ──
  cron.schedule('0 9 * * *', async () => {
    const users = await getAllUsers()

    for (const { id } of users) {
      const { data } = await supabase
        .from('body_metrics')
        .select('measured_at')
        .eq('user_id', id)
        .order('measured_at', { ascending: false })
        .limit(1)
        .single()

      if (!data) continue

      const daysSince = Math.round(
        (Date.now() - new Date(data.measured_at).getTime()) / 86400000
      )

      if (daysSince >= 10) {
        await sendPushToUser(
          id,
          'Body Tech — Medidas',
          `📏 Faz ${daysSince} dias sem registrar medidas — hora de atualizar`
        )
      }
    }
  }, { timezone: TIMEZONE })

  // ── Achievement check — daily at 00:05 ──
  cron.schedule('5 0 * * *', async () => {
    const users = await getAllUsers()
    for (const { id } of users) {
      await checkAndUnlockAchievements(id)
    }
  }, { timezone: TIMEZONE })

  console.log('[cron] Smart notification jobs started')
}
