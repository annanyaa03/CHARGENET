import { apiRequest } from '../lib/api'

const mapBooking = (b) => ({
  ...b,
  date: b.scheduled_date || b.date,
  station: b.stations ? { id: b.stations.id, name: b.stations.name } : b.station,
  charger: b.slots ? { id: b.slots.id, company: 'ChargeNet' } : b.charger,
})

export const createBooking = async (data) => {
  const res = await apiRequest('POST', '/bookings', data)
  return res // return json directly
}

export const getMyBookings = async () => {
  const res = await apiRequest('GET', '/bookings/my')
  return { ...res, data: (res.data || []).map(mapBooking) }
}

export const getBookingById = async (id) => {
  const res = await apiRequest('GET', `/bookings/${id}`)
  return { ...res, data: res.data ? mapBooking(res.data) : null }
}

export const cancelBooking = (id) => apiRequest('PATCH', `/bookings/${id}/cancel`)

export const getStationBookings = async (stationId) => {
  const res = await apiRequest('GET', `/bookings/station/${stationId}`)
  return { ...res, data: (res.data || []).map(mapBooking) }
}

