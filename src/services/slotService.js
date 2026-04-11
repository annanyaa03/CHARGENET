import { apiRequest } from '../lib/api'

export const getSlotsByStation = (stationId) => apiRequest('GET', `/slots/${stationId}`)
export const getAvailableSlots = (stationId, date, startTime, endTime) => apiRequest('GET', `/slots/${stationId}/available?date=${date}&start_time=${startTime}&end_time=${endTime}`)
export const updateSlotStatus = (slotId, status) => apiRequest('PATCH', `/slots/${slotId}/status`, { status })
