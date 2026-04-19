import { reviewService } from '../services/supabase.js'
import { successResponse } from '../lib/response.js'

export const reviewController = {

  getByStation: async (req, res) => {
    const reviews = await reviewService
      .getByStation(req.params.id)
    successResponse(res, { reviews })
  },

  create: async (req, res) => {
    const review = await reviewService
      .create(
        req.body,
        req.user.id,
        req.user.email
      )
    successResponse(res, { review }, 201)
  },

  delete: async (req, res) => {
    await reviewService
      .delete(req.params.id, req.user.id)
    successResponse(res, { 
      message: 'Review deleted' 
    })
  }
}
