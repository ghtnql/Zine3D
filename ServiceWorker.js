const cacheName = "ghtnql-Zine 3D-2.3.0-unlocked-v6";
const contentToCache = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "TemplateData/style.css",
  "TemplateData/icon.png",
  "TemplateData/start-screen.png",
  "Build/b23dd96997961653e2825455633aac82.loader.js",
  "Build/b0663254000dd8daf4cf3a624ba37862.framework.js.unityweb",
  "Build/9026780b0a808938b7963cf141747122.data.unityweb",
  "Build/361d5e0c47a350a8dc461610527df2ed.wasm.unityweb"
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
