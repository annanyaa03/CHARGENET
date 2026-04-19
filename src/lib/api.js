const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Modern API helper for the ChargeNet Express server
 * Handles standardized responses and auth headers
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  // Inject Bearer token if available in localStorage
  // This helps when transitioning from Supabase to Express API
  const token = localStorage.getItem('chargenet_token') || 
                localStorage.getItem('supabase.auth.token')
  
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  const json = await response.json()

  if (!response.ok) {
    const error = new Error(json.error?.message || 'API request failed')
    error.code = json.error?.code
    error.status = response.status
    throw error
  }

  return json
}
