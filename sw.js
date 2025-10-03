// sw.js (index.html と同じ階層に保存してください)

const CACHE_NAME = 'pwa-cache-v3'; // ★ バージョンを v3 に更新！
const urlsToCache = [
    './',          // 現在のディレクトリのインデックス (index.htmlとして機能することが多い)
    'index.html',  // HTML ファイル自体
    'sw.js',       // Service Worker 自体
    // NOTE: 外部のアセット（画像、フォントなど）がないため、これ以上は追加しません。
];

// Service Worker のインストール
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install (v3)');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                
                // キャッシュに失敗しないよう、fetch のオプションを削除し、
                // リストにあるアセットをシンプルにキャッシュに加えます。
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                // ここでエラーが出ると「オフライン化に失敗しました！」となります。
                console.error('[Service Worker] Caching failed (AddAll Error):', error);
                // 失敗した場合はPromise.rejectを返してインストールを失敗させます
                throw error; 
            })
    );
    self.skipWaiting();
});

// Service Worker のアクティベート (古いキャッシュの削除など)
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate (v3)');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheName.startsWith('pwa-cache-v')) return; // 自分のキャッシュ名のみ対象
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

// リクエストの処理
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
