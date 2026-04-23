const CACHE_NAME = "supportdesk-v3";

const ASSETS = [
    "./",
    "./index.html",

    "./assets/css/reset.css",
    "./assets/css/layout.css",
    "./assets/css/components.css",
    "./assets/css/utilities.css",
    "./assets/css/variables.css",

    "./assets/js/app.js",
    "./assets/js/events.js",
    "./assets/js/ui.js",
    "./assets/js/state.js",
    "./assets/js/dom.js",
    "./assets/js/storage.js",
    "./assets/js/sync.js"
];


// =========================
// INSTALL
// =========================
self.addEventListener("install", (e) => {
    console.log("Service Worker Installing...");

    self.skipWaiting(); // 🔥 force update immediately

    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                ASSETS.map((url) =>
                    cache.add(url).catch(() => {
                        console.warn("Failed to cache:", url);
                    })
                )
            );
        })
    );
});


// =========================
// ACTIVATE
// =========================
self.addEventListener("activate", (e) => {
    console.log("Service Worker Activated");

    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log("Deleting old cache:", key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim()) // 🔥 take control immediately
    );
});


// =========================
// FETCH (Network First)
// =========================
self.addEventListener("fetch", (e) => {
    e.respondWith(
        fetch(e.request)
            .then((response) => {
                const clone = response.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, clone);
                });

                return response;
            })
            .catch(() => caches.match(e.request))
    );
});