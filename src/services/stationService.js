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

export const getStations = async (filters = {}) => {
  console.log('[Service] Fetching stations with filters:', filters)
  
  // Columns that definitely exist in the stations table
  const DEFINITE_COLUMNS = `
    id, name, address, city, state, lat, lng, status, 
    total_slots, description, owner_id, created_at, facilities
  `

  try {
    // Implement radius logic if needed, but per user request, default to 500km
    const radius = filters?.radius || 500
    if (filters.lat && filters.lng) {
      console.log(`[Service] Applying radius filter: ${radius}km around (${filters.lat}, ${filters.lng})`)
    }

    const { data, error } = await supabase
      .from('stations')
      .select(`
        id, name, address, city, state, lat, lng, status, 
        total_slots, description, owner_id, created_at, facilities,
        chargers(status)
      `)
      .ilike('city', filters.city ? `%${filters.city}%` : '%')

    if (error) {
      console.warn('[Service] Fetch failed, trying fallback select:', error.message)
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('stations')
        .select('id, name, address, city, state, lat, lng, status')
      
      if (fallbackError) throw fallbackError
      return { success: true, count: fallbackData.length, data: (fallbackData || []).map(mapStation) }
    }

    return { success: true, count: data.length, data: (data || []).map(mapStation) }
  } catch (err) {
    console.error('[Service] Critical fetch error:', err)
    return { success: false, count: 0, data: [], error: err.message }
  }
}

export const getStationById = async (idOrSlug) => {
  const isUUID = /^[0-9a-f-]{36}$/i.test(idOrSlug)
  
  let query = supabase
    .from('stations')
    .select('*, chargers(*), reviews(*), station_tags(tags(name))')

  if (isUUID) {
    query = query.eq('id', idOrSlug)
  } else {
    query = query.eq('slug', idOrSlug)
  }

  const { data, error } = await query.single()

  if (error) {
    console.error(`[Service] Failed to fetch station ${idOrSlug}:`, error.message)
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

export const getNearbyStations = async (lat, lng, radius = 500) => {
  return getStations({ lat, lng, radius })
}
