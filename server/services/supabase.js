import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is required')
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY is required')
}

// Single shared Supabase client with service role key
// Import this EVERYWHERE instead of creating new clients
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default supabase;


export const bookingService = {

  getByUser: async (userId) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        stations (
          id, name, address, city, slug
        ),
        chargers (
          id, type, power_kw
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { 
        ascending: false 
      })

    if (error) throw error
    return data || []
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        stations (name, address, city),
        chargers (type, power_kw)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) {
      const err = new Error('Booking not found')
      err.status = 404
      throw err
    }
    return data
  },

  create: async (bookingData, userId) => {
    // Check charger is available
    const { data: charger } = await supabase
      .from('chargers')
      .select('status, price_per_kwh, power_kw')
      .eq('id', bookingData.charger_id)
      .single()

    if (!charger) {
      const err = new Error('Charger not found')
      err.status = 404
      throw err
    }

    if (charger.status !== 'available') {
      const err = new Error(
        'Charger is not available'
      )
      err.status = 409
      throw err
    }

    // Calculate estimated cost
    const estimated_cost = (
      parseFloat(charger.price_per_kwh || 0) *
      (charger.power_kw || 0) *
      ((bookingData.duration_minutes || 60) / 60)
    ).toFixed(2)

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        user_id: userId,
        estimated_cost,
        status: 'confirmed'
      })
      .select()
      .single()

    if (error) throw error

    // Update charger to occupied
    await supabase
      .from('chargers')
      .update({ status: 'occupied' })
      .eq('id', bookingData.charger_id)

    return data
  },

  cancel: async (id, userId) => {
    // Get booking first
    const { data: booking } = await supabase
      .from('bookings')
      .select('user_id, charger_id, status')
      .eq('id', id)
      .single()

    if (!booking) {
      const err = new Error('Booking not found')
      err.status = 404
      throw err
    }

    if (booking.user_id !== userId) {
      const err = new Error('Forbidden')
      err.status = 403
      throw err
    }

    if (booking.status === 'cancelled') {
      const err = new Error(
        'Booking already cancelled'
      )
      err.status = 409
      throw err
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Free up charger
    await supabase
      .from('chargers')
      .update({ status: 'available' })
      .eq('id', booking.charger_id)

    return data
  }
}


export const chargerService = {

  getByStation: async (stationId) => {
    const { data, error } = await supabase
      .from('chargers')
      .select('*')
      .eq('station_id', stationId)
      .order('type')

    if (error) throw error
    return data || []
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('chargers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  create: async (chargerData) => {
    const { data, error } = await supabase
      .from('chargers')
      .insert(chargerData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  updateStatus: async (id, status) => {
    const validStatuses = [
      'available', 'occupied',
      'maintenance', 'inactive'
    ]

    if (!validStatuses.includes(status)) {
      const err = new Error(
        `Invalid status. Must be: ${
          validStatuses.join(', ')
        }`
      )
      err.status = 422
      throw err
    }

    const { data, error } = await supabase
      .from('chargers')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('chargers')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}


export const reviewService = {

  getByStation: async (stationId) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('station_id', stationId)
      .order('created_at', { 
        ascending: false 
      })

    if (error) throw error
    return data || []
  },

  create: async (reviewData, userId, email) => {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        ...reviewData,
        user_id: userId,
        user_name: reviewData.user_name || 
          email?.split('@')[0] || 
          'Anonymous'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  delete: async (id, userId) => {
    const { data: review } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!review) {
      const err = new Error('Review not found')
      err.status = 404
      throw err
    }

    if (review.user_id !== userId) {
      const err = new Error('Forbidden')
      err.status = 403
      throw err
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}


export const stationService = {

  getAll: async ({ 
    city, status, limit = 20, 
    page = 1, search 
  } = {}) => {
    const limitNum = Math.min(
      parseInt(limit), 100
    )
    const pageNum = Math.max(parseInt(page), 1)
    const from = (pageNum - 1) * limitNum
    const to = from + limitNum - 1

    let query = supabase
      .from('stations')
      .select('*', { count: 'exact' })
      .eq('status', status || 'active')
      .range(from, to)

    if (city) query = query.eq('city', city)
    if (search) query = query.ilike(
      'name', `%${search}%`
    )

    const { data, error, count } = await query
    if (error) throw error
    
    return { 
      data: data || [], 
      total: count || 0,
      page: pageNum,
      limit: limitNum
    }
  },

  getById: async (id) => {
    // Validate UUID format first to avoid DB syntax error (status 500)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (!isUUID) {
      const err = new Error('Invalid station ID format')
      err.status = 400
      throw err
    }

    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) {
      const err = new Error('Station not found')
      err.status = 404
      throw err
    }
    return data
  },

  getBySlug: async (slug) => {
    if (!slug) {
      const err = new Error('Slug is required')
      err.status = 400
      throw err
    }

    // Attempt to find by slug
    const { data: bySlug, error: slugError } = await supabase
      .from('stations')
      .select('*')
      .eq('slug', slug)
      .single()

    if (bySlug && !slugError) return bySlug

    // Fallback: If slug not found, check if it's a valid UUID and try fetching by ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
    
    if (isUUID) {
      const { data: byId, error: idError } = await supabase
        .from('stations')
        .select('*')
        .eq('id', slug)
        .single()
      
      if (byId && !idError) return byId
    }

    // Final failure - not found by slug or ID
    const err = new Error('Station not found')
    err.status = 404
    throw err
  },

  create: async (stationData, userId) => {
    const slug = stationData.slug || 
      stationData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

    const { data, error } = await supabase
      .from('stations')
      .insert({
        ...stationData,
        slug,
        owner_id: userId || null,
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  update: async (id, updates, userId) => {
    // Check ownership
    const { data: station, error: fetchError } = await supabase
      .from('stations')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (fetchError || !station) {
      const err = new Error('Station not found')
      err.status = 404
      throw err
    }

    if (station.owner_id && station.owner_id !== userId) {
      const err = new Error('Forbidden')
      err.status = 403
      throw err
    }

    const { data, error } = await supabase
      .from('stations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('stations')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }
}


