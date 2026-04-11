import { apiRequest } from '../lib/api'

export const createBooking = (data) => apiRequest('POST', '/bookings', data)
export const getMyBookings = () => apiRequest('GET', '/bookings/my')
export const getBookingById = (id) => apiRequest('GET', `/bookings/${id}`)
export const cancelBooking = (id) => apiRequest('PATCH', `/bookings/${id}/cancel`)
export const getStationBookings = (stationId) => apiRequest('GET', `/bookings/station/${stationId}`)
