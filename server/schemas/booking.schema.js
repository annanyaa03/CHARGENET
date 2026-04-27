import { z } from 'zod'

export const createBookingSchema = z.object({
  station_id: z.string()
    .uuid('Invalid station ID'),
  
  charger_id: z.string()
    .uuid('Invalid charger ID'),
  
  booking_date: z.string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Date must be in YYYY-MM-DD format'
    )
    .refine(date => {
      const bookingDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return bookingDate >= today
    }, 'Booking date cannot be in the past'),
  
  booking_time: z.string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'Time must be in HH:MM format'
    ),
  
  // Optional alias for booking_date
  start_time: z.string()
    .datetime('Invalid start time format')
    .optional(),
  
  // Optional alias for duration
  end_time: z.string()
    .datetime('Invalid end time format')
    .optional(),
  
  duration_minutes: z.number()
    .int('Must be whole number of minutes')
    .min(15, 'Minimum booking is 15 minutes')
    .max(480, 'Maximum booking is 8 hours')
    .default(60),
  
  estimated_cost: z.number()
    .min(0, 'Cost cannot be negative')
    .optional()
}).refine(data => {
  // If date is today, time must be in the future
  const bookingDate = new Date(data.booking_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (bookingDate.getTime() === today.getTime()) {
    const [hours, minutes] = data.booking_time.split(':').map(Number)
    const now = new Date()
    const bookingDateTime = new Date()
    bookingDateTime.setHours(hours, minutes, 0, 0)
    return bookingDateTime > now
  }
  return true
}, {
  message: 'Booking time must be in the future',
  path: ['booking_time']
}).refine(data => {
  // If start_time and end_time provided,
  // end must be after start
  if (data.start_time && data.end_time) {
    return new Date(data.end_time) > 
      new Date(data.start_time)
  }
  return true
}, {
  message: 'End time must be after start time',
  path: ['end_time']
})

export const cancelBookingSchema = z.object({
  id: z.string()
    .uuid('Invalid booking ID')
})

export const bookingQuerySchema = z.object({
  status: z.enum([
    'confirmed', 'cancelled', 
    'completed', 'no-show'
  ]).optional(),
  limit: z.string()
    .transform(v => parseInt(v))
    .pipe(z.number().min(1).max(50))
    .optional()
    .default('20')
})
