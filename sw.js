// sw.js
const VERSION = "v13"; // ✅ bump: forza update cache
const CACHE = `gym-tracker-cache-${VERSION}`;

// ✅ IMPORTANTISSIMO: stessi identici URL che carichi in index.html (con ?v=...)
const ASSETS = [
  "./",
  "./index.html",
  "./style.css?v=16",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",

  "./app.core.js?v=6",
  "./app.settings.js?v=2",
  "./app.workout.js?v=5",
  "./app.timer.js?v=5",
  "./app.history.js?v=5",
  "./app.measures.js?v=6",
  "./app.measures.history.js?v=6",
  "./app.measures.history.page.js?v=6"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // HTML / navigazioni: network-first
  if (req.mode === "navigate" || (req.method === "GET" && req.headers.get("accept")?.includes("text/html"))) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req, { cache: "no-store" });
        const cache = await caches.open(CACHE);
        cache.put("./index.html", fresh.clone());
        return fresh;
      } catch {
        const cached = await caches.match("./index.html");
        return cached || new Response("Offline", { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    })());
    return;
  }

  // asset: stale-while-revalidate
  if (req.method === "GET") {
    event.respondWith((async () => {
      const cached = await caches.match(req);

      const fetchPromise = fetch(req)
        .then(async (fresh) => {
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
          return fresh;
        })
        .catch(() => null);

      return cached || (await fetchPromise) || new Response("", { status: 504 });
    })());
  }
});
