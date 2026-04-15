import { apiRequest } from '../lib/api'

const mapSlot = (s) => ({
  ...s,
  powerKw: s.power_kw || 50,
  plugType: s.connector_type || 'CCS2',
  company: 'ChargeNet',
  pricePerKwh: s.price_per_kwh || 15,
})

export const getSlotsByStation = async (stationId) => {
  const res = await apiRequest('GET', `/slots/${stationId}`)
  return { ...res, data: (res.data || []).map(mapSlot) }
}

export const getAvailableSlots = async (stationId, date, startTime, endTime) => {
  const res = await apiRequest('GET', `/slots/${stationId}/available?date=${date}&start_time=${startTime}&end_time=${endTime}`)
  return { ...res, data: (res.data || []).map(mapSlot) }
}

export const updateSlotStatus = (slotId, status) => apiRequest('PATCH', `/slots/${slotId}/status`, { status })
