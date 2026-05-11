import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

router.post('/subscribe', async (req, res) => {
  const userId = req.user?.id
  const { subscription } = req.body

  if (!userId || !subscription) {
    return res.status(400).json({ error: 'Missing userId or subscription' })
  }

  // Upsert by endpoint to avoid duplicates
  await supabase.from('push_subscriptions')
    .upsert(
      { user_id: userId, subscription, endpoint: subscription.endpoint },
      { onConflict: 'endpoint' }
    )

  res.json({ ok: true })
})

router.post('/unsubscribe', async (req, res) => {
  const userId = req.user?.id
  const { endpoint } = req.body

  if (!userId || !endpoint) {
    return res.status(400).json({ error: 'Missing endpoint' })
  }

  await supabase.from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', endpoint)

  res.json({ ok: true })
})

export default router
