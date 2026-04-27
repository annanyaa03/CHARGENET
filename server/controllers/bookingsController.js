import { bookingService } from '../services/booking.service.js'
import { successResponse } from '../lib/response.js'

export const bookingController = {

  getMyBookings: async (req, res) => {
    const bookings = await bookingService
      .getByUser(req.user.id)
    successResponse(res, { bookings })
  },

  create: async (req, res, next) => {
    try {
      console.log('Booking creation request:', req.body)
      
      // Call booking service
      const booking = await bookingService.create(
        req.body, req.user.id, req.app.get('io')
      )
      
      console.log('Booking created successfully:', booking)
      
      return res.status(201).json({
        success: true,
        data: { booking },
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      console.error('Booking creation failed:', err)
      next(err)
    }
  },


  cancel: async (req, res) => {
    const io = req.app.get('io')
    const booking = await bookingService
      .cancel(req.params.id, req.user.id, io)
    successResponse(res, { booking })
  }

}
