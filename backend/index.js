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
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Body parser

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api/', limiter);

// 2. Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'ChargeNet Backend is running' });
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
    version: '1.0.0'
  });
});

// 4. 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API Route not found' });
});

// 5. Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🚀 ChargeNet Backend running in ${process.env.NODE_ENV} mode on port ${PORT}
  🔗 Health Check: http://localhost:${PORT}/health
  `);
});
