import supabase from '../lib/supabase.js'
import logger from '../lib/logger.js'

export const stationService = {

  getAll: async (filters = {}) => {
    try {
      console.log('[Station Service] getAll called')
      console.log('[Station Service] Supabase URL:', 
        process.env.SUPABASE_URL?.substring(0, 30))
      
      const limitNum = Math.min(
        parseInt(filters.limit) || 200, 500
      )
      const pageNum = Math.max(
        parseInt(filters.page) || 1, 1
      )
      const from = (pageNum - 1) * limitNum
      const to = from + limitNum - 1

      let query = supabase
        .from('stations')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .range(from, to)

      if (filters.city) {
        query = query.eq('city', filters.city)
      }
      if (filters.search) {
        query = query.ilike(
          'name', '%' + filters.search + '%'
        )
      }

      const { data, error, count } = await query
      
      console.log('[Station Service] Count:', count)
      console.log('[Station Service] Error:', error)
      console.log('[Station Service] Data length:', 
        data?.length)

      if (error) {
        console.error('[Station Service] DB Error:', 
          error)
        throw error
      }

      return { 
        data: data || [], 
        total: count || 0,
        page: pageNum,
        limit: limitNum
      }
    } catch (err) {
      console.error('[Station Service] CRASH:', err)
      throw err
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

    if (error) {
      logger.error({ err: error, stationId: id }, 'Failed to fetch station by ID')
      throw error
    }
    if (!data) {
      const err = new Error('Station not found')
      err.status = 404
      throw err
    }
    logger.debug({ stationId: id }, 'Station fetched successfully')
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
    logger.warn({ slug }, 'Station not found by slug')
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

    if (error) {
      logger.error({ err: error, userId, stationData }, 'Failed to create station')
      throw error
    }
    logger.info({ stationId: data.id, userId }, 'Station created')
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

    if (error) {
      logger.error({ err: error, stationId: id, userId }, 'Failed to update station')
      throw error
    }
    logger.info({ stationId: id, userId }, 'Station updated')
    return data
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('stations')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error({ err: error, stationId: id }, 'Failed to delete station')
      throw error
    }
    logger.info({ stationId: id }, 'Station deleted')
    return true
  }
}
