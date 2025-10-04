const CACHE_NAME = 'arcled-cache-v1';
// オフライン時にキャッシュしておくファイルを指定します。
// 今回はHTMLファイルにすべて含まれているため、'/' (ルート) だけで十分です。
const urlsToCache = [
  '/',
  'index.html', // index.html というファイル名で保存する場合
];

// Service Workerのインストール処理
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// ネットワークリクエストがあった際の処理
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュにリソースがあればそれを返し、なければネットワークから取得します。
        return response || fetch(event.request);
      })
  );
});

// 古いキャッシュの削除
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
