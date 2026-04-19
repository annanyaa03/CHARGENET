import 'dotenv/config'
import express from 'express'
import cors from 'cors'

// Middleware imports
import { helmetConfig, corsOptions } from './middleware/security.js'
import requireAuth from './middleware/auth.js'
import { apiLimiter } from './middleware/rateLimit.js'
import errorHandler, { 
  notFoundHandler 
} from './middleware/errorHandler.js'
import { requestLogger } from './middleware/logger.js'

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

// 1. Request logging
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
// ERROR HANDLERS (must be last)
// ================================
app.use(notFoundHandler)
app.use(errorHandler)

// ================================
// START SERVER
// ================================
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  ChargeNet API v1.0.0')
  console.log(`  Port:    ${PORT}`)
  console.log(`  Auth:    Supabase JWT ✓`)
  console.log(`  Routes:  No legacy /auth/* needed`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
})

export default app
