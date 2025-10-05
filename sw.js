// 新しい sw.js の内容（強制解除用）

self.addEventListener('install', event => {
    // 新しいSWがインストールされたらすぐに有効化する（古いSWを追い出す）
    self.skipWaiting(); 
});

self.addEventListener('activate', event => {
    console.log('強制解除用SWがアクティベートされました。古いSWを解除します。');
    
    // 1. 自分自身の登録を解除
    self.registration.unregister()
        .then(() => {
            console.log('Service Worker: 強制解除成功。');
        })
        .catch(error => {
            console.error('Service Worker: 強制解除失敗', error);
        });

    // 2. 既存の全キャッシュをクリア
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key.startsWith('arcled-cache-')) { 
                    console.log('Cache: 削除中', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});
