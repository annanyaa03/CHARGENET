import supabase from '../lib/supabase.js'

export const stationService = {

  getAll: async ({ 
    city, status, limit, offset, search 
  } = {}) => {
    let query = supabase
      .from('stations')
      .select(`
        id, name, address, city, state,
        lat, lng, status, slug, rating,
        review_count, total_slots,
        available_slots, description,
        facilities, open_hours, created_at
      `, { count: 'exact' })
      .eq('status', status || 'active')
      .range(
        parseInt(offset || 0),
        parseInt(offset || 0) + 
          parseInt(limit || 50) - 1
      )

    if (city) query = query.eq('city', city)
    if (search) query = query.ilike(
      'name', `%${search}%`
    )

    const { data, error, count } = await query
    if (error) throw error
    return { stations: data || [], total: count }
  },

  getById: async (id) => {
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
    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    if (!data) {
      const err = new Error('Station not found')
      err.status = 404
      throw err
    }
    return data
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
