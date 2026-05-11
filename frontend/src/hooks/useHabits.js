import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { todayDateString } from '../lib/utils.js'

export function useHabits(userId, date = todayDateString()) {
  const [flags, setFlags] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('daily_records')
      .select('flags')
      .eq('user_id', userId)
      .eq('date', date)
      .single()
    setFlags(data?.flags ?? [])
    setLoading(false)
  }, [userId, date])

  useEffect(() => { fetch() }, [fetch])

  async function toggleFlag(flagId) {
    const updated = flags.includes(flagId)
      ? flags.filter(f => f !== flagId)
      : [...flags, flagId]

    setFlags(updated) // Optimistic update

    await supabase.from('daily_records').upsert(
      { user_id: userId, date, flags: updated },
      { onConflict: 'user_id,date' }
    )
  }

  function isOn(flagId) {
    return flags.includes(flagId)
  }

  return { flags, loading, toggleFlag, isOn, refresh: fetch }
}
