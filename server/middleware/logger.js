import pinoHttp from 'pino-http'
import logger from '../lib/logger.js'

// HTTP request logger using pino-http
export const requestLogger = pinoHttp({
  // Use our shared logger instance
  logger,

  // Custom log level per status code
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) {
      return 'error'
    }
    if (res.statusCode >= 400) {
      return 'warn'
    }
    if (res.statusCode >= 300) {
      return 'silent'
    }
    return 'info'
  },

  // Custom success message
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} - ${res.statusCode}`
  },

  // Custom error message
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`
  },

  // Custom attribute keys
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'duration'
  },

  // Serialize request — only log what we need
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      ip: req.remoteAddress,
      userAgent: req.headers['user-agent']
    }),
    res: (res) => ({
      statusCode: res.statusCode
    })
  },

  // Skip health check logs (too noisy)
  autoLogging: {
    ignore: (req) => 
      req.url === '/api/health' ||
      req.url === '/api/v1/health'
  }
})

// Backwards-compat named exports
export const devLogger = requestLogger
export const prodLogger = requestLogger
