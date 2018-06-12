/**
 * Created by jean-marc on 10/06/2018.
 */
const staticAssets = [
  './',
  './style.css',
  './bundle.js'
];


self.addEventListener('install', async e => {
  const cache = await caches.open('todo-static');
  cache.addAll( staticAssets );

  console.log('SW installed');
});

self.addEventListener('fetch', e => {
  const req = e.request;

  e.respondWith( cacheFirst(req ) );
});


async function cacheFirst(req) {
  const cachedResponse = await caches.match( req );
  return cachedResponse || fetch( req );
}

