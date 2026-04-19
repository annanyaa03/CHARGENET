import { Router } from 'express'
import { bookingController } from '../controllers/booking.controller.js'
import asyncHandler from '../middleware/asyncHandler.js'
import validateBody from '../middleware/validate.js'
import { createBookingSchema } from '../schemas/booking.schema.js'
import { bookingLimiter } from '../middleware/rateLimit.js'

const router = Router()

// GET /api/bookings
router.get('/',
  asyncHandler(bookingController.getMyBookings)
)

// POST /api/bookings
router.post('/',
  bookingLimiter,
  validateBody(createBookingSchema),
  asyncHandler(bookingController.create)
)

// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel',
  asyncHandler(bookingController.cancel)
)

export default router
