import cron from 'node-cron'
import { supabase } from '../config/supabase.js'
import { sendPushToUser } from '../services/pushService.js'
import { PROTOCOL, WEEKLY_REPORT_CRON } from '../config/constants.js'

const TIMEZONE = process.env.TZ || 'America/Sao_Paulo'

function getWeekRange() {
  const today = new Date()
  const endDate = new Date(today)
  endDate.setDate(today.getDate() - 1) // yesterday (Sunday)
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - 6) // 7 days back
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  }
}

function motivationalMessage(compliancePct) {
  if (compliancePct >= 90) return '🏆 Semana EXCEPCIONAL! Você está dominando o protocolo!'
  if (compliancePct >= 75) return '💪 Ótima semana! Continue assim!'
  if (compliancePct >= 60) return '📈 Bom progresso. Foco na próxima semana!'
  if (compliancePct >= 40) return '⚡ Semana desafiadora. Você tem o que precisa pra virar o jogo!'
  return '🎯 Hora de recalibrar. Um dia de cada vez!'
}

async function generateWeeklyReport(userId) {
  const { start, end } = getWeekRange()

  const { data: records } = await supabase
    .from('daily_records')
    .select('*')
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)

  if (!records?.length) return null

  const total = records.length
  const fastCount = records.filter(r => r.fast_complete).length
  const proteinCount = records.filter(r => r.proteina_batida).length
  const waterCount = records.filter(r => r.agua_batida).length
  const allFlags = records.flatMap(r => r.flags || [])
  const negativeFlags = allFlags.filter(f => ['ALCOOL', 'ACUCAR', 'FORA_DA_JANELA'].length > 0)

  const compliancePct = Math.round(((fastCount + proteinCount + waterCount) / (total * 3)) * 100)

  const { data: metrics } = await supabase
    .from('body_metrics')
    .select('weight_kg, measured_at')
    .eq('user_id', userId)
    .gte('measured_at', start)
    .lte('measured_at', end)
    .order('measured_at', { ascending: false })
    .limit(2)

  const weightDelta = metrics?.length >= 2
    ? (metrics[0].weight_kg - metrics[metrics.length - 1].weight_kg).toFixed(1)
    : null

  const body = [
    `📊 Semana ${start} → ${end}`,
    `Jejum: ${fastCount}/${total} dias (${Math.round((fastCount / total) * 100)}%)`,
    `Proteína: ${proteinCount}/${total} dias`,
    `Água: ${waterCount}/${total} dias`,
    weightDelta ? `Variação de peso: ${weightDelta > 0 ? '+' : ''}${weightDelta}kg` : null,
    `Compliance geral: ${compliancePct}%`,
    motivationalMessage(compliancePct),
  ].filter(Boolean).join('\n')

  return { title: 'Body Tech — Relatório Semanal', body }
}

export function startWeeklyReportJob() {
  cron.schedule(WEEKLY_REPORT_CRON, async () => {
    console.log('[cron] Generating weekly reports...')
    const { data: users } = await supabase.from('profiles').select('id')
    if (!users) return

    for (const { id: userId } of users) {
      const report = await generateWeeklyReport(userId)
      if (report) {
        await sendPushToUser(userId, report.title, report.body)
      }
    }
  }, { timezone: TIMEZONE })

  console.log('[cron] Weekly report job started (Monday 08:00)')
}
