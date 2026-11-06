/* Çevrimdışı çalışma: önce önbellek, ağdan gelen yeni sürümü arka planda günceller. */
const CACHE = 'wallet-v1';
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.match(r).then(hit => {
    const net = fetch(r).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(r, res.clone())); return res; }).catch(() => hit);
    return hit || net;
  }));
});
