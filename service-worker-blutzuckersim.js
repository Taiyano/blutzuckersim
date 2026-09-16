/*

//Service-Worker for PWA and Page caching

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-page";
const offlineFallbackPage = "sim.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {

        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});

*/


//NoWorkbox Script
 
const CACHE = "pwabuilder-page-v1"; // bump the version suffix to invalidate old caches
const offlineFallbackPage = "sim.html";
 
// cache.addAll() is all-or-nothing — if any URL here 404s, install fails.
// Add more of your site's core files here once you've confirmed the paths.
const PRECACHE_URLS = [offlineFallbackPage];
 
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});
 
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Drop any caches left over from a previous CACHE name/version.
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
      );
 
      // Native navigation preload (no library needed).
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );
});
 
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
 
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
 
  // Page navigations.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResp = await event.preloadResponse;
          if (preloadResp) return preloadResp;
          return await fetch(request);
        } catch (error) {
          const cache = await caches.open(CACHE);
          return (
            (await cache.match(request)) ||
            (await cache.match(offlineFallbackPage))
          );
        }
      })()
    );
    return;
  }
 
  // Static assets: cache-first, then network (caching the response for next time).
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
 
      const response = await fetch(request);
      if (response.ok && response.type === "basic") {
        event.waitUntil(cache.put(request, response.clone()));
      }
      return response;
    })()
  );
});
