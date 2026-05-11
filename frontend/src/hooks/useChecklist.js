import { useState, useEffect, useCallback, useContext } from 'react'
import { supabase } from '../lib/supabase.js'
import { todayDateString } from '../lib/utils.js'
import { SettingsContext } from '../contexts/SettingsContext.jsx'

export function useChecklist(userId, totals, date = todayDateString()) {
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  // Pull goals from settings context if available, else use safe defaults
  let waterGoalMl = 4000
  let proteinGoalG = 160
  try {
    const ctx = useContext(SettingsContext)
    waterGoalMl  = ctx?.settings?.waterGoalMl  ?? 4000
    proteinGoalG = ctx?.settings?.proteinGoalG ?? 160
  } catch {}

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('daily_records')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()
    setRecord(data)
    setLoading(false)
  }, [userId, date])

  useEffect(() => { fetch() }, [fetch])

  // Auto-update water/protein flags whenever totals change
  useEffect(() => {
    if (!userId || !totals) return
    const update = {}
    if (totals.water_ml >= waterGoalMl)  update.agua_batida = true
    if (totals.protein_g >= proteinGoalG) update.proteina_batida = true
    if (Object.keys(update).length > 0) upsertRecord(update)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totals, waterGoalMl, proteinGoalG])

  async function upsertRecord(fields) {
    if (!userId) return
    const { data, error } = await supabase
      .from('daily_records')
      .upsert({ user_id: userId, date, ...fields }, { onConflict: 'user_id,date' })
      .select()
      .single()
    if (!error) setRecord(data)
  }

  async function markTreino(done) {
    await upsertRecord({ treino_feito: done })
  }

  async function markCaminhada(done) {
    await upsertRecord({ caminhada_feita: done })
  }

  const protein_g = totals?.protein_g ?? 0
  const water_ml  = totals?.water_ml  ?? 0

  const checklist = {
    jejum:       record?.fast_complete ?? false,
    treino:      record?.treino_feito  ?? false,
    agua:        water_ml  >= waterGoalMl,
    proteina:    protein_g >= proteinGoalG,
    caminhada:   record?.caminhada_feita ?? false,
    sem_acucar:  !(record?.flags ?? []).includes('ACUCAR'),
    sem_alcool:  !(record?.flags ?? []).includes('ALCOOL'),
  }

  const completedCount = Object.values(checklist).filter(Boolean).length
  const totalCount     = Object.keys(checklist).length

  return { checklist, record, loading, completedCount, totalCount, markTreino, markCaminhada, refresh: fetch }
}
