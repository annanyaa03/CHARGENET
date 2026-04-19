import helmet from 'helmet'
import cors from 'cors'

// CORS configuration
export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean)

    // Allow requests with no origin (mobile apps, Postman etc)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`), false)
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}

// Helmet security headers
export const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: [
        "'self'",
        'https://*.supabase.co',
        'https://api.anthropic.com'
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  // Hide X-Powered-By header
  hidePoweredBy: true,
  // Prevent MIME sniffing
  noSniff: true,
  // XSS Protection
  xssFilter: true,
  // HTTPS only (enable in production)
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  // Referrer policy
  referrerPolicy: { 
    policy: 'strict-origin-when-cross-origin' 
  },
  // Permissions policy
  permittedCrossDomainPolicies: false,
  // DNS prefetch control
  dnsPrefetchControl: { allow: false },
  // IE No Open
  ieNoOpen: true
})
