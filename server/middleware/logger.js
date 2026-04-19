import morgan from 'morgan'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Custom token: user ID
morgan.token('user-id', (req) => {
  return req.user?.id || 'anonymous'
})

// Custom token: request body (safe)
morgan.token('body', (req) => {
  if (!req.body) return '-'
  // Remove sensitive fields
  const safe = { ...req.body }
  delete safe.password
  delete safe.token
  delete safe.secret
  const str = JSON.stringify(safe)
  // Truncate if too long
  return str.length > 100 
    ? str.substring(0, 100) + '...' 
    : str
})

// Dev format: colorful, detailed
const devFormat = 
  ':method :url :status ' +
  ':response-time ms - :res[content-length] ' +
  '| user::user-id'

// Production format: structured
const prodFormat = JSON.stringify({
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time',
  contentLength: ':res[content-length]',
  userId: ':user-id',
  ip: ':remote-addr',
  userAgent: ':user-agent',
  date: ':date[iso]'
})

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Access log stream for production
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
)

// Error log stream
const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
)

// Dev logger: console only
export const devLogger = morgan(devFormat)

// Production logger: file + console
export const prodLogger = morgan(
  prodFormat,
  { stream: accessLogStream }
)

// Error logger: log only 4xx and 5xx
export const errorLogger = morgan(
  devFormat,
  {
    stream: errorLogStream,
    skip: (req, res) => res.statusCode < 400
  }
)

// Combined logger for use in app
export const requestLogger = 
  process.env.NODE_ENV === 'production'
    ? prodLogger
    : devLogger
