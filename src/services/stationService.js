import { apiRequest } from '../lib/api'

// Helper to map backend schema to frontend expectations
const mapStation = (s) => ({
  ...s,
  id: s.id,
  name: s.name,
  city: s.city,
  address: s.address,
  lat: s.lat,
  lng: s.lng,
  totalChargers: s.total_slots || 0,
  availableChargers: Math.max(0, (s.total_slots || 2) - 1), // mock available chargers for visual flair
  rating: s.rating !== null ? Number(s.rating) : 4.5,
  totalReviews: s.total_reviews || 0,
  facilities: (s.amenities || []).reduce((acc, amenity) => {
    acc[amenity] = true;
    return acc;
  }, {}),
  status: s.status === 'maintenance' ? 'faulty' : (s.status || 'active'),
  openHours: s.open_hours || '24/7',
  distance: s.distance || Math.floor(Math.random() * 5000), 
  pricePerKwh: s.price_per_kwh || 15
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

export const getNearbyStations = async (lat, lng, radius = 10) => {
  const res = await apiRequest('GET', `/stations?lat=${lat}&lng=${lng}&radius=${radius}`)
  return { ...res, data: (res.data || []).map(mapStation) }
}
