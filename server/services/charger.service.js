import supabase from '../lib/supabase.js'
import logger from '../lib/logger.js'

export const chargerService = {

  getByStation: async (stationId) => {
    const { data, error } = await supabase
      .from('chargers')
      .select('*')
      .eq('station_id', stationId)
      .order('type')

    if (error) {
      logger.error({ err: error, stationId }, 'Failed to fetch chargers for station')
      throw error
    }
    return data || []
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('chargers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      logger.error({ err: error, chargerId: id }, 'Failed to fetch charger by ID')
      throw error
    }
    return data
  },

  create: async (chargerData) => {
    const { data, error } = await supabase
      .from('chargers')
      .insert(chargerData)
      .select()
      .single()

    if (error) {
      logger.error({ err: error, chargerData }, 'Failed to create charger')
      throw error
    }
    logger.info({ chargerId: data.id, stationId: chargerData.station_id }, 'Charger created')
    return data
  },

  updateStatus: async (id, status) => {
    const validStatuses = [
      'available', 'occupied',
      'maintenance', 'inactive'
    ]

    if (!validStatuses.includes(status)) {
      const err = new Error(
        `Invalid status. Must be: ${validStatuses.join(', ')}`
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

    if (error) {
      logger.error({ err: error, chargerId: id, status }, 'Failed to update charger status')
      throw error
    }
    logger.info({ chargerId: id, status }, 'Charger status updated')
    return data
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('chargers')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error({ err: error, chargerId: id }, 'Failed to delete charger')
      throw error
    }
    logger.info({ chargerId: id }, 'Charger deleted')
    return true
  }
}
