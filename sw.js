const CACHE_NAME = 'arcled-cache-v1';
// キャッシュするファイル（HTMLファイル自身とService Worker、マニフェストを除く）
const urlsToCache = [
  './',
  'manifest.json',
  // HTMLファイル自身はキャッシュされないため、index.htmlのような名前ではなく './' を使用します
  // 実際にはHTMLが読み込まれるので、index.htmlというファイル名の場合は 'index.html' も追加します
  // 今回のコードでは、このHTMLファイルを 'index.html' として保存することを想定しています
  'index.html',
  // 必要に応じて、'icon-192.png' などのアイコン画像もキャッシュリストに追加してください
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
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
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 新しいバージョン以外のキャッシュを削除
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
