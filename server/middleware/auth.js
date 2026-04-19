import supabase from '../services/supabase.js'

// Routes that skip auth entirely
const PUBLIC_GET_PREFIXES = [
  '/api/stations',
  '/api/v1/stations',
  '/api/chargers',
  '/api/v1/chargers',
  '/api/reviews',
  '/api/v1/reviews',
  '/api/health',
  '/api/v1/health'
]

const isPublicRoute = (method, path) => {
  // All GET requests to stations/chargers/reviews are public
  if (method === 'GET') {
    return PUBLIC_GET_PREFIXES.some(prefix => path.startsWith(prefix))
  }
  return false
}

export async function requireAuth(req, res, next) {
  // Skip auth for public routes
  if (isPublicRoute(req.method, req.path)) {
    return next()
  }

  // Get Bearer token
  const token = req.headers.authorization?.split('Bearer ')[1]

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: { 
        code: 'UNAUTHORIZED',
        message: 'Unauthorized' 
      },
      timestamp: new Date().toISOString()
    })
  }

  try {
    // Verify JWT with Supabase using the shared service-role client
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ 
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token'
        },
        timestamp: new Date().toISOString()
      })
    }

    // Attach user to request
    req.user = user
    req.token = token
    next()
  } catch (err) {
    console.error('[AuthMiddleware] Verification error:', err)
    return res.status(401).json({ 
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Verification failed'
      },
      timestamp: new Date().toISOString()
    })
  }
}

export default requireAuth
