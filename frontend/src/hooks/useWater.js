import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { todayDateString } from '../lib/utils.js'

export function useWater(userId, date = todayDateString()) {
  const [entries, setEntries] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('meals')
      .select('id, water_ml, logged_at, description')
      .eq('user_id', userId)
      .eq('is_water', true)
      .gte('logged_at', `${date}T00:00:00`)
      .lte('logged_at', `${date}T23:59:59`)
      .order('logged_at', { ascending: true })

    const rows = data ?? []
    setEntries(rows)
    setTotal(rows.reduce((s, e) => s + (e.water_ml || 0), 0))
    setLoading(false)
  }, [userId, date])

  useEffect(() => { fetch() }, [fetch])

  async function addWater(ml) {
    if (!userId) return
    await supabase.from('meals').insert({
      user_id: userId,
      description: `💧 Água +${ml}ml`,
      water_ml: ml,
      protein_g: 0,
      carb_g: 0,
      is_water: true,
      is_outside_window: false,
    })
    await fetch()
  }

  async function deleteWater(id) {
    await supabase.from('meals').delete().eq('id', id)
    await fetch()
  }

  async function editWater(id, ml) {
    await supabase
      .from('meals')
      .update({ water_ml: ml, description: `💧 Água +${ml}ml` })
      .eq('id', id)
    await fetch()
  }

  return { entries, total, loading, addWater, deleteWater, editWater, refresh: fetch }
}
