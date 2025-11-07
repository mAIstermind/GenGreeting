
const CACHE_NAME = 'gengreeting-cache-v5';

// On install, we don't need to precache much, the fetch handler will do it.
self.addEventListener('install', event => {
  self.skipWaiting();
});

// On activation, clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// On fetch, use a cache-then-network strategy
self.addEventListener('fetch', event => {
  // We only want to cache GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Return response from cache if found, or fetch from network
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // If the request is successful, clone the response and store it in the cache.
          // This will cache assets from our origin and from CDNs.
          // We must be careful not to cache API calls.
          if (networkResponse && networkResponse.ok && !event.request.url.includes('generativelanguage.googleapis.com')) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            // Network failed, which is expected when offline.
            // The cache.match should have already handled this case if the asset was cached.
            // If we're here, it means we're offline and the asset isn't in cache.
            console.warn(`Fetch failed for ${event.request.url}; user may be offline.`, err);
        });

        return response || fetchPromise;
      });
    })
  );
});