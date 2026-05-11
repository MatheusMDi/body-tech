import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst } from 'workbox-strategies'
import { createHandlerBoundToURL } from 'workbox-precaching'

clientsClaim()
self.skipWaiting()

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// SPA navigation fallback
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'))
)

// Supabase API — network first with cache fallback
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co'),
  new NetworkFirst({ cacheName: 'supabase-cache', networkTimeoutSeconds: 5 })
)

// Google Fonts — cache first
registerRoute(
  ({ url }) => url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com'),
  new CacheFirst({ cacheName: 'google-fonts-cache' })
)

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title || 'Body Tech'
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: data.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: data.tag || 'body-tech-notification',
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find(c => c.url.includes(self.location.origin))
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})
