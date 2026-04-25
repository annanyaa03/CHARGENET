import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const logsDir = join(__dirname, '../../logs')

// Create logs directory if it does not exist
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true })
}

const { 
  combine, timestamp, json, 
  colorize, simple, errors,
  printf
} = winston.format

const isDev = process.env.NODE_ENV !== 'production'

// Custom format for development
const devFormat = printf(({ 
  level, message, timestamp, ...meta 
}) => {
  const metaStr = Object.keys(meta).length 
    ? JSON.stringify(meta, null, 2) 
    : ''
  return `${timestamp} [${level}]: ${message} ${metaStr}`
})

// Daily rotate file transport
const fileRotateTransport = new DailyRotateFile({
    filename: join(__dirname, '../../logs/%DATE%-combined.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info'
  })

const errorRotateTransport = new DailyRotateFile({
    filename: join(__dirname, '../../logs/%DATE%-error.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error'
  })

const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  
  format: combine(
    errors({ stack: true }),
    timestamp({ 
      format: 'YYYY-MM-DD HH:mm:ss' 
    }),
    json()
  ),

  defaultMeta: {
    service: 'chargenet-api',
    version: '1.0.0',
    environment: process.env.NODE_ENV
  },

  transports: [
    // Console transport
    new winston.transports.Console({
      format: isDev 
        ? combine(
            colorize({ all: true }),
            timestamp({ 
              format: 'HH:mm:ss' 
            }),
            devFormat
          )
        : combine(
            timestamp(),
            json()
          )
    }),

    // File transports
    fileRotateTransport,
    errorRotateTransport
  ],

  // Handle uncaught exceptions
  exceptionHandlers: [
    new DailyRotateFile({
      filename: join(__dirname, '../../logs/%DATE%-exceptions.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d'
    })
  ],

  // Handle unhandled rejections
  rejectionHandlers: [
    new DailyRotateFile({
      filename: join(__dirname, '../../logs/%DATE%-rejections.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d'
    })
  ]
})

// Add stream for morgan compatibility
winstonLogger.stream = {
  write: (message) => {
    winstonLogger.info(message.trim())
  }
}

export default winstonLogger
