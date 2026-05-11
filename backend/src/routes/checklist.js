import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

router.get('/', async (req, res) => {
  const userId = req.user?.id
  const date = req.query.date || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('daily_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single()

  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ error: error.message })
  }

  res.json(data || null)
})

router.patch('/', async (req, res) => {
  const userId = req.user?.id
  const date = req.query.date || new Date().toISOString().split('T')[0]
  const { treino_feito, caminhada_feita } = req.body

  const { data, error } = await supabase
    .from('daily_records')
    .upsert({ user_id: userId, date, treino_feito, caminhada_feita }, { onConflict: 'user_id,date' })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
