import supabase from '../lib/supabase.js'

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
      .order('created_at', { 
        ascending: false 
      })

    if (error) throw error
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

    if (error) throw error
    if (!data) {
      const err = new Error('Booking not found')
      err.status = 404
      throw err
    }
    return data
  },

  create: async (bookingData, userId) => {
    // Check charger is available
    const { data: charger } = await supabase
      .from('chargers')
      .select('status, price_per_kwh, power_kw')
      .eq('id', bookingData.charger_id)
      .single()

    if (!charger) {
      const err = new Error('Charger not found')
      err.status = 404
      throw err
    }

    if (charger.status !== 'available') {
      const err = new Error(
        'Charger is not available'
      )
      err.status = 409
      throw err
    }

    // Calculate estimated cost
    const estimated_cost = (
      parseFloat(charger.price_per_kwh || 0) *
      (charger.power_kw || 0) *
      ((bookingData.duration_minutes || 60) / 60)
    ).toFixed(2)

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        user_id: userId,
        estimated_cost,
        status: 'confirmed'
      })
      .select()
      .single()

    if (error) throw error

    // Update charger to occupied
    await supabase
      .from('chargers')
      .update({ status: 'occupied' })
      .eq('id', bookingData.charger_id)

    return data
  },

  cancel: async (id, userId) => {
    // Get booking first
    const { data: booking } = await supabase
      .from('bookings')
      .select('user_id, charger_id, status')
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
      const err = new Error(
        'Booking already cancelled'
      )
      err.status = 409
      throw err
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Free up charger
    await supabase
      .from('chargers')
      .update({ status: 'available' })
      .eq('id', booking.charger_id)

    return data
  }
}
