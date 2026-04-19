import { describe, it, expect, vi,
  beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'

import { 
  mockBooking, 
  mockCharger,
  mockUser,
  authHeaders
} from './helpers/mockData.js'

import supabase from '../services/supabase.js'

const createTestApp = async () => {
  const app = express()
  app.use(express.json())

  // Mock auth middleware
  app.use((req, res, next) => {
    if (req.headers.authorization?.startsWith('Bearer ')) {
      req.user = mockUser
      req.token = 'test-token'
    } else {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }
    next()
  })

  const bookingRoutes = await import('../routes/bookings.js')
  app.use('/api/bookings', bookingRoutes.default)

  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      errors: err.errors
    })
  })

  return app
}

describe('Bookings API', () => {
  let app

  beforeEach(async () => {
    app = await createTestApp()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ================================
  // GET /api/bookings
  // ================================
  describe('GET /api/bookings', () => {

    it('should return user bookings when authenticated', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockBooking],
              error: null
            })
          })
        })
      })

      const res = await request(app)
        .get('/api/bookings')
        .set(authHeaders)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.bookings).toBeDefined()
    })

    it('should return 401 without auth', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .expect(401)

      expect(res.body.success).toBe(false)
    })
  })

  // ================================
  // POST /api/bookings
  // ================================
  describe('POST /api/bookings', () => {

    const validBookingBody = {
      station_id: mockBooking.station_id,
      charger_id: mockBooking.charger_id,
      booking_date: '2026-12-25',
      booking_time: '10:00',
      duration_minutes: 60
    }

    it('should create booking with valid data', async () => {
      // Mock charger availability check
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
          .mockResolvedValueOnce({
            // First call: charger check
            data: {
              ...mockCharger,
              status: 'available'
            },
            error: null
          })
          .mockResolvedValueOnce({
            // Second call: insert booking
            data: mockBooking,
            error: null
          })
      }
      supabase.from.mockReturnValue(mockChain)

      const res = await request(app)
        .post('/api/bookings')
        .set(authHeaders)
        .send(validBookingBody)
        .expect(201)

      expect(res.body.success).toBe(true)
    })

    it('should reject booking with past date', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set(authHeaders)
        .send({
          ...validBookingBody,
          booking_date: '2020-01-01'
        })
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.errors).toBeDefined()
    })

    it('should reject booking with invalid time format', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set(authHeaders)
        .send({
          ...validBookingBody,
          booking_time: '25:99'
        })
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should reject booking with missing station_id', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set(authHeaders)
        .send({
          charger_id: mockBooking.charger_id,
          booking_date: '2025-12-25',
          booking_time: '10:00'
        })
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should reject booking when charger unavailable', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            ...mockCharger,
            status: 'occupied'  // Not available
          },
          error: null
        })
      })

      const res = await request(app)
        .post('/api/bookings')
        .set(authHeaders)
        .send(validBookingBody)
        .expect(409)

      expect(res.body.success).toBe(false)
    })

    it('should reject booking with duration too short', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set(authHeaders)
        .send({
          ...validBookingBody,
          duration_minutes: 5  // Less than 15
        })
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should reject booking with duration too long', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set(authHeaders)
        .send({
          ...validBookingBody,
          duration_minutes: 1000 // More than 480
        })
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should return 401 without auth', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send(validBookingBody)
        .expect(401)

      expect(res.body.success).toBe(false)
    })
  })

  // ================================
  // PATCH /api/bookings/:id/cancel
  // ================================
  describe('PATCH /api/bookings/:id/cancel', () => {

    it('should cancel booking successfully', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
          .mockResolvedValueOnce({
            // First: get booking
            data: {
              ...mockBooking,
              user_id: mockUser.id
            },
            error: null
          })
          .mockResolvedValueOnce({
            // Second: update to cancelled
            data: {
              ...mockBooking,
              status: 'cancelled'
            },
            error: null
          })
      }
      supabase.from.mockReturnValue(mockChain)

      const res = await request(app)
        .patch(`/api/bookings/${mockBooking.id}/cancel`)
        .set(authHeaders)
        .expect(200)

      expect(res.body.success).toBe(true)
    })

    it('should return 404 for unknown booking', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null
        })
      })

      const res = await request(app)
        .patch('/api/bookings/invalid-id/cancel')
        .set(authHeaders)
        .expect(404)

      expect(res.body.success).toBe(false)
    })

    it('should return 403 when cancelling another user\'s booking', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            ...mockBooking,
            user_id: 'different-user-id'
          },
          error: null
        })
      })

      const res = await request(app)
        .patch(`/api/bookings/${mockBooking.id}/cancel`)
        .set(authHeaders)
        .expect(403)

      expect(res.body.success).toBe(false)
    })

    it('should return 409 for already cancelled booking', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            ...mockBooking,
            user_id: mockUser.id,
            status: 'cancelled'
          },
          error: null
        })
      })

      const res = await request(app)
        .patch(`/api/bookings/${mockBooking.id}/cancel`)
        .set(authHeaders)
        .expect(409)

      expect(res.body.success).toBe(false)
    })
  })
})
