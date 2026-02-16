const CACHE_VERSION = "diary-static-v20260216-1";
const RUNTIME_CACHE = "diary-runtime-v20260216-1";

// ⚠️ 不确定因素: 如果后续静态资源路径/文件名变化，需要同步更新该列表并升级缓存版本。
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/doing.html",
  "/manifest.json",
  "/css/style.css",
  "/config/env.js?v=2",
  "/config/env.js?v=3",
  "/js/doing.js?v=2",
  "/js/storage-server.js?v=3",
  "/js/api.js?v=3",
  "/js/offline.js?v=3",
  "/js/ui.js?v=3",
  "/js/app.js?v=3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API 请求始终走网络，避免离线缓存污染服务器数据。
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  const acceptsHTML = request.headers.get("accept")?.includes("text/html");
  if (request.mode === "navigate" || acceptsHTML || url.pathname.endsWith(".html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match("/doing.html") || caches.match("/index.html");
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
        return response;
      });
    })
  );
});
