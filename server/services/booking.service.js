import supabase from '../lib/supabase.js'
import logger from '../lib/logger.js'
import { socketEvents } from '../lib/socketEvents.js'

const isValidDateTime = (date, time) => {
  const bookingDate = new Date(`${date}T${time}:00`)
  return bookingDate > new Date()
}

export const bookingService = {

  getByUser: async (userId) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        stations (
          id, name, address, city, slug
        ),
        chargers (
          id, type, power_kw
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error({ err: error, userId }, 'Failed to fetch user bookings')
      throw error
    }
    return data || []
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        stations (name, address, city),
        chargers (type, power_kw)
      `)
      .eq('id', id)
      .single()

    if (error) {
      logger.error({ err: error, bookingId: id }, 'Failed to fetch booking by ID')
      throw error
    }
    if (!data) {
      const err = new Error('Booking not found')
      err.status = 404
      throw err
    }
    return data
  },

  create: async (bookingData, userId, io) => {
    if (!bookingData.station_id || !bookingData.charger_id) {
      const err = new Error('Missing station or charger')
      err.status = 400
      throw err
    }

    // Add validation for booking_date and booking_time
    if (!bookingData.booking_date || !bookingData.booking_time) {
      const err = new Error('Missing booking date or time')
      err.status = 400
      throw err
    }

    if (!isValidDateTime(bookingData.booking_date, bookingData.booking_time)) {
      const err = new Error('Booking cannot be in the past')
      err.status = 400
      throw err
    }

    // Verify the selected charger is available
    const { data: charger } = await supabase
      .from('chargers')
      .select('id, status, price_per_kwh, power_kw, station_id')
      .eq('id', bookingData.charger_id)
      .single()

    if (!charger) {
      const err = new Error('Charger not found')
      err.status = 404
      throw err
    }

    if (charger.status !== 'available') {
      const err = new Error('Charger is not available')
      err.status = 409
      throw err
    }

    // Double-booking check (Overlap)
    const [hours, minutes] = bookingData.booking_time.split(':').map(Number)
    const bookingStart = new Date(bookingData.booking_date)
    bookingStart.setHours(hours, minutes, 0, 0)
    
    const bookingEnd = new Date(bookingStart.getTime() + (bookingData.duration_minutes || 60) * 60000)

    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('booking_date, booking_time, duration_minutes')
      .eq('charger_id', bookingData.charger_id)
      .eq('booking_date', bookingData.booking_date)
      .neq('status', 'cancelled')

    const hasOverlap = existingBookings?.some(existing => {
      const [eHours, eMinutes] = existing.booking_time.split(':').map(Number)
      const eStart = new Date(existing.booking_date)
      eStart.setHours(eHours, eMinutes, 0, 0)
      const eEnd = new Date(eStart.getTime() + (existing.duration_minutes || 60) * 60000)
      
      return bookingStart < eEnd && bookingEnd > eStart
    })

    if (hasOverlap) {
      const err = new Error('This time slot is already booked for this charger')
      err.status = 409
      throw err
    }

    // Calculate estimated cost if not provided
    if (!bookingData.estimated_cost) {
      bookingData.estimated_cost = (
        parseFloat(charger.price_per_kwh || 0) *
        (charger.power_kw || 0) *
        ((bookingData.duration_minutes || 60) / 60)
      ).toFixed(2)
    }

    bookingData.user_id = userId
    bookingData.status = 'confirmed'

    // Insert booking
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single()

    if (error) {
      logger.error({ err: error, bookingData, userId }, 'Failed to create booking')
      throw error
    }

    // Update charger status to 'occupied'
    await supabase.from('chargers')
      .update({ status: 'occupied' })
      .eq('id', charger.id)

    // Emit booking created via socket.io if io present
    if (io) {
      io.to(`station-${charger.station_id}`)
        .emit('new-booking', {
          booking: data
        })
        
      // Also update availability
      const { count: availableCount } = await supabase
        .from('chargers')
        .select('id', { count: 'exact', head: true })
        .eq('station_id', charger.station_id)
        .eq('status', 'available')

      const { data: station } = await supabase
        .from('stations')
        .select('total_slots')
        .eq('id', charger.station_id)
        .single()
      
      socketEvents.availabilityChanged(io, charger.station_id, {
        availableSlots: availableCount || 0,
        totalSlots: station?.total_slots || 0
      })
    }

    logger.info({
      userId,
      stationId: charger.station_id,
      chargerId: charger.id,
      bookingId: data.id
    }, 'Booking created')

    return data
  },


  cancel: async (id, userId, io) => {
    // Get booking first
    const { data: booking } = await supabase
      .from('bookings')
      .select('user_id, charger_id, station_id, status')
      .eq('id', id)
      .single()

    if (!booking) {
      const err = new Error('Booking not found')
      err.status = 404
      throw err
    }

    if (booking.user_id !== userId) {
      const err = new Error('Forbidden')
      err.status = 403
      throw err
    }

    if (booking.status === 'cancelled') {
      const err = new Error('Booking already cancelled')
      err.status = 409
      throw err
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error({ err: error, bookingId: id, userId }, 'Failed to cancel booking')
      throw error
    }

    // Free up charger
    await supabase
      .from('chargers')
      .update({ status: 'available' })
      .eq('id', booking.charger_id)

    // Emit socket events
    if (data && io) {
      socketEvents.bookingCancelled(io, booking.station_id, data)
      
      // Update availability
      const { count: availableCount } = await supabase
        .from('chargers')
        .select('id', { count: 'exact', head: true })
        .eq('station_id', booking.station_id)
        .eq('status', 'available')

      const { data: station } = await supabase
        .from('stations')
        .select('total_slots')
        .eq('id', booking.station_id)
        .single()
      
      socketEvents.availabilityChanged(io, booking.station_id, {
        availableSlots: availableCount || 0,
        totalSlots: station?.total_slots || 0
      })
    }

    logger.info({ bookingId: id, userId }, 'Booking cancelled')
    return data
  }

}
