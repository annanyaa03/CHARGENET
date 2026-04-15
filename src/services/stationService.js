import { apiRequest } from '../lib/api'

// Map backend/external schema → frontend expectations
const mapStation = (s) => ({
  ...s,
  id: s.id,
  name: s.name || 'Unknown Station',
  city: s.city || '',
  address: s.address || '',
  lat: s.lat,
  lng: s.lng,
  totalChargers: s.total_slots || s.available_slots || 2,
  availableChargers: s.is_external
    ? (s.available_slots || s.total_slots || 2)
    : Math.max(0, (s.total_slots || 2) - 1),
  rating: (s.rating !== null && s.rating !== undefined) ? Number(s.rating) : 4.2,
  totalReviews: s.total_reviews || 0,
  facilities: Array.isArray(s.amenities)
    ? s.amenities.reduce((acc, amenity) => { acc[amenity] = true; return acc; }, {})
    : (s.amenities || {}),
  status: s.status === 'maintenance' ? 'faulty' : (s.status || 'active'),
  openHours: s.open_hours || '24/7',
  distance: s.distance || 0,
  pricePerKwh: s.price_per_kwh != null ? s.price_per_kwh : 14,
  connectorTypes: s.connector_types || [],
  isExternal: s.is_external || false,
  source: s.source || 'ChargeNet'
})

export const getStations = async (filters) => {
  const res = await apiRequest('GET', `/stations?${new URLSearchParams(filters)}`)
  return { ...res, data: (res.data || []).map(mapStation) }
}

export const getStationById = async (id) => {
  const res = await apiRequest('GET', `/stations/${id}`)
  return { ...res, data: res.data ? mapStation(res.data) : null }
}

export const createStation = (data) => apiRequest('POST', '/stations', data)
export const updateStation = (id, data) => apiRequest('PUT', `/stations/${id}`, data)
export const deleteStation = (id) => apiRequest('DELETE', `/stations/${id}`)

export const getMyStations = async () => {
  const res = await apiRequest('GET', '/stations/owner/my')
  return { ...res, data: (res.data || []).map(mapStation) }
}

export const getNearbyStations = async (lat, lng, radius = 15) => {
  const res = await apiRequest('GET', `/stations?lat=${lat}&lng=${lng}&radius=${radius}&include_external=true`)
  return { ...res, data: (res.data || []).map(mapStation) }
}
