import helmet from 'helmet'
import cors from 'cors'

// CORS configuration
export const corsOptions = {
  origin: (origin, callback) => {
    // Allow all localhost origins in development
    if (!origin || 
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1')) {
      return callback(null, true)
    }
    
    // Allow production domain
    const allowedOrigins = [
      process.env.FRONTEND_URL
    ].filter(Boolean)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(
        new Error(`CORS: ${origin} not allowed`),
        false
      )
    }
  },
  methods: ['GET', 'POST', 'PUT', 
    'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
}

export const helmetConfig = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
})
