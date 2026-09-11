const CACHE_NAME = "qs-nexus-shell-v2"
const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/qs-nexus-logo.svg",
  "/favicon.svg",
  "/offline.html",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  const url = new URL(request.url)

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request))
    return
  }

  if (!isCacheableAsset(request, url)) return

  event.respondWith(handleAsset(request))
})

async function handleNavigation(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      await cacheResponse("/index.html", response.clone())
    }
    return response
  } catch {
    try {
      return (await caches.match("/index.html")) || (await caches.match("/offline.html")) || offlineResponse()
    } catch {
      return offlineResponse()
    }
  }
}

async function handleAsset(request) {
  try {
    const cached = await caches.match(request)
    if (cached) return cached

    const response = await fetch(request)
    if (response.ok && response.type === "basic") {
      await cacheResponse(request, response.clone())
    }
    return response
  } catch {
    return new Response(null, { status: 503, statusText: "Offline" })
  }
}

function isCacheableAsset(request, url) {
  return request.destination !== "" || url.pathname === "/manifest.webmanifest"
}

async function cacheResponse(request, response) {
  try {
    const cache = await caches.open(CACHE_NAME)
    await cache.put(request, response)
  } catch {}
}

function offlineResponse() {
  return new Response("Offline", {
    status: 503,
    statusText: "Offline",
    headers: { "Content-Type": "text/plain" },
  })
}
