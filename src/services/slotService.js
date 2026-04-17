import { supabase } from '../lib/supabase'

const mapSlot = (s) => ({
  ...s,
  powerKw: s.power_kw || 50,
  plugType: s.connector_type || 'CCS2',
  company: 'ChargeNet',
  pricePerKwh: s.price_per_kwh || 15,
})

export const getSlotsByStation = async (stationId) => {
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('station_id', stationId)

  if (error) throw error
  return { success: true, count: data.length, data: (data || []).map(mapSlot) }
}

export const getAvailableSlots = async (stationId, date, startTime, endTime) => {
  // 1. Fetch all slots for this station
  const { data: allSlots, error: slotsError } = await supabase
    .from('slots')
    .select('*')
    .eq('station_id', stationId)

  if (slotsError) throw slotsError

  // 2. Fetch all confirmed/pending bookings for this station on this date
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('slot_id, start_time, end_time')
    .eq('station_id', stationId)
    .eq('scheduled_date', date)
    .in('status', ['confirmed', 'pending'])

  if (bookingsError) throw bookingsError

  // 3. Filter out slots that have overlapping bookings
  const availableSlots = allSlots.filter(slot => {
    const isBooked = bookings.some(b => {
      if (b.slot_id !== slot.id) return false
      // Overlap logic: (StartA < EndB) and (EndA > StartB)
      return (startTime < b.end_time) && (endTime > b.start_time)
    })
    return !isBooked && slot.status === 'available'
  })

  return { success: true, count: availableSlots.length, data: availableSlots.map(mapSlot) }
}

export const updateSlotStatus = async (slotId, status) => {
  const { data: updated, error } = await supabase
    .from('slots')
    .update({ status })
    .eq('id', slotId)
    .select()
    .single()

  if (error) throw error
  return { success: true, data: updated }
}
