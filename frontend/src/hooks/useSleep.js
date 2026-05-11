import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { todayDateString } from '../lib/utils.js'

export function useSleep(userId, date = todayDateString()) {
  const [entry, setEntry] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    const [todayRes, historyRes] = await Promise.all([
      supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', date)
        .single(),
      supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .order('log_date', { ascending: false })
        .limit(14),
    ])

    setEntry(todayRes.data ?? null)
    setHistory(historyRes.data ?? [])
    setLoading(false)
  }, [userId, date])

  useEffect(() => { fetch() }, [fetch])

  async function saveSleep({ hours_slept, quality, notes }) {
    if (!userId) return
    await supabase.from('sleep_logs').upsert(
      { user_id: userId, log_date: date, hours_slept, quality, notes },
      { onConflict: 'user_id,log_date' }
    )

    // Flag SONO_RUIM automatically
    if (hours_slept < 7 || quality <= 2) {
      const { data: rec } = await supabase
        .from('daily_records')
        .select('flags')
        .eq('user_id', userId)
        .eq('date', date)
        .single()

      const existing = rec?.flags ?? []
      if (!existing.includes('SONO_RUIM')) {
        await supabase.from('daily_records').upsert(
          { user_id: userId, date, flags: [...existing, 'SONO_RUIM'] },
          { onConflict: 'user_id,date' }
        )
      }
    }

    await fetch()
  }

  const avgHours = history.length > 0
    ? history.reduce((s, e) => s + e.hours_slept, 0) / history.length
    : null

  return { entry, history, loading, saveSleep, avgHours, refresh: fetch }
}
