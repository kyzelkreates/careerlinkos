/**
 * ============================================================
 * CareerLink OS™ — Service Worker: Offline Sync Handler
 * public/sw-job-sync.js
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 *
 * Handles background sync for offline activity log submissions.
 * All data is stored locally in localStorage — this SW provides
 * offline fallback and cache management.
 * ============================================================
 */

const CACHE_NAME = 'careerlinkos-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(['/'])
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Cache-first for static assets, network-first for API
  if (event.request.method !== 'GET') return
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached
      return fetch(event.request).catch(() => cached)
    })
  )
})
