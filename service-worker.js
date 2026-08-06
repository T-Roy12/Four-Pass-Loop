const CACHE = 'four-pass-final-v1';
const ASSETS = [
  './', './index.html', './styles.css', './app.js', './manifest.webmanifest', './icon.svg',
  './images/maroon-scene.svg', './images/pass-scene.svg', './images/snowmass-scene.svg',
  './images/permit-east-fork.png', './images/permit-upper-snowmass.png',
  './images/shuttle-voucher.png', './shuttle-vouchers.pdf'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener('fetch', event => event.respondWith(caches.match(event.request).then(response => response || fetch(event.request))));
