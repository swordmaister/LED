// キャッシュするファイルの名前とバージョン
const CACHE_NAME = 'my-app-v1';
// キャッシュするアセットのリスト
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/icon-192x192.png',
    // 他のJavaScriptファイルや画像など、オフラインで必要なすべてのファイルを含める
];

// Service Workerのインストール (最初に実行される)
self.addEventListener('install', (event) => {
    // キャッシュをオープンし、アセットを格納する
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Service Workerのフェッチ (リソースを取得するたびに実行される)
self.addEventListener('fetch', (event) => {
    // リクエストに対し、キャッシュをチェックし、あればそれを返す。なければネットワークへ。
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュに見つかった場合
                if (response) {
                    return response;
                }
                // キャッシュになかった場合、ネットワークにリクエスト
                return fetch(event.request);
            })
    );
});

// Service Workerのアクティベート (古いキャッシュのクリーンアップ)
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // ホワイトリストにない古いキャッシュを削除
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
