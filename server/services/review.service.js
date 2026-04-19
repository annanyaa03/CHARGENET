import supabase from '../lib/supabase.js'
import logger from '../lib/logger.js'

export const reviewService = {

  getByStation: async (stationId) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('station_id', stationId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error({ err: error, stationId }, 'Failed to fetch reviews for station')
      throw error
    }
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

    if (error) {
      logger.error({ err: error, userId, stationId: reviewData.station_id }, 'Failed to create review')
      throw error
    }
    logger.info({ reviewId: data.id, userId, stationId: reviewData.station_id }, 'Review created')
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

    if (error) {
      logger.error({ err: error, reviewId: id, userId }, 'Failed to delete review')
      throw error
    }
    logger.info({ reviewId: id, userId }, 'Review deleted')
    return true
  }
}
