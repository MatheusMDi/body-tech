import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

router.get('/', async (req, res) => {
  const userId = req.user?.id
  const days = parseInt(req.query.days) || 30

  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days + 1)
  const startDateStr = startDate.toISOString().split('T')[0]

  const { data: records, error } = await supabase
    .from('daily_records')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDateStr)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })

  const total = records.length || 1
  const allFlags = records.flatMap(r => r.flags || [])
  const countFlag = (f) => allFlags.filter(x => x === f).length

  res.json({
    period: { days, startDate: startDateStr, endDate },
    compliance: {
      jejum: pct(records.filter(r => r.fast_complete).length, total),
      proteina: pct(records.filter(r => r.proteina_batida).length, total),
      agua: pct(records.filter(r => r.agua_batida).length, total),
      treino: pct(records.filter(r => r.treino_feito).length, total),
    },
    flags: {
      alcool: { count: countFlag('ALCOOL'), total },
      acucar: { count: countFlag('ACUCAR'), total },
      jejumQuebrado: { count: countFlag('FORA_DA_JANELA'), total },
      sonoRuim: { count: countFlag('SONO_RUIM'), total },
      creatina: { count: countFlag('CREATINA_ESQUECIDA'), total },
      zma: { count: countFlag('ZMA_ESQUECIDO'), total },
    },
    records,
  })
})

function pct(value, total) {
  return total === 0 ? 0 : Math.round((value / total) * 100)
}

export default router
