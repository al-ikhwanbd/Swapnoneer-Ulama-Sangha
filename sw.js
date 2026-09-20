const CACHE='swapnoneer-v64-shell';
const ASSETS=['./','./index.html','./style.css','./script.js','./offline-db.js','./supabase-config.js','./manifest.json','./icon-192.png','./icon-512.png','./favicon.png','./Swapnoneer%20logo.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{})).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c)).catch(()=>{});return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));});
