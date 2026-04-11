import { apiRequest } from '../lib/api'

export const getProfile = () => apiRequest('GET', '/profile')
export const updateProfile = (data) => apiRequest('PUT', '/profile', data)
