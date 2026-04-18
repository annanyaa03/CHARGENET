require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const stationRoutes = require('./routes/stations');
const slotRoutes = require('./routes/slots');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const sessionRoutes = require('./routes/sessions');

const app = express();

// 1. Global Middlewares
app.use(helmet());

// CORS — allow the Vite dev server and any localhost origin
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any localhost port
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rate limiting (relaxed for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: { success: false, message: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// 2. Health & Diagnostics
const { configStatus, supabaseEnabled } = require('./config/supabase');

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ChargeNet Backend is running',
    environment: process.env.NODE_ENV,
    database: {
      status: supabaseEnabled ? 'connected' : 'disabled',
      urlSet: configStatus.urlSet,
      anonKeyValid: configStatus.anonKeyValid,
      serviceKeyValid: configStatus.serviceKeyValid
    },
    external_apis: {
      osm: 'active (free)',
      ocm: !!process.env.OPEN_CHARGE_MAP_API_KEY && !process.env.OPEN_CHARGE_MAP_API_KEY.startsWith('ADD_YOUR') ? 'active' : 'rate-limited',
      nrel: !!process.env.NREL_API_KEY && !process.env.NREL_API_KEY.startsWith('ADD_YOUR') ? 'active' : 'disabled'
    }
  });
});

// 3. Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sessions', sessionRoutes);

// Welcome Route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ChargeNet API Gateway is online',
    version: '1.0.0',
    endpoints: ['/api/stations', '/api/auth', '/api/bookings', '/api/slots', '/api/payments']
  });
});

// 4. 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

// 5. Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚡ ChargeNet Backend — ${process.env.NODE_ENV || 'development'} mode
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔗 API:          http://localhost:${PORT}/api
  🏥 Health:       http://localhost:${PORT}/health
  🗺️  Stations:    http://localhost:${PORT}/api/stations
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📡 Data Sources:
     ✅ OpenStreetMap (OSM) — Free, always on
     ${process.env.OPEN_CHARGE_MAP_API_KEY && !process.env.OPEN_CHARGE_MAP_API_KEY.startsWith('ADD') ? '✅' : '⚠️ '} Open Charge Map — ${process.env.OPEN_CHARGE_MAP_API_KEY && !process.env.OPEN_CHARGE_MAP_API_KEY.startsWith('ADD') ? 'Key set' : 'No key (rate-limited mode)'}
     ${process.env.NREL_API_KEY && !process.env.NREL_API_KEY.startsWith('ADD') ? '✅' : '⚠️ '} NREL/AFDC — ${process.env.NREL_API_KEY && !process.env.NREL_API_KEY.startsWith('ADD') ? 'Key set' : 'Disabled (US-only, needs free key)'}
     ${process.env.SUPABASE_URL && !process.env.SUPABASE_URL.startsWith('ADD') ? '✅' : '⚠️ '} Supabase DB — ${process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SECRET_KEY.startsWith('ADD') ? 'Connected' : 'Limited (no secret key)'}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
  console.log('Server is listening and process should remain active.');
});

console.log('Backend script execution reached the end.');
