const CACHE_NAME = 'arcled-cache-v2';
// キャッシュ対象のファイルリスト（HTML、マニフェスト、SW、アイコンなど）
const urlsToCache = [
  './', // ルートパス (サイトの開始URL)
  'index.html', // 本体ファイル
  'manifest.json', // マニフェストファイル
  'sw.js', // Service Worker ファイル自身
  // 必要に応じて、'icon-192.png' などのアイコン画像も追加してください
];

self.addEventListener('install', (event) => {
  console.log('SW: Install event triggered.');
  // キャッシュを開き、urlsToCache のファイルを全て追加
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching App Shell');
        return cache.addAll(urlsToCache).catch(error => {
            console.error('SW: Cache addAll failed:', error);
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  // ネットワークリクエストが発生したら、キャッシュを優先して応答
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュがあればそれを使用
        if (response) {
          return response;
        }
        // キャッシュがなければネットワークから取得
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('SW: Activate event triggered.');
  const cacheWhitelist = [CACHE_NAME];
  // 古いキャッシュを削除
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
