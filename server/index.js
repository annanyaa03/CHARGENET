import 'dotenv/config'
import express from 'express'
import cors from 'cors'

// Lib & logger
import logger from './lib/logger.js'

// Middleware imports
import { helmetConfig, corsOptions } from './middleware/security.js'
import requireAuth from './middleware/auth.js'
import { apiLimiter } from './middleware/rateLimit.js'
import errorHandler, { 
  notFoundHandler 
} from './middleware/errorHandler.js'
import { requestLogger } from './middleware/logger.js'

import { createServer } from 'http'
import { Server } from 'socket.io'
import winstonLogger from './lib/winston.js'
import supabase from './lib/supabase.js'

// Route imports
import stationRoutes from './routes/stations.js'
import chargerRoutes from './routes/chargers.js'
import bookingRoutes from './routes/bookings.js'
import reviewRoutes from './routes/reviews.js'


const app = express()
const PORT = process.env.PORT || 3001

// ================================
// MIDDLEWARE (order matters)
// ================================

// 1. Request logging (pino-http)
app.use(requestLogger)

// 2. Security headers
app.use(helmetConfig)

// 3. CORS
app.use(cors(corsOptions))

// 4. Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}))

// 5. Rate limiting
app.use('/api/', apiLimiter)
app.use('/api/v1/', apiLimiter)

// 6. JWT Auth (Supabase JWT verification)
app.use(requireAuth)

// ================================
// HEALTH CHECK (public, no auth)
// ================================
const healthHandler = (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: '1.0.0',
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  })
}

app.get('/api/v1/health', healthHandler)
app.get('/api/health', healthHandler)

// ================================
// ROUTES
// ================================
// v1 routes
app.use('/api/v1/stations', stationRoutes)
app.use('/api/v1/chargers', chargerRoutes)
app.use('/api/v1/bookings', bookingRoutes)
app.use('/api/v1/reviews', reviewRoutes)

// Backwards compatibility
app.use('/api/stations', stationRoutes)
app.use('/api/chargers', chargerRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/reviews', reviewRoutes)

// ================================
// SOCKET.IO REAL-TIME
// ================================

// Create HTTP server from Express app
const httpServer = createServer(app)

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
})

// Store io instance for use in routes
app.set('io', io)

// Socket.io connection handler
io.on('connection', (socket) => {
  winstonLogger.info({
    socketId: socket.id,
    ip: socket.handshake.address
  }, 'Client connected via WebSocket')

  // Join station room for live updates
  socket.on('join-station', (stationId) => {
    socket.join(`station-${stationId}`)
    winstonLogger.debug({
      socketId: socket.id,
      stationId
    }, 'Client joined station room')
    
    socket.emit('joined', { 
      stationId,
      message: 'Subscribed to live updates'
    })
  })

  // Leave station room
  socket.on('leave-station', (stationId) => {
    socket.leave(`station-${stationId}`)
    winstonLogger.debug({
      socketId: socket.id,
      stationId
    }, 'Client left station room')
  })

  // Handle charger status update from admin
  socket.on('update-charger-status', 
    async ({ chargerId, status, stationId }) => {
    try {
      const { data, error } = await supabase
        .from('chargers')
        .update({ status })
        .eq('id', chargerId)
        .select()
        .single()
      
      if (!error && data) {
        // Broadcast to all clients in the station room
        io.to(`station-${stationId}`).emit('charger-status-changed', {
          stationId,
          charger: data,
          timestamp: new Date().toISOString()
        })
        
        winstonLogger.info({
          chargerId,
          status,
          stationId
        }, 'Charger status updated via socket')
      }
    } catch (err) {
      socket.emit('error', { 
        message: 'Failed to update charger' 
      })
    }
  })

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    winstonLogger.info({
      socketId: socket.id,
      reason
    }, 'Client disconnected')
  })
})

// Error handlers
app.use(notFoundHandler)
app.use(errorHandler)

// ================================
// START SERVER
// ================================
// Replace app.listen with httpServer.listen
const server = httpServer.listen(PORT, () => {
  winstonLogger.info({
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    websocket: 'enabled'
  }, 'ChargeNet API started with WebSocket')
})

export default app

