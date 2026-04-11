import { apiRequest } from '../lib/api'

export const createPaymentOrder = (bookingId, amount) => apiRequest('POST', '/payments/create-order', { bookingId, amount })
export const verifyPayment = (data) => apiRequest('POST', '/payments/verify', data)
export const requestRefund = (bookingId) => apiRequest('POST', '/payments/refund', { bookingId })
export const getPaymentHistory = () => apiRequest('GET', '/payments/history')
