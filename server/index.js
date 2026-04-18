import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Supabase admin client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

app.use(cors())
app.use(express.json())

// =====================
// RESPONSE HELPERS
// =====================
const success = (res, data, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
    timestamp: new Date().toISOString()
  })
}

const error = (res, message, status = 400, 
  errors = []) => {
  return res.status(status).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  })
}

// =====================
// AUTH MIDDLEWARE
// =====================
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization
    ?.replace('Bearer ', '')
  
  if (!token) {
    return error(res, 'Unauthorized', 401)
  }

  const { data: { user }, error: authError } = 
    await supabase.auth.getUser(token)
  
  if (authError || !user) {
    return error(res, 'Invalid token', 401)
  }

  req.user = user
  next()
}

// Optional auth (doesnt fail if no token)
const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization
    ?.replace('Bearer ', '')
  
  if (token) {
    const { data: { user } } = 
      await supabase.auth.getUser(token)
    req.user = user
  }
  next()
}

// =====================
// STATIONS ROUTES
// =====================

// GET /api/stations
app.get('/api/stations', async (req, res) => {
  try {
    const { 
      city, status, limit = 50, 
      offset = 0, search 
    } = req.query
    
    let query = supabase
      .from('stations')
      .select('*', { count: 'exact' })
      .eq('status', status || 'active')
      .range(
        parseInt(offset), 
        parseInt(offset) + parseInt(limit) - 1
      )
    
    if (city) query = query.eq('city', city)
    if (search) query = query.ilike(
      'name', `%${search}%`
    )
    
    const { data, error: dbError, count } = 
      await query
    
    if (dbError) throw dbError
    
    return success(res, {
      stations: data,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (err) {
    return error(res, err.message, 500)
  }
})

// GET /api/stations/:id
app.get('/api/stations/:id', 
  async (req, res) => {
  try {
    const { id } = req.params
    
    const { data, error: dbError } = 
      await supabase
        .from('stations')
        .select('*')
        .eq('id', id)
        .single()
    
    if (dbError || !data) {
      return error(
        res, 'Station not found', 404
      )
    }
    
    return success(res, { station: data })
  } catch (err) {
    return error(res, err.message, 500)
  }
})

// GET /api/stations/slug/:slug
app.get('/api/stations/slug/:slug', 
  async (req, res) => {
  try {
    const { slug } = req.params
    
    const { data, error: dbError } = 
      await supabase
        .from('stations')
        .select('*')
        .eq('slug', slug)
        .single()
    
    if (dbError || !data) {
      return error(
        res, 'Station not found', 404
      )
    }
    
    return success(res, { station: data })
  } catch (err) {
    return error(res, err.message, 500)
  }
})

// POST /api/stations
app.post('/api/stations', 
  authenticate, 
  async (req, res) => {
  try {
    const { 
      name, address, city, state, 
      lat, lng, description, total_slots 
    } = req.body
    
    // Validation
    const errors = []
    if (!name) errors.push('Name is required')
    if (!address) errors.push(
      'Address is required'
    )
    if (!city) errors.push('City is required')
    if (!lat || !lng) errors.push(
      'Coordinates are required'
    )
    
    if (errors.length > 0) {
      return error(
        res, 'Validation failed', 422, errors
      )
    }
    
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    
    const { data, error: dbError } = 
      await supabase
        .from('stations')
        .insert({
          name, address, city, state,
          lat, lng, description, total_slots,
          slug,
          owner_id: req.user.id,
          status: 'active'
        })
        .select()
        .single()
    
    if (dbError) throw dbError
    
    return success(
      res, { station: data }, 201
    )
  } catch (err) {
    return error(res, err.message, 500)
  }
})

// PUT /api/stations/:id
app.put('/api/stations/:id',
  authenticate,
  async (req, res) => {
  try {
    const { id } = req.params
    
    // Check ownership
    const { data: station } = await supabase
      .from('stations')
      .select('owner_id')
      .eq('id', id)
      .single()
    
    if (!station) {
      return error(
        res, 'Station not found', 404
      )
    }
    
    if (station.owner_id && 
      station.owner_id !== req.user.id) {
      return error(res, 'Forbidden', 403)
    }
    
    const { data, error: dbError } = 
      await supabase
        .from('stations')
        .update(req.body)
        .eq('id', id)
        .select()
        .single()
    
    if (dbError) throw dbError
    
    return success(res, { station: data })
  } catch (err) {
    return error(res, err.message, 500)
  }
})

// DELETE /api/stations/:id
app.delete('/api/stations/:id',
  authenticate,
  async (req, res) => {
  try {
    const { id } = req.params
    
    const { error: dbError } = 
      await supabase
        .from('stations')
        .delete()
        .eq('id', id)
    
    if (dbError) throw dbError
    
    return success(
      res, 
      { message: 'Station deleted' }, 
      200
    )
  } catch (err) {
    return error(res, err.message, 500)
  }
})

// =====================
// CHARGERS ROUTES
// =====================

// GET /api/stations/:id/chargers
app.get('/api/stations/:id/chargers',
  async (req, res) => {
  try {
    const { data, error: dbError } = 
      await supabase
        .from('chargers')
        .select('*')
        .eq('station_id', req.params.id)
    
    if (dbError) throw dbError
    
    return success(res, { chargers: data })
  } catch (err) {
    return error(res, err.message, 500)
  }
})

// PATCH /api/chargers/:id/status
app.patch('/api/chargers/:id/status',
  authenticate,
  async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = [
      'available', 'occupied', 
      'maintenance', 'inactive'
    ]
    
    if (!validStatuses.includes(status)) {
      return error(
        res, 'Invalid status', 422,
        [`Status must be one of: 
          ${validStatuses.join(', ')}`]
      )
    }
    
    const { data, error: dbError } = 
      await supabase
        .from('chargers')
        .update({ status })
        .eq('id', req.params.id)
        .select()
        .single()
    
    if (dbError) throw dbError
    
    return success(res, { charger: data })
  } catch (err) {
    return error(res, err.message, 500)
  }
})

// =====================
// BOOKINGS ROUTES
// =====================

// GET /api/bookings (own bookings)
app.get('/api/bookings',
  authenticate,
  async (req, res) => {
  try {
    const { data, error: dbError } = 
      await supabase
        .from('bookings')
        .select(`
          *,
          stations(name, address, city),
          chargers(type, power_kw)
        `)
        .eq('user_id', req.user.id)
        .order('created_at', { 
          ascending: false 
        })
    
    if (dbError) throw dbError
    
    return success(res, { bookings: data })
  } catch (err) {
    return error(res, err.message, 500)
  }
})

// POST /api/bookings
app.post('/api/bookings',
  authenticate,
  async (req, res) => {
  try {
    const {
      station_id, charger_id,
      booking_date, booking_time,
      duration_minutes
    } = req.body
    
    // Validation
    const errors = []
    if (!station_id) errors.push(
      'Station ID is required'
    )
    if (!charger_id) errors.push(
      'Charger ID is required'
    )
    if (!booking_date) errors.push(
      'Booking date is required'
    )
    if (!booking_time) errors.push(
      'Booking time is required'
    )
    
    if (errors.length > 0) {
      return error(
        res, 'Validation failed', 422, errors
      )
    }
    
    // Check charger availability
    const { data: charger } = await supabase
      .from('chargers')
      .select('status, price_per_kwh, power_kw')
      .eq('id', charger_id)
      .single()
    
    if (!charger || 
      charger.status !== 'available') {
      return error(
        res, 
        'Charger is not available', 
        409
      )
    }
    
    // Calculate cost
    const estimated_cost = (
      charger.price_per_kwh * 
      charger.power_kw * 
      ((duration_minutes || 60) / 60)
    ).toFixed(2)
    
    const { data, error: dbError } = 
      await supabase
        .from('bookings')
        .insert({
          station_id,
          charger_id,
          user_id: req.user.id,
          booking_date,
          booking_time,
          duration_minutes: 
            duration_minutes || 60,
          estimated_cost,
          status: 'confirmed'
        })
        .select()
        .single()
    
    if (dbError) throw dbError
    
    // Update charger status to occupied
    await supabase
      .from('chargers')
      .update({ status: 'occupied' })
      .eq('id', charger_id)
    
    return success(
      res, { booking: data }, 201
    )
  } catch (err) {
    return error(res, err.message, 500)
  }
})

// PATCH /api/bookings/:id/cancel
app.patch('/api/bookings/:id/cancel',
  authenticate,
  async (req, res) => {
  try {
    const { data: booking } = await supabase
      .from('bookings')
      .select('user_id, charger_id, status')
      .eq('id', req.params.id)
      .single()
    
    if (!booking) {
      return error(
        res, 'Booking not found', 404
      )
    }
    
    if (booking.user_id !== req.user.id) {
      return error(res, 'Forbidden', 403)
    }
    
    if (booking.status === 'cancelled') {
      return error(
        res, 'Already cancelled', 409
      )
    }
    
    const { data, error: dbError } = 
      await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', req.params.id)
        .select()
        .single()
    
    if (dbError) throw dbError
    
    // Free up the charger
    await supabase
      .from('chargers')
      .update({ status: 'available' })
      .eq('id', booking.charger_id)
    
    return success(res, { booking: data })
  } catch (err) {
    return error(res, err.message, 500)
  }
})

// =====================
// REVIEWS ROUTES
// =====================

// GET /api/stations/:id/reviews
app.get('/api/stations/:id/reviews',
  async (req, res) => {
  try {
    const { data, error: dbError } = 
      await supabase
        .from('reviews')
        .select('*')
        .eq('station_id', req.params.id)
        .order('created_at', { 
          ascending: false 
        })
    
    if (dbError) throw dbError
    
    return success(res, { reviews: data })
  } catch (err) {
    return error(res, err.message, 500)
  }
})

// POST /api/reviews
app.post('/api/reviews',
  authenticate,
  async (req, res) => {
  try {
    const { station_id, rating, comment } = 
      req.body
    
    if (!station_id || !rating) {
      return error(
        res, 'Validation failed', 422,
        ['Station ID and rating are required']
      )
    }
    
    if (rating < 1 || rating > 5) {
      return error(
        res, 'Validation failed', 422,
        ['Rating must be between 1 and 5']
      )
    }
    
    const { data, error: dbError } = 
      await supabase
        .from('reviews')
        .insert({
          station_id,
          user_id: req.user.id,
          user_name: req.user.email
            .split('@')[0],
          rating,
          comment
        })
        .select()
        .single()
    
    if (dbError) throw dbError
    
    return success(
      res, { review: data }, 201
    )
  } catch (err) {
    return error(res, err.message, 500)
  }
})

// =====================
// AUTH ROUTES
// =====================

// POST /api/auth/signup
app.post('/api/auth/signup',
  async (req, res) => {
  try {
    const { email, password, full_name } = 
      req.body
    
    if (!email || !password) {
      return error(
        res, 'Validation failed', 422,
        ['Email and password are required']
      )
    }
    
    const { data, error: authError } = 
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name }
        }
      })
    
    if (authError) {
      return error(
        res, authError.message, 400
      )
    }
    
    return success(res, {
      user: data.user,
      session: data.session,
      message: 'Check email to verify account'
    }, 201)
  } catch (err) {
    return error(res, err.message, 500)
  }
})

// POST /api/auth/login
app.post('/api/auth/login',
  async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return error(
        res, 'Validation failed', 422,
        ['Email and password are required']
      )
    }
    
    const { data, error: authError } = 
      await supabase.auth.signInWithPassword({
        email,
        password
      })
    
    if (authError) {
      return error(
        res, 'Invalid credentials', 401
      )
    }
    
    return success(res, {
      user: data.user,
      session: data.session,
      access_token: data.session.access_token
    })
  } catch (err) {
    return error(res, err.message, 500)
  }
})

// POST /api/auth/logout
app.post('/api/auth/logout',
  authenticate,
  async (req, res) => {
  try {
    await supabase.auth.signOut()
    return success(res, { 
      message: 'Logged out successfully' 
    })
  } catch (err) {
    return error(res, err.message, 500)
  }
})

// =====================
// HEALTH CHECK
// =====================
app.get('/api/health', (req, res) => {
  return success(res, {
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use((req, res) => {
  return error(
    res, 
    `Route ${req.method} ${req.path} not found`, 
    404
  )
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  return error(
    res, 
    'Internal server error', 
    500
  )
})

app.listen(PORT, () => {
  console.log(
    `ChargeNet API running on port ${PORT}`
  )
})
