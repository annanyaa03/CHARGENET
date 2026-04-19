import { bookingService } from '../services/booking.service.js'

export const bookingController = {

  getMyBookings: async (req, res) => {
    const bookings = await bookingService
      .getByUser(req.user.id)
    
    res.json({
      success: true,
      data: { bookings },
      timestamp: new Date().toISOString()
    })
  },

  create: async (req, res) => {
    const booking = await bookingService
      .create(req.body, req.user.id)
    
    res.status(201).json({
      success: true,
      data: { booking },
      timestamp: new Date().toISOString()
    })
  },

  cancel: async (req, res) => {
    const booking = await bookingService
      .cancel(req.params.id, req.user.id)
    
    res.json({
      success: true,
      data: { booking },
      timestamp: new Date().toISOString()
    })
  }
}
