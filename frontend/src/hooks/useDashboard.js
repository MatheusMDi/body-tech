import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { todayDateString } from '../lib/utils.js'

export function useDashboard(userId, days = 30) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    const endDate = todayDateString()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days + 1)
    const startDateStr = todayDateString(startDate)

    const { data: records } = await supabase
      .from('daily_records')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (!records) { setLoading(false); return }

    const total = records.length || 1
    const fastComplete = records.filter(r => r.fast_complete).length
    const proteinBatida = records.filter(r => r.proteina_batida).length
    const aguaBatida = records.filter(r => r.agua_batida).length
    const treinoFeito = records.filter(r => r.treino_feito).length

    const allFlags = records.flatMap(r => r.flags || [])
    const countFlag = (f) => allFlags.filter(x => x === f).length

    const streak = computeStreak(records)

    setData({
      period: { days, startDate: startDateStr, endDate },
      compliance: {
        jejum: pct(fastComplete, total),
        proteina: pct(proteinBatida, total),
        agua: pct(aguaBatida, total),
        treino: pct(treinoFeito, total),
      },
      flags: {
        alcool: { count: countFlag('ALCOOL'), total },
        acucar: { count: countFlag('ACUCAR'), total },
        jejumQuebrado: { count: countFlag('FORA_DA_JANELA'), total },
        sonoRuim: { count: countFlag('SONO_RUIM'), total },
        creatina: { count: countFlag('CREATINA_ESQUECIDA'), total },
        zma: { count: countFlag('ZMA_ESQUECIDO'), total },
      },
      streak: streak.current,
      streakMax: streak.max,
      records,
    })
    setLoading(false)
  }, [userId, days])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, refresh: fetch }
}

function pct(value, total) {
  return total === 0 ? 0 : Math.round((value / total) * 100)
}

function computeStreak(records) {
  if (!records.length) return { current: 0, max: 0 }

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))
  let current = 0
  let max = 0
  let temp = 0
  let prevDate = null

  for (const r of sorted) {
    const isGoodDay = r.fast_complete && r.proteina_batida && r.agua_batida
    if (!isGoodDay) { temp = 0; prevDate = null; continue }

    if (!prevDate) {
      temp = 1
    } else {
      const d1 = new Date(r.date)
      const d2 = new Date(prevDate)
      const diffDays = Math.round((d2 - d1) / 86400000)
      temp = diffDays === 1 ? temp + 1 : 1
    }

    if (temp > max) max = temp
    prevDate = r.date
  }

  // Current streak from today backwards
  const today = new Date()
  let streak = 0
  for (let i = 0; i < records.length; i++) {
    const d = new Date(sorted[i].date)
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)
    const expectedStr = expectedDate.toISOString().split('T')[0]
    if (sorted[i].date !== expectedStr) break
    if (!sorted[i].fast_complete) break
    streak++
  }

  return { current: streak, max }
}
