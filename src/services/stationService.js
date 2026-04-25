import { apiRequest } from '../lib/api'
import { supabase } from '../lib/supabase'

// Map Supabase DB schema → frontend expectations
const mapStation = (s) => ({
  ...s,
  id: s.id,
  slug: s.slug || s.id,
  name: s.name || 'Unknown Station',
  city: s.city || '',
  address: s.address || '',
  lat: Number(s.lat),
  lng: Number(s.lng),
  totalChargers: (s.chargers?.length) || s.total_slots || 0,
  availableChargers: s.chargers ? s.chargers.filter(c => c.status === 'available').length : 0,
  rating: (s.rating !== null && s.rating !== undefined) ? Number(s.rating) : 0,
  reviewCount: s.review_count || 0,
  totalReviews: s.review_count || (s.reviews?.length) || 0,
  tags: s.station_tags?.map(t => t.tags?.name).filter(Boolean) || [],
  // Facilities is now a JSONB array ["WiFi", "Parking"]
  facilities: Array.isArray(s.facilities) ? s.facilities : (s.amenities || []),
  status: s.status === 'maintenance' ? 'faulty' : (s.status || 'active'),
  openHours: s.open_hours || '24/7',
  distance: s.distance || 0,
  pricePerKwh: s.price_per_kwh != null ? s.price_per_kwh : 18.00,
  connectorTypes: s.connector_types || [],
  isExternal: false,
  source: 'ChargeNet',
  // Inject expanded data
  reviews: s.reviews || [],
  chargers: (s.chargers || []).map(c => ({
    ...c,
    powerKw: c.power_kw,
    plugType: c.type,
    // Add defaults for missing fields if any
    company: 'ChargeNet',
    appName: 'ChargeNet',
    pricePerKwh: c.price_per_kwh,
    sessionsToday: Math.floor(Math.random() * 10), // Mocked for UI
    lastActiveAt: new Date().toISOString()
  }))
})

// Safety dedup by station ID
export const deduplicateStations = (stations) => {
  const seen = new Set()
  return stations.filter(station => {
    if (seen.has(station.id)) {
      return false
    }
    seen.add(station.id)
    return true
  })
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const fetchAllStations = async (filters = {}) => {
  try {
    const params = new URLSearchParams()
    if (filters.city) params.set('city', filters.city)
    if (filters.search) params.set('search', filters.search)
    if (filters.limit) params.set('limit', filters.limit || 200)

    // Always get all stations
    params.set('limit', '200')

    const url = `${API_URL}/api/v1/stations?${params.toString()}`

    console.log('[Frontend] Fetching:', url)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const result = await response.json()

    console.log('[Frontend] Success:', result.success)
    console.log('[Frontend] Stations:', result.data?.stations?.length)

    // API returns { success, data: { stations: [] }, meta }
    const stationsRaw = result.data?.stations || result.stations || result.data || []
    const stations = deduplicateStations(stationsRaw.map(mapStation))

    console.log('[Frontend] Returning:', stations.length, 'stations')

    return stations
  } catch (err) {
    console.error('[Frontend] Fetch error:', err)
    return []
  }
}

export const getStations = async (filters = {}) => {
  console.log('[Service] Fetching stations from Express API with filters:', filters)
  
  try {
    const query = new URLSearchParams()
    if (filters.page) query.append('page', filters.page)
    query.append('limit', filters.limit || '200') // Default to 200
    if (filters.city) query.append('city', filters.city)
    if (filters.search) query.append('search', filters.search)
    
    const response = await apiRequest(`/api/v1/stations?${query.toString()}`)
    
    // The server returns nested data in { success, data: { stations: [...] }, meta }
    const stationsRaw = response.data?.stations || response.stations || response.data || []
    const stations = deduplicateStations(stationsRaw.map(mapStation))
    
    return { 
      success: true, 
      count: stations.length, 
      data: stations,
      meta: response.meta
    }
  } catch (err) {
    console.error('[Service] Fetch failed:', err)
    return { success: false, count: 0, data: [], error: err.message }
  }
}


export const getStationById = async (idOrSlug) => {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
  
  try {
    const endpoint = isUUID 
      ? `/api/v1/stations/${idOrSlug}`
      : `/api/v1/stations/slug/${idOrSlug}`
      
    const response = await apiRequest(endpoint)
    return { success: true, data: response.data?.station ? mapStation(response.data.station) : (response.data ? mapStation(response.data) : null) }
  } catch (err) {
    console.error(`[Service] Failed to fetch station ${idOrSlug}:`, err.message)
    throw err
  }
}

export const createStation = async (stationData) => {
  try {
    const response = await apiRequest('/api/v1/stations', {
      method: 'POST',
      body: JSON.stringify(stationData)
    })
    return { success: true, data: response.data }
  } catch (err) {
    throw err
  }
}

export const updateStation = async (id, stationData) => {
  try {
    const response = await apiRequest(`/api/v1/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stationData)
    })
    return { success: true, data: response.data }
  } catch (err) {
    throw err
  }
}

export const deleteStation = async (id) => {
  try {
    await apiRequest(`/api/v1/stations/${id}`, {
      method: 'DELETE'
    })
    return { success: true }
  } catch (err) {
    throw err
  }
}

export const getMyStations = async () => {
  // We can still use Supabase for some things if the endpoints aren't ready,
  // but for the refactor we should use the API.
  // Assuming there's a specialized "my stations" endpoint or we filter getStations.
  // Actually, standardizing on the API is better.
  try {
    const response = await apiRequest('/api/v1/stations') // If we add a /my-stations route later
    // For now, let's keep it as is or update if server supports it.
    // The current server stationRoutes.js has getAll, create, getOne, update, delete.
    return { success: true, data: (response.data.stations || []).map(mapStation) }
  } catch (err) {
    throw err
  }
}

export const getNearbyStations = async (lat, lng, radius = 500) => {
  // Current server doesn't have radius search in the controller yet, 
  // so this will just fetch all/city.
  return getStations({ lat, lng, radius })
}
