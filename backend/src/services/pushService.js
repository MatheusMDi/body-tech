import webpush from 'web-push'
import { supabase } from '../config/supabase.js'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'admin@bodytech.app'}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export async function sendPushToAll(title, body, data = {}) {
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('id, subscription')

  if (error) {
    console.error('[push] Error fetching subscriptions:', error.message)
    return
  }

  const results = await Promise.allSettled(
    subscriptions.map(row => sendPush(row.subscription, title, body, data))
  )

  const failures = results.filter(r => r.status === 'rejected')
  if (failures.length > 0) {
    console.warn(`[push] ${failures.length}/${subscriptions.length} pushes failed`)
  }
}

export async function sendPushToUser(userId, title, body, data = {}) {
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', userId)

  if (error || !subscriptions?.length) return

  await Promise.allSettled(
    subscriptions.map(row => sendPush(row.subscription, title, body, data))
  )
}

async function sendPush(subscription, title, body, data = {}) {
  const payload = JSON.stringify({ title, body, data })
  try {
    await webpush.sendNotification(subscription, payload)
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Subscription expired — remove from DB
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('subscription->>endpoint', subscription.endpoint)
    }
    throw err
  }
}
