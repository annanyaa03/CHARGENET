import { bookingService } from '../services/supabase.js'
import { successResponse } from '../lib/response.js'

export const bookingController = {

  getMyBookings: async (req, res) => {
    const bookings = await bookingService
      .getByUser(req.user.id)
    successResponse(res, { bookings })
  },

  create: async (req, res) => {
    const booking = await bookingService
      .create(req.body, req.user.id)
    successResponse(res, { booking }, 201)
  },

  cancel: async (req, res) => {
    const booking = await bookingService
      .cancel(req.params.id, req.user.id)
    successResponse(res, { booking })
  }
}
