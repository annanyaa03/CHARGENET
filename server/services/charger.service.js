import supabase from '../lib/supabase.js'

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
