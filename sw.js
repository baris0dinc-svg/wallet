/* Çevrimdışı çalışma: önce önbellek, ağdan gelen yeni sürümü arka planda günceller. */
const CACHE = 'wallet-v33';
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest', 'bist.json', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => {
  // cache:'reload' → tarayıcı önbelleğindeki eski kopyayı değil, sunucudaki yeni dosyayı al
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  const u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.endsWith('rates.json')) return;
  e.respondWith(caches.match(r).then(hit => {
    const net = fetch(r.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
