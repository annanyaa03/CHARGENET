import { apiRequest } from '../lib/api'

export const getStations = (filters) => apiRequest('GET', `/stations?${new URLSearchParams(filters)}`)
export const getStationById = (id) => apiRequest('GET', `/stations/${id}`)
export const createStation = (data) => apiRequest('POST', '/stations', data)
export const updateStation = (id, data) => apiRequest('PUT', `/stations/${id}`, data)
export const deleteStation = (id) => apiRequest('DELETE', `/stations/${id}`)
export const getMyStations = () => apiRequest('GET', '/stations/owner/my')
export const getNearbyStations = (lat, lng, radius = 10) => apiRequest('GET', `/stations?lat=${lat}&lng=${lng}&radius=${radius}`)
