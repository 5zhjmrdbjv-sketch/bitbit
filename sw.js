const CACHE_NAME = 'btc-dash-v1';
const urlsToCache = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // APIリクエストなどはキャッシュせずそのままネットワークへ通す
        if (event.request.url.includes('api.coingecko.com') || event.request.url.includes('bitflyer.com')) {
          return fetch(event.request);
        }
        return response || fetch(event.request);
      })
  );
});