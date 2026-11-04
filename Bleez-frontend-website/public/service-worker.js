// CRITICAL: Force cache purge version - increment to force update
const CACHE_VERSION = 'v5-force-purge';
const CACHE_NAME = `aitravelglobe-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// NEVER cache these paths - always go to network
const NO_CACHE_PATTERNS = [
  '/api/',
  '/socket.io/',
  '/community',
  '/messages',
  '/online-users',
  '/presence',
  '/private-messages'
];

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json'
];

// ===== FORCE PURGE ALL CACHES ON INSTALL =====
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker with FORCE PURGE');
  
  event.waitUntil(
    (async () => {
      // 1. Delete ALL existing caches
      const cacheNames = await caches.keys();
      console.log('[SW] Deleting all caches:', cacheNames);
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      // 2. Clear IndexedDB databases
      if (typeof indexedDB !== 'undefined') {
        try {
          const databases = await indexedDB.databases();
          for (const db of databases) {
            if (db.name) {
              console.log('[SW] Deleting IndexedDB:', db.name);
              indexedDB.deleteDatabase(db.name);
            }
          }
        } catch (e) {
          console.log('[SW] IndexedDB cleanup skipped:', e.message);
        }
      }
      
      // 3. Create new cache with only essential assets
      const cache = await caches.open(CACHE_NAME);
      console.log('[SW] Creating fresh cache:', CACHE_NAME);
      await cache.addAll(PRECACHE_ASSETS);
      
      // 4. Force immediate activation
      await self.skipWaiting();
      
      console.log('[SW] Installation complete - all old data purged');
    })()
  );
});

// ===== FORCE CLAIM ALL CLIENTS ON ACTIVATE =====
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating - claiming all clients');
  
  event.waitUntil(
    (async () => {
      // Delete any caches that aren't the current one
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Removing old cache:', name);
            return caches.delete(name);
          })
      );
      
      // Take control of all clients immediately
      await self.clients.claim();
      
      // Notify all clients to refresh
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_CACHE_PURGED',
          version: CACHE_VERSION,
          message: 'All caches cleared. Please refresh for latest data.'
        });
      });
      
      console.log('[SW] Activation complete - all clients claimed');
    })()
  );
});

// ===== FETCH HANDLER - NEVER CACHE CHAT DATA =====
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (!url.origin.includes(self.location.origin.split('//')[1])) {
    return;
  }
  
  // CRITICAL: Never intercept API calls in Service Worker - let browser execute natively
  if (url.pathname.includes('/api/')) {
    return;
  }
  
  if (shouldNeverCache) {
    // Always fetch from network for chat data
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',
        headers: {
          ...Object.fromEntries(event.request.headers),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      }).catch(() => {
        // Return empty data for API failures
        if (url.pathname.includes('/api/')) {
          return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response('Network error', { status: 503 });
      })
    );
    return;
  }
  
  // For other requests: Network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses for non-API requests
        if (response.status === 200 && !url.pathname.includes('/api/')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        // Try to get from cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If it's a navigation request, show offline page
        if (event.request.mode === 'navigate') {
          const offlineResponse = await caches.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
        }
        
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});

// ===== MESSAGE HANDLER - FORCE PURGE ON DEMAND =====
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FORCE_PURGE_CACHE') {
    console.log('[SW] Received FORCE_PURGE_CACHE command');
    
    event.waitUntil(
      (async () => {
        // Delete all caches
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        
        // Notify client
        event.source.postMessage({
          type: 'CACHE_PURGED',
          success: true
        });
        
        console.log('[SW] Force purge complete');
      })()
    );
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline actions (disabled for chat)
self.addEventListener('sync', (event) => {
  // Do not sync chat data
  console.log('[SW] Sync event ignored for:', event.tag);
});

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' }
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'AITravelglobe', options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
