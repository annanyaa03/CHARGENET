import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { createServer } from 'http'
import { Server } from 'socket.io'
import bookingRoutes from './routes/bookings.js'
import errorHandler from './middleware/errorHandler.js'


dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// CORS - allow all localhost
app.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Origin',
    req.headers.origin || '*'
  )
  res.header(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  )
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization'
  )
  res.header(
    'Access-Control-Allow-Credentials',
    'true'
  )
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    data: { status: 'ok' } 
  })
})

app.get('/api/v1/health', (req, res) => {
  res.json({ 
    success: true, 
    data: { status: 'ok' } 
  })
})

// Routes
app.use('/api/v1/bookings', bookingRoutes)

// GET all stations
app.get('/api/stations', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 200
    
    const { data, error, count } = await supabase
      .from('stations')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .limit(limit)
    
    if (error) throw error
    
    res.json({
      success: true,
      data: { stations: data || [] },
      meta: { total: count }
    })
  } catch (err) {
    console.error('Stations error:', err)
    res.status(500).json({
      success: false,
      error: { message: err.message }
    })
  }
})

// GET all stations v1
app.get('/api/v1/stations', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 200
    
    const { data, error, count } = await supabase
      .from('stations')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .limit(limit)
    
    if (error) throw error
    
    console.log('Stations found:', data?.length)
    
    res.json({
      success: true,
      data: { stations: data || [] },
      meta: { 
        total: count,
        limit 
      }
    })
  } catch (err) {
    console.error('Stations error:', err)
    res.status(500).json({
      success: false,
      error: { message: err.message }
    })
  }
})

// GET station by slug
app.get('/api/v1/stations/slug/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .eq('slug', req.params.slug)
      .single()
    
    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: { message: 'Station not found' }
      })
    }
    
    res.json({
      success: true,
      data: { station: data }
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { message: err.message }
    })
  }
})

// GET station by ID
app.get('/api/v1/stations/:id', async (req, res) => {
  try {
    const isUUID = /^[0-9a-f-]{36}$/i.test(req.params.id)
    
    let query = supabase
      .from('stations')
      .select('*')
    
    if (isUUID) {
      query = query.eq('id', req.params.id)
    } else {
      query = query.eq('slug', req.params.id)
    }
    
    const { data, error } = await query.single()
    
    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: { message: 'Station not found' }
      })
    }
    
    res.json({
      success: true,
      data: { station: data }
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { message: err.message }
    })
  }
})

// GET chargers for station
app.get('/api/v1/stations/:id/chargers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chargers')
      .select('*')
      .eq('station_id', req.params.id)
    
    if (error) throw error
    
    res.json({
      success: true,
      data: { chargers: data || [] }
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { message: err.message }
    })
  }
})

// GET reviews for station
app.get('/api/v1/stations/:id/reviews', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('station_id', req.params.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    res.json({
      success: true,
      data: { reviews: data || [] }
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { message: err.message }
    })
  }
})

// GET nearby places for station
app.get('/api/v1/stations/:id/nearby', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('nearby_places')
      .select('*')
      .eq('station_id', req.params.id)
      .order('distance_km', { ascending: true })
    
    if (error) throw error
    
    res.json({
      success: true,
      data: { places: data || [] }
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { message: err.message }
    })
  }
})



// POST create review
app.post('/api/v1/reviews', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    let userId = null
    let userEmail = null
    
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id
      userEmail = user?.email
    }
    
    const { station_id, rating, comment, user_name } = req.body
    
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        station_id,
        user_id: userId,
        user_name: user_name || userEmail?.split('@')[0] || 'Anonymous',
        rating,
        comment
      })
      .select()
      .single()
    
    if (error) throw error
    
    res.status(201).json({
      success: true,
      data: { review: data }
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { message: err.message }
    })
  }
})

// GET chargers for station (also /api/)
app.get('/api/stations/:id/chargers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chargers')
      .select('*')
      .eq('station_id', req.params.id)
    
    if (error) throw error
    
    res.json({
      success: true,
      data: { chargers: data || [] }
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { message: err.message }
    })
  }
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { 
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found` 
    }
  })
})

// Error handler
app.use(errorHandler)

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true
  }
})

app.set('io', io)

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id)

  socket.on('join-station', (stationId) => {
    socket.join(`station-${stationId}`)
    console.log(`Socket ${socket.id} joined room: station-${stationId}`)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id)
  })
})

httpServer.listen(PORT, () => {
  console.log('═══════════════════════════')
  console.log('ChargeNet API running!')
  console.log('Port:', PORT)
  console.log('Supabase:', process.env.SUPABASE_URL ? 'Connected' : 'MISSING!')
  console.log('Socket.io: Initialized')
  console.log('═══════════════════════════')
})

// Keep alive
setInterval(() => {}, 1000)

export default app
