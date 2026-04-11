import { apiRequest } from '../lib/api'

export const startSession = (bookingId) => apiRequest('POST', '/sessions/start', { bookingId })
export const stopSession = (sessionId) => apiRequest('POST', '/sessions/stop', { sessionId })
export const getMySessions = () => apiRequest('GET', '/sessions/my')
