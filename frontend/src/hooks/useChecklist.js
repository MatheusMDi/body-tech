import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { todayDateString } from '../lib/utils.js'
import { PROTOCOL } from '../lib/constants.js'

export function useChecklist(userId, totals, date = todayDateString()) {
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

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
    if (totals.water_ml >= PROTOCOL.WATER_GOAL_ML) update.agua_batida = true
    if (totals.protein_g >= PROTOCOL.PROTEIN_GOAL_G) update.proteina_batida = true
    if (Object.keys(update).length > 0) upsertRecord(update)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totals])

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

  const protein_g = totals?.protein_g ?? record?.total_protein_g ?? 0
  const water_ml = totals?.water_ml ?? record?.total_water_ml ?? 0

  const checklist = {
    jejum: record?.fast_complete ?? false,
    treino: record?.treino_feito ?? false,
    agua: water_ml >= PROTOCOL.WATER_GOAL_ML,
    proteina: protein_g >= PROTOCOL.PROTEIN_GOAL_G,
    caminhada: record?.caminhada_feita ?? false,
    sem_acucar: !(record?.flags ?? []).includes('ACUCAR'),
    sem_alcool: !(record?.flags ?? []).includes('ALCOOL'),
  }

  const completedCount = Object.values(checklist).filter(Boolean).length
  const totalCount = Object.keys(checklist).length

  return { checklist, record, loading, completedCount, totalCount, markTreino, markCaminhada, refresh: fetch }
}
