const cacheName = "ghtnql-Zine 3D-2.4.0-ui-v6";
const contentToCache = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "TemplateData/style.css",
  "TemplateData/leaderboard.js",
  "TemplateData/icon.png",
  "TemplateData/start-screen.png",
  "Build/b23dd96997961653e2825455633aac82.loader.js",
  "Build/098c12ac9dd5c9b3469d5aad0108741b.framework.js.unityweb",
  "Build/90ea29f0553bc8e69cdd13fce0d7fbf8.data.unityweb",
  "Build/3ecb341605b9ae3914713079c69102ad.wasm.unityweb"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(cacheName)
      .then(function (cache) { return cache.addAll(contentToCache); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (key) { return key !== cacheName; }).map(function (key) {
          return caches.delete(key);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  var requestUrl = new URL(event.request.url);

  // API responses must always come from the network. Caching cross-origin
  // leaderboard requests leaves players looking at an old ranking snapshot.
  if (requestUrl.origin !== self.location.origin || requestUrl.pathname.startsWith("/api/")) return;

  var pathname = requestUrl.pathname;
  if (pathname.endsWith("/leaderboard-config.js")) return;

  if (pathname.endsWith("/TemplateData/leaderboard.js")) {
    event.respondWith(
      fetch(event.request).then(function (response) {
        if (response && response.ok) {
          var copy = response.clone();
          caches.open(cacheName).then(function (cache) { cache.put(event.request, copy); });
        }
        return response;
      }).catch(function () { return caches.match(event.request); })
    );
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).then(function (response) {
        if (response && response.ok) {
          var copy = response.clone();
          caches.open(cacheName).then(function (cache) { cache.put(event.request, copy); });
        }
        return response;
      }).catch(function () {
        return caches.match(event.request).then(function (cached) { return cached || caches.match("index.html"); });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (response) {
        if (!response || !response.ok) return response;
        var copy = response.clone();
        caches.open(cacheName).then(function (cache) { cache.put(event.request, copy); });
        return response;
      });
    })
  );
});
