import { ZodError } from 'zod'

/**
 * Global error handling middleware
 * Must be the LAST middleware in chain
 * Must have 4 parameters (err, req, res, next)
 */
const errorHandler = (err, req, res, next) => {
  // Always log the full error server-side
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.error(`[ERROR] ${new Date().toISOString()}`)
  console.error(`Route: ${req.method} ${req.path}`)
  console.error(`User: ${req.user?.id || 'anonymous'}`)
  console.error('Error:', err)
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Handle Zod validation errors → 400
  if (err instanceof ZodError) {
    const errors = err.errors.map(e => ({
      field: e.path.join('.') || 'unknown',
      message: e.message,
      code: e.code,
      received: e.received
    }))

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
      timestamp: new Date().toISOString()
    })
  }

  // Handle Supabase/DB errors → 400 or 500
  if (err.code) {
    // PostgreSQL unique violation
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Resource already exists',
        error: 'Duplicate entry',
        timestamp: new Date().toISOString()
      })
    }

    // PostgreSQL foreign key violation
    if (err.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Referenced resource not found',
        error: 'Foreign key violation',
        timestamp: new Date().toISOString()
      })
    }

    // PostgreSQL not null violation
    if (err.code === '23502') {
      return res.status(400).json({
        success: false,
        message: 'Required field missing',
        error: err.message,
        timestamp: new Date().toISOString()
      })
    }

    // Supabase Single Row Not Found
    if (err.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
        timestamp: new Date().toISOString()
      })
    }
  }

  // Handle JWT errors → 401
  if (
    err.name === 'JsonWebTokenError' ||
    err.name === 'TokenExpiredError' ||
    err.name === 'NotBeforeError'
  ) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      error: 'Invalid or expired token',
      timestamp: new Date().toISOString()
    })
  }

  // Handle CORS errors → 403
  if (err.message?.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden',
      error: 'CORS policy violation',
      timestamp: new Date().toISOString()
    })
  }

  // Handle rate limit errors → 429
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests',
      error: 'Rate limit exceeded',
      timestamp: new Date().toISOString()
    })
  }

  // Handle not found errors → 404
  if (err.status === 404 || 
    err.message === 'Not found') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
      timestamp: new Date().toISOString()
    })
  }

  // All other errors → 500
  // Only expose details in development
  const isDev = process.env.NODE_ENV === 
    'development'
  
  return res.status(
    err.status || err.statusCode || 500
  ).json({
    success: false,
    message: 'Internal server error',
    error: isDev 
      ? err.message 
      : 'Something went wrong',
    ...(isDev && { stack: err.stack }),
    timestamp: new Date().toISOString()
  })
}

/**
 * 404 handler for unknown routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  })
}

export default errorHandler
