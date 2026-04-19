import rateLimit from 'express-rate-limit'

// Response format for rate limit errors
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests',
    error: 'Rate limit exceeded. Please slow down.',
    retryAfter: Math.ceil(
      res.getHeader('Retry-After') || 900
    ),
    timestamp: new Date().toISOString()
  })
}

// General API rate limit
// 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    // Skip rate limit in tests and for health check
    return process.env.NODE_ENV === 'test' || req.path === '/api/health'
  }
})

// Strict auth rate limit
// 10 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts',
      error: 'Please wait 15 minutes before trying again.',
      timestamp: new Date().toISOString()
    })
  }
})

// Booking rate limit
// 20 requests per hour
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Booking limit reached',
      error: 'Too many booking attempts. Try again in an hour.',
      timestamp: new Date().toISOString()
    })
  }
})

// Review rate limit
// 5 reviews per hour
export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Review limit reached',
      error: 'Too many reviews. Try again in an hour.',
      timestamp: new Date().toISOString()
    })
  }
})
