import { bookingService } from '../services/booking.service.js'
import { successResponse } from '../lib/response.js'

export const bookingController = {

  getMyBookings: async (req, res) => {
    const bookings = await bookingService
      .getByUser(req.user.id)
    successResponse(res, { bookings })
  },

  create: async (req, res) => {
    const io = req.app.get('io')
    const booking = await bookingService
      .create(req.body, req.user.id, io)
    successResponse(res, { booking }, 201)
  },


  cancel: async (req, res) => {
    const io = req.app.get('io')
    const booking = await bookingService
      .cancel(req.params.id, req.user.id, io)
    successResponse(res, { booking })
  }

}
