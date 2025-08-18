// Service Worker for Medical Training Platform
const CACHE_NAME = "medtrain-v1.0.0";
const STATIC_CACHE = "medtrain-static-v1.0.0";
const DYNAMIC_CACHE = "medtrain-dynamic-v1.0.0";

// Files to cache immediately
const STATIC_FILES = [
  "/",
  "/index.html",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Caching static files");
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log("Static files cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Failed to cache static files:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith("/api/")) {
    // API requests - network first, cache fallback
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.startsWith("/static/")) {
    // Static assets - cache first, network fallback
    event.respondWith(handleStaticRequest(request));
  } else {
    // HTML pages - network first, cache fallback
    event.respondWith(handlePageRequest(request));
  }
});

// Handle API requests
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("API request failed, trying cache:", error);

    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response
    return new Response(
      JSON.stringify({ error: "Offline - Please check your connection" }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("Static asset request failed:", error);
    return new Response("Offline", { status: 503 });
  }
}

// Handle page requests
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("Page request failed, trying cache:", error);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    return caches.match("/offline.html") || new Response("Offline");
  }
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle background sync
async function doBackgroundSync() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions();

    for (const action of pendingActions) {
      try {
        await processPendingAction(action);
        await removePendingAction(action.id);
      } catch (error) {
        console.error("Failed to process pending action:", error);
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// Get pending actions from IndexedDB
async function getPendingActions() {
  // This would integrate with your IndexedDB implementation
  // For now, return empty array
  return [];
}

// Process a pending action
async function processPendingAction(action) {
  // This would process different types of pending actions
  // For example, submitting case results, syncing progress, etc.
  console.log("Processing pending action:", action);
}

// Remove a processed pending action
async function removePendingAction(actionId) {
  // This would remove the action from IndexedDB
  console.log("Removing pending action:", actionId);
}

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event);

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey,
      },
      actions: [
        {
          action: "explore",
          title: "View",
          icon: "/icons/icon-192x192.png",
        },
        {
          action: "close",
          title: "Close",
          icon: "/icons/icon-192x192.png",
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// Message handling from main thread
self.addEventListener("message", (event) => {
  console.log("Message received in service worker:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Error handling
self.addEventListener("error", (event) => {
  console.error("Service Worker error:", event.error);
});

// Unhandled rejection handling
self.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker unhandled rejection:", event.reason);
});
