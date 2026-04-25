import supabase from './supabase.js'
import logger from './logger.js'

export const socketEvents = {
  
  // Emit when charger status changes
  chargerStatusChanged: (io, stationId, charger) => {
    if (!io) return
    io.to(`station-${stationId}`)
      .emit('charger-status-changed', {
        stationId,
        charger,
        timestamp: new Date().toISOString()
      })
    logger.info({
      stationId,
      chargerId: charger.id,
      status: charger.status
    }, 'Socket: charger status emitted')
  },

  // Emit when booking is made
  bookingCreated: (io, stationId, booking) => {
    if (!io) return
    io.to(`station-${stationId}`)
      .emit('new-booking', {
        stationId,
        booking,
        timestamp: new Date().toISOString()
      })
  },

  // Emit when booking cancelled
  bookingCancelled: (io, stationId, booking) => {
    if (!io) return
    io.to(`station-${stationId}`)
      .emit('booking-cancelled', {
        stationId,
        booking,
        timestamp: new Date().toISOString()
      })
  },

  // Emit station availability update
  availabilityChanged: (io, stationId, data) => {
    if (!io) return
    io.to(`station-${stationId}`)
      .emit('availability-changed', {
        stationId,
        availableSlots: data.availableSlots,
        totalSlots: data.totalSlots,
        timestamp: new Date().toISOString()
      })
  }
}
