const CACHE_NAME = "cablesync-shell-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico"
];

// 1. Install event: Cache the core application shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Pre-caching warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch event: Stale-while-revalidate for static assets, Network-first with /index.html fallback for navigation
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // Handle SPA Navigation requests (HTML pages)
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const indexHtml = await caches.match("/index.html");
          return indexHtml || new Response("Offline - Please connect to network", { status: 503, headers: { "Content-Type": "text/plain" } });
        })
    );
    return;
  }

  // Handle Static Assets (JS, CSS, Fonts, Images)
  const isStaticAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default network fetch with cache fallback for other GET requests
  event.respondWith(
    fetch(request)
      .then((response) => {
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        return cached || Promise.reject("offline");
      })
  );
});
