import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Routes that do NOT need authentication
const PUBLIC_ROUTES = [
  { method: 'GET', path: '/api/health' },
  { method: 'GET', path: '/api/stations' },
  { method: 'GET', path: '/api/stations/' },
  { method: 'POST', path: '/api/auth/signup' },
  { method: 'POST', path: '/api/auth/login' }
]

const isPublicRoute = (method, path) => {
  return PUBLIC_ROUTES.some(route => {
    if (route.method !== method) return false
    if (route.path === path) return true
    // Allow /api/stations/:id as public GET
    if (
      method === 'GET' && 
      path.startsWith('/api/stations/')
    ) return true
    // Allow /api/stations/:id/chargers
    if (
      method === 'GET' && 
      path.startsWith('/api/stations/') && 
      path.includes('/chargers')
    ) return true
    // Allow /api/stations/:id/reviews
    if (
      method === 'GET' && 
      path.startsWith('/api/stations/') && 
      path.includes('/reviews')
    ) return true
    return false
  })
}

const authMiddleware = async (req, res, next) => {
  const { method, path } = req

  // Skip auth for public routes
  if (isPublicRoute(method, path)) {
    return next()
  }

  // Get token from Authorization header
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      error: 'Missing or invalid authorization header',
      timestamp: new Date().toISOString()
    })
  }

  const token = authHeader.replace('Bearer ', '').trim()

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      error: 'No token provided',
      timestamp: new Date().toISOString()
    })
  }

  try {
    // Verify JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      })
    }

    // Attach user to request
    req.user = user
    req.token = token

    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      error: 'Token verification failed',
      timestamp: new Date().toISOString()
    })
  }
}

export default authMiddleware
