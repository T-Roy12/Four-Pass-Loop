const CACHE='four-pass-final-timeline-v2';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon.svg','./icon-512.png','./images/maroon-scene.svg','./images/pass-scene.svg','./images/snowmass-scene.svg','./images/permit-east-fork.png','./images/permit-upper-snowmass.png','./images/shuttle-voucher.png',
  './images/west-maroon-pass.jpg',
  './images/snowmass-lake.jpg',
  './images/crater-lake.jpg',
  './images/maroon-lake.jpg','./shuttle-vouchers.pdf'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));});
