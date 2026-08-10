const cacheName = "ghtnql-Zine 3D-2.4.0-kakao-force-landscape-v3";
const contentToCache = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "TemplateData/style.css",
  "TemplateData/leaderboard.js",
  "TemplateData/icon.png",
  "TemplateData/start-screen.png",
  "Build/b23dd96997961653e2825455633aac82.loader.js",
  "Build/5a44f6daca47c60803fc479e9735691e.framework.js.unityweb",
  "Build/cc44b80530f526d23e8daa083492b7b8.data.unityweb",
  "Build/230a1f275b4640d773fadbccc3110b71.wasm.unityweb"
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
  if (event.request.method !== "GET") {
    return;
  }

  if (new URL(event.request.url).pathname.endsWith("/leaderboard-config.js")) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).then(function (response) {
        if (response && response.ok) {
          var copy = response.clone();
          caches.open(cacheName).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      }).catch(function () {
        return caches.match(event.request).then(function (cached) {
          return cached || caches.match("index.html");
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then(function (response) {
        if (!response || !response.ok) {
          return response;
        }

        var copy = response.clone();
        caches.open(cacheName).then(function (cache) {
          cache.put(event.request, copy);
        });
        return response;
      });
    })
  );
});
