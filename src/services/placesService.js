// Overpass API (OpenStreetMap) — completely free, no API key required
// Using CORS-safe GET requests with multiple mirror fallbacks
// Docs: https://wiki.openstreetmap.org/wiki/Overpass_API

const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour

// Multiple Overpass mirrors — tries each in order if one fails
const OVERPASS_MIRRORS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

function getCacheKey(lat, lng, radius) {
  return `places_${lat.toFixed(3)}_${lng.toFixed(3)}_${radius}`
}

function getFromCache(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > CACHE_DURATION_MS) {
      sessionStorage.removeItem(key)
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
  } catch (err) {
    // Session storage may be blocked in some browsers; ignore
  }
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function categorise(el) {
  const tags = el.tags || {}
  const name = tags.name || tags['name:en'] || null
  if (!name) return null

  const lat = el.lat ?? el.center?.lat
  const lng = el.lon ?? el.center?.lon
  if (!lat || !lng) return null

  const amenity = tags.amenity
  const shop = tags.shop
  const leisure = tags.leisure

  let category = null
  if (amenity === 'restaurant') category = 'restaurant'
  else if (amenity === 'cafe' || amenity === 'coffee_shop') category = 'cafe'
  else if (amenity === 'fast_food') category = 'fastfood'
  else if (amenity === 'pharmacy') category = 'pharmacy'
  else if (amenity === 'atm' || amenity === 'bank') category = 'bank'
  else if (shop === 'supermarket' || shop === 'convenience' || shop === 'grocery') category = 'grocery'
  else if (leisure === 'park' || leisure === 'garden' || leisure === 'playground') category = 'park'
  else return null

  return { category, name, lat, lng, osmId: el.id }
}

async function tryFetch(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12000) // 12s timeout
  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    clearTimeout(timer)
    throw e
  }
}

export async function fetchNearbyPlaces(lat, lng, radiusMetres = 600) {
  const key = getCacheKey(lat, lng, radiusMetres)
  const cached = getFromCache(key)
  if (cached) return cached

  // Compact single-line Overpass QL — GET is CORS-safe unlike POST
  const query = `[out:json][timeout:20];(node["amenity"~"^(restaurant|cafe|fast_food|pharmacy|atm|bank)$"](around:${radiusMetres},${lat},${lng});node["shop"~"^(supermarket|convenience|grocery)$"](around:${radiusMetres},${lat},${lng});node["leisure"~"^(park|garden|playground)$"](around:${radiusMetres},${lat},${lng});way["leisure"~"^(park|garden)$"](around:${radiusMetres},${lat},${lng}););out center 60;`

  let json = null
  let lastError = null

  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const url = `${mirror}?data=${encodeURIComponent(query)}`
      json = await tryFetch(url)
      break // success
    } catch (e) {
      lastError = e
    }
  }

  if (!json) throw new Error(`All Overpass mirrors failed: ${lastError?.message}`)

  const places = json.elements
    .map(el => {
      const item = categorise(el)
      if (!item) return null
      const distance = haversineDistance(lat, lng, item.lat, item.lng)
      if (distance > radiusMetres + 150) return null
      return { ...item, distance }
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance)

  const grouped = {
    restaurants: places.filter(p => ['restaurant', 'cafe', 'fastfood'].includes(p.category)),
    pharmacies:  places.filter(p => p.category === 'pharmacy'),
    grocery:     places.filter(p => p.category === 'grocery'),
    banks:       places.filter(p => p.category === 'bank'),
    parks:       places.filter(p => p.category === 'park'),
  }

  setCache(key, grouped)
  return grouped
}
