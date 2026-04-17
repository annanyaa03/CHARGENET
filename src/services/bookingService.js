import { supabase } from '../lib/supabase'

const mapBooking = (b) => ({
  ...b,
  date: b.scheduled_date || b.date,
  station: b.stations ? { id: b.stations.id, name: b.stations.name } : b.station,
  charger: b.slots ? { id: b.slots.id, company: 'ChargeNet' } : b.charger,
})

export const createBooking = async (data) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Authentication required')

  const { data: created, error } = await supabase
    .from('bookings')
    .insert([{ ...data, user_id: user.id }])
    .select('*, stations(id, name), slots(id)')
    .single()

  if (error) throw error
  return { success: true, data: mapBooking(created) }
}

export const getMyBookings = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, data: [] }

  const { data, error } = await supabase
    .from('bookings')
    .select('*, stations(id, name), slots(id)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return { success: true, count: data.length, data: (data || []).map(mapBooking) }
}

export const getBookingById = async (id) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, stations(id, name), slots(id)')
    .eq('id', id)
    .single()

  if (error) throw error
  return { success: true, data: data ? mapBooking(data) : null }
}

export const cancelBooking = async (id) => {
  const { data: updated, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return { success: true, data: updated }
}

export const getStationBookings = async (stationId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, stations(id, name), slots(id)')
    .eq('station_id', stationId)

  if (error) throw error
  return { success: true, count: data.length, data: (data || []).map(mapBooking) }
}

