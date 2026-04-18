const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Consistent response handler
const handleResponse = async (response) => {
  const data = await response.json()
  
  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || 'Something went wrong',
      errors: data.errors || []
    }
  }
  
  return data
}

// Consistent error handler
const handleError = (error) => {
  console.error('API Error:', error)
  throw {
    status: error.status || 500,
    message: error.message || 'Internal server error',
    errors: error.errors || []
  }
}

// =====================
// STATIONS API
// =====================
export const stationsAPI = {
  // GET /api/stations
  getAll: async (params = {}) => {
    try {
      const query = new URLSearchParams(params)
      const res = await fetch(`${API_BASE}/stations?${query}`)
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  },

  // GET /api/stations/:id
  getById: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/stations/${id}`)
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  },

  // GET /api/stations/slug/:slug
  getBySlug: async (slug) => {
    try {
      const res = await fetch(`${API_BASE}/stations/slug/${slug}`)
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  },

  // POST /api/stations
  create: async (data, token) => {
    try {
      const res = await fetch(`${API_BASE}/stations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  },

  // PUT /api/stations/:id
  update: async (id, data, token) => {
    try {
      const res = await fetch(`${API_BASE}/stations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  },

  // DELETE /api/stations/:id
  delete: async (id, token) => {
    try {
      const res = await fetch(`${API_BASE}/stations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  }
}

// =====================
// CHARGERS API
// =====================
export const chargersAPI = {
  // GET /api/stations/:id/chargers
  getByStation: async (stationId) => {
    try {
      const res = await fetch(`${API_BASE}/stations/${stationId}/chargers`)
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  },

  // POST /api/chargers
  create: async (data, token) => {
    try {
      const res = await fetch(`${API_BASE}/chargers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  },

  // PATCH /api/chargers/:id/status
  updateStatus: async (id, status, token) => {
    try {
      const res = await fetch(`${API_BASE}/chargers/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  }
}

// =====================
// BOOKINGS API
// =====================
export const bookingsAPI = {
  // GET /api/bookings
  getMyBookings: async (token) => {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  },

  // POST /api/bookings
  create: async (data, token) => {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  },

  // PATCH /api/bookings/:id/cancel
  cancel: async (id, token) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  }
}

// =====================
// REVIEWS API
// =====================
export const reviewsAPI = {
  // GET /api/stations/:id/reviews
  getByStation: async (stationId) => {
    try {
      const res = await fetch(`${API_BASE}/stations/${stationId}/reviews`)
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  },

  // POST /api/reviews
  create: async (data, token) => {
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  },

  // DELETE /api/reviews/:id
  delete: async (id, token) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  }
}

// =====================
// AUTH API
// =====================
export const authAPI = {
  // POST /api/auth/signup
  signup: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  },

  // POST /api/auth/login
  login: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  },

  // POST /api/auth/logout
  logout: async (token) => {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return handleResponse(res)
    } catch (err) {
      return handleError(err)
    }
  }
}
