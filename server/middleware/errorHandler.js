import { ZodError } from 'zod'
import { ERROR_CODES } from '../lib/response.js'
import logger from '../lib/logger.js'

const errorHandler = (err, req, res, next) => {
  // Log full error with structured pino
  logger.error({
    err,
    method: req.method,
    url: req.url,
    userId: req.user?.id || 'anonymous',
    statusCode: err.status || 500
  }, 'Request error')

  // Zod validation errors → 400
  if (err instanceof ZodError) {
    const errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }))
    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed',
        details: errors
      },
      timestamp: new Date().toISOString()
    })
  }

  // Custom status errors
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      error: {
        code: ERROR_CODES.NOT_FOUND,
        message: err.message || 'Not found'
      },
      timestamp: new Date().toISOString()
    })
  }

  if (err.status === 401) {
    return res.status(401).json({
      success: false,
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: err.message || 'Unauthorized'
      },
      timestamp: new Date().toISOString()
    })
  }

  if (err.status === 403) {
    return res.status(403).json({
      success: false,
      error: {
        code: ERROR_CODES.FORBIDDEN,
        message: err.message || 'Forbidden'
      },
      timestamp: new Date().toISOString()
    })
  }

  if (err.status === 409) {
    return res.status(409).json({
      success: false,
      error: {
        code: ERROR_CODES.CONFLICT,
        message: err.message || 'Conflict'
      },
      timestamp: new Date().toISOString()
    })
  }

  // PostgreSQL & Supabase errors
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: {
        code: ERROR_CODES.CONFLICT,
        message: 'Resource already exists'
      },
      timestamp: new Date().toISOString()
    })
  }

  if (err.code === 'PGRST116') {
    return res.status(404).json({
      success: false,
      error: {
        code: ERROR_CODES.NOT_FOUND,
        message: 'Resource not found'
      },
      timestamp: new Date().toISOString()
    })
  }

  if (err.code === '23503' || err.code === '23502') {
    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.BAD_REQUEST,
        message: 'Invalid request data'
      },
      timestamp: new Date().toISOString()
    })
  }

  // JWT errors
  if (
    err.name === 'JsonWebTokenError' ||
    err.name === 'TokenExpiredError'
  ) {
    return res.status(401).json({
      success: false,
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Invalid or expired token'
      },
      timestamp: new Date().toISOString()
    })
  }

  // Generic server error → 500
  return res
    .status(err.status || 500)
    .json({
      success: false,
      error: {
        code: err.code || 
          ERROR_CODES.SERVER_ERROR,
        message: process.env.NODE_ENV === 
          'production'
          ? 'Internal server error'
          : err.message
      },
      timestamp: new Date().toISOString()
    })
}

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message: `Route ${req.method} ${req.path} not found`
    },
    timestamp: new Date().toISOString()
  })
}

export default errorHandler
