import { supabase } from '../lib/supabase'

export const startSession = async (bookingId) => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data: booking } = await supabase.from('bookings').select('station_id, slot_id').eq('id', bookingId).single()

  const { data, error } = await supabase
    .from('sessions')
    .insert([{ 
      booking_id: bookingId, 
      user_id: user.id,
      station_id: booking.station_id,
      slot_id: booking.slot_id,
      status: 'active',
      start_time: new window.Date().toISOString()
    }])
    .select()
    .single()

  if (error) throw error
  return { success: true, data }
}

export const stopSession = async (sessionId) => {
  const { data, error } = await supabase
    .from('sessions')
    .update({ 
      status: 'completed', 
      end_time: new window.Date().toISOString(),
      energy_consumed_kwh: 12.5, // Mocked for now
      total_cost: 225.0 // Mocked for now
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error
  return { success: true, data }
}

export const getMySessions = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('sessions')
    .select('*, stations(name), slots(slot_number)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return { success: true, count: data.length, data }
}
