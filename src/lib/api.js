import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL

export async function apiRequest(method, endpoint, data = null) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...(data && { body: JSON.stringify(data) })
  }

  const res = await fetch(`${API_URL}${endpoint}`, options)
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'API error')
  return json
}
