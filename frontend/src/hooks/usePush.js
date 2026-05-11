import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export function usePush(userId) {
  const [permission, setPermission] = useState(Notification.permission)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    checkSubscription()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function checkSubscription() {
    if (!('serviceWorker' in navigator) || !userId) return
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    setSubscribed(!!sub)
  }

  async function subscribe() {
    if (!('serviceWorker' in navigator) || !VAPID_PUBLIC_KEY) return

    const result = await Notification.requestPermission()
    setPermission(result)
    if (result !== 'granted') return

    const reg = await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    if (existing) { setSubscribed(true); return }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })

    const { data: { session } } = await supabase.auth.getSession()
    await fetch(`${BACKEND_URL}/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({ subscription: sub.toJSON() })
    })

    setSubscribed(true)
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await sub.unsubscribe()
      const { data: { session } } = await supabase.auth.getSession()
      await fetch(`${BACKEND_URL}/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ endpoint: sub.endpoint })
      })
    }
    setSubscribed(false)
  }

  return { permission, subscribed, subscribe, unsubscribe }
}
