import supabase from '../lib/supabase.js'

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
