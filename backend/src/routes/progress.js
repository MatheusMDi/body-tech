import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

router.get('/metrics', async (req, res) => {
  const userId = req.user?.id
  const { data, error } = await supabase
    .from('body_metrics')
    .select('*')
    .eq('user_id', userId)
    .order('measured_at', { ascending: true })
    .limit(90)

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.post('/metrics', async (req, res) => {
  const userId = req.user?.id
  const { weight_kg, waist_cm, measured_at } = req.body

  const date = measured_at || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('body_metrics')
    .upsert({ user_id: userId, measured_at: date, weight_kg, waist_cm }, { onConflict: 'user_id,measured_at' })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
