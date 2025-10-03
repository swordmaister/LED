// sw.js (index.html と同じ階層に保存してください)

const CACHE_NAME = 'pwa-cache-v1'; // キャッシュのバージョン管理
const urlsToCache = [
    '/', // アプリのルート (index.html が通常これに該当)
    'index.html', // アプリのメインファイル (仮に index.html とします)
    'sw.js', // Service Worker 自体
    // NOTE: CSS や JS は index.html にインラインで含まれているため、
    // ここでキャッシュ対象に追加する必要があるのは上記ファイルのみです。
    // もし外部ファイル化された CSS/JS があれば、ここに追加してください。
];

// Service Worker のインストール
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('[Service Worker] Caching failed:', error);
            })
    );
    self.skipWaiting(); // 新しい Service Worker がすぐにアクティブになるようにする
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
    // クライアントを制御下に置く
    return self.clients.claim();
});

// リクエストの処理 (キャッシュから提供 or ネットワークから取得)
self.addEventListener('fetch', (event) => {
    // 自身 (index.html) からのすべてのリクエストを処理
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
