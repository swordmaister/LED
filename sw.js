// sw.js (index.html と同じ階層に保存してください)

const CACHE_NAME = 'pwa-cache-v2'; // ★バージョン番号を上げることが重要！
const urlsToCache = [
    './',          // ★重要: アプリのルートパス (GitHub Pages の場合はリポジトリのルート)
    'index.html',  // ★重要: HTML ファイル自体
    'sw.js',
];

// Service Worker のインストール
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                // ブラウザのキャッシュが原因で index.html が古いままになるのを避けるため、
                // リクエストのモードを 'no-cache' に設定してネットワークから取得を試みる
                const fetchPromises = urlsToCache.map(url => {
                    return fetch(url, { cache: "no-cache" }).then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            // ネットワークエラーなどで取得失敗した場合、ログに出力して処理を続行
                            console.error(`[Service Worker] Failed to fetch ${url} for caching.`);
                            return new Response('', { status: 404 });
                        }
                        return cache.put(url, response);
                    });
                });
                return Promise.all(fetchPromises);
            })
            .catch((error) => {
                console.error('[Service Worker] Caching failed:', error);
            })
    );
    self.skipWaiting();
});

// Service Worker のアクティベート (古いキャッシュの削除など)
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// リクエストの処理 (キャッシュから提供 or ネットワークから取得)
self.addEventListener('fetch', (event) => {
    // 自身のオリジンからのすべてのリクエストを処理
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュに見つかったらそれを返す
                if (response) {
                    return response;
                }
                // キャッシュになかったらネットワークから取得
                return fetch(event.request);
            })
    );
});
