import pino from 'pino'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(
  fileURLToPath(import.meta.url)
)

const isDev = process.env.NODE_ENV !== 'production'

// In production write to log files
const streams = isDev ? undefined : [
  // Error log file
  { 
    level: 'error', 
    stream: pino.destination({
      dest: join(__dirname, '../../logs/error.log'),
      mkdir: true
    })
  },
  // Combined log file
  { 
    level: 'info', 
    stream: pino.destination({
      dest: join(__dirname, '../../logs/combined.log'),
      mkdir: true
    })
  },
  // Also output to console in production
  { 
    level: 'info', 
    stream: process.stdout 
  }
]

const logger = isDev 
  ? pino({
      level: process.env.LOG_LEVEL || 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
          singleLine: false
        }
      },
      base: {
        app: 'chargenet-api',
        env: 'development'
      },
      redact: {
        paths: [
          'req.headers.authorization',
          'body.password',
          '*.token',
          '*.secret'
        ],
        censor: '[REDACTED]'
      }
    })
  : pino(
      {
        level: process.env.LOG_LEVEL || 'info',
        base: {
          app: 'chargenet-api',
          env: process.env.NODE_ENV,
          version: '1.0.0'
        },
        redact: {
          paths: [
            'req.headers.authorization',
            'body.password',
            '*.token',
            '*.secret'
          ],
          censor: '[REDACTED]'
        },
        timestamp: pino.stdTimeFunctions.isoTime
      },
      pino.multistream(streams)
    )

export default logger
