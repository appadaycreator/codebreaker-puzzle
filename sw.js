const CACHE_NAME = 'codebreaker-v5';
const CACHE_EXTERNAL = 'codebreaker-external-v1';
const urlsToCache = [
  '/codebreaker-puzzle/',
  '/codebreaker-puzzle/index.html',
  '/codebreaker-puzzle/howto.html',
  '/codebreaker-puzzle/contact.html',
  '/codebreaker-puzzle/privacy-policy.html',
  '/codebreaker-puzzle/terms.html',
  '/codebreaker-puzzle/manifest.json',
  '/codebreaker-puzzle/favicon.ico',
  '/codebreaker-puzzle/icon-192.png',
  '/codebreaker-puzzle/icon-512.png'
];
const externalURLs = [
  'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Noto+Sans+JP:wght@300;400;500;700&display=swap'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME)
        .then(function(cache) {
          return cache.addAll(urlsToCache);
        }),
      caches.open(CACHE_EXTERNAL)
        .then(function(cache) {
          return Promise.all(
            externalURLs.map(url => cache.add(url).catch(() => null))
          );
        })
    ])
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('fetch', function(event) {
  const url = event.request.url;

  // ローカルリソースはキャッシュファースト
  if (url.includes('/codebreaker-puzzle/')) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          return response || fetch(event.request)
            .then(function(networkResponse) {
              if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
                const cacheToUse = url.includes(CACHE_EXTERNAL) ? CACHE_EXTERNAL : CACHE_NAME;
                const clonedResponse = networkResponse.clone();
                caches.open(cacheToUse).then(cache => cache.put(event.request, clonedResponse));
              }
              return networkResponse;
            });
        })
        .catch(function() {
          return caches.match('/codebreaker-puzzle/index.html');
        })
    );
  }
  // 外部CDNはネットワークファースト
  else if (url.includes('cdn.jsdelivr.net') || url.includes('fonts.googleapis.com')) {
    event.respondWith(
      fetch(event.request)
        .then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            const clonedResponse = networkResponse.clone();
            caches.open(CACHE_EXTERNAL).then(cache => cache.put(event.request, clonedResponse));
          }
          return networkResponse;
        })
        .catch(function() {
          return caches.match(event.request);
        })
    );
  } else {
    // その他はネットワークのみ（Google Analytics等）
    event.respondWith(fetch(event.request).catch(() => null));
  }
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME && cacheName !== CACHE_EXTERNAL) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
}); 