import supabase from '../lib/supabase.js'
import logger from '../lib/logger.js'

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

  // MOCK FOR TESTING
  if (token === 'MOCK_TOKEN') {
    req.user = { id: '00000000-0000-0000-0000-000000000000', email: 'test@example.com' }
    return next()
  }

  if (!token) {
    logger.warn({
      method: req.method,
      url: req.path,
      ip: req.ip
    }, 'Unauthorized request — no token')
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
      logger.warn({
        method: req.method,
        url: req.path,
        ip: req.ip
      }, 'Unauthorized request — invalid token')
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

    logger.debug({
      userId: user.id,
      method: req.method,
      url: req.path
    }, 'Request authenticated')

    next()
  } catch (err) {
    logger.error({
      err,
      method: req.method,
      url: req.path,
      ip: req.ip
    }, 'Auth verification error')
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
