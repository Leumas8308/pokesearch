const prefix='pokesearch:'+self.registration.scope+':';
const cacheName=prefix+'9a2aa61c6f6a';
const files=["./index.html", "./style.css", "./app.js", "./predict.js", "./assets/database.json", "./assets/sprites-0.png", "./assets/sprites-1.png", "./assets/sprites-2.png", "./assets/sprites-3.png", "./assets/sprites-4.png", "./assets/sprites-5.png"];

self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(cacheName);
  await cache.addAll(files.map(path => new Request(new URL(path,self.registration.scope),{cache:'reload'})));
  await self.skipWaiting();
})()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) {
    if (key.startsWith(prefix) && key!==cacheName) await caches.delete(key);
  }
  await self.clients.claim();
})()));
const urls=new Set(files.map(path=>new URL(path,self.registration.scope).href));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);url.search='';
  const key=url.href===self.registration.scope ? new URL('./index.html',self.registration.scope).href : url.href;
  if(urls.has(key)) event.respondWith(caches.open(cacheName).then(async c=>await c.match(key)||fetch(event.request)));
});
