import { supabase } from '../lib/supabase'

// Map Supabase DB schema → frontend expectations
const mapStation = (s) => ({
  ...s,
  id: s.id,
  name: s.name || 'Unknown Station',
  city: s.city || '',
  address: s.address || '',
  lat: Number(s.lat),
  lng: Number(s.lng),
  totalChargers: (s.chargers?.length) || s.total_slots || 0,
  availableChargers: s.chargers ? s.chargers.filter(c => c.status === 'available').length : 0,
  rating: (s.rating !== null && s.rating !== undefined) ? Number(s.rating) : 4.5,
  totalReviews: s.total_reviews || (s.reviews?.length) || 0,
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

export const getStations = async (filters = {}) => {
  console.log('[Service] Fetching stations with filters:', filters)
  // Fetch stations with chargers count for availability info
  let query = supabase.from('stations').select('*, chargers(status)')
  
  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`)
  }

  const { data, error } = await query

  console.log('[Service] Supabase Raw Data:', data)
  console.log('[Service] Supabase Error:', error)

  if (error) {
    console.error('[Service] Failed to fetch stations:', error.message)
    throw error
  }

  let mapped = (data || []).map(mapStation)
  console.log(`[Service] Total stations before filtering: ${mapped.length}`)

  // Radius filtering removed as requested to ensure all stations show on map.
  console.log(`[Service] Returning all ${mapped.length} stations.`)

  return { success: true, count: mapped.length, data: mapped }
}

export const getStationById = async (id) => {
  const { data, error } = await supabase
    .from('stations')
    .select('*, chargers(*), reviews(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`[Service] Failed to fetch station ${id}:`, error.message)
    throw error
  }

  return { success: true, data: data ? mapStation(data) : null }
}

export const createStation = async (data) => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data: created, error } = await supabase
    .from('stations')
    .insert([{ ...data, owner_id: user?.id }])
    .select()
    .single()

  if (error) throw error
  return { success: true, data: created }
}

export const updateStation = async (id, data) => {
  const { data: updated, error } = await supabase
    .from('stations')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return { success: true, data: updated }
}

export const deleteStation = async (id) => {
  const { error } = await supabase
    .from('stations')
    .delete()
    .eq('id', id)

  if (error) throw error
  return { success: true }
}

export const getMyStations = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, data: [] }

  const { data, error } = await supabase
    .from('stations')
    .select('*')
    .eq('owner_id', user.id)

  if (error) throw error
  return { success: true, count: data.length, data: (data || []).map(mapStation) }
}

export const getNearbyStations = async (lat, lng, radius = 50) => {
  return getStations({ lat, lng, radius })
}
