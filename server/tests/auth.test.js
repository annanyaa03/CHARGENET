import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import requireAuth from '../middleware/auth.js'
import supabase from '../services/supabase.js'

// Mock data
const mockUser = {
  id: 'test-user-uuid',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' }
}

const createTestApp = () => {
  const app = express()
  app.use(express.json())
  
  // Public route
  app.get('/api/v1/stations', (req, res) => {
    res.json({ success: true, data: [] })
  })
  
  // Apply auth middleware
  app.use(requireAuth)
  
  // Private route
  app.post('/api/v1/bookings', (req, res) => {
    res.json({ success: true, user: req.user })
  })
  
  return app
}

describe('Auth Middleware', () => {
  let app

  beforeEach(() => {
    app = createTestApp()
    vi.clearAllMocks()
    
    // Default mocks
    vi.mock('../services/supabase.js', () => ({
      default: {
        auth: {
          getUser: vi.fn()
        }
      }
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should allow public GET requests without token', async () => {
    const res = await request(app)
      .get('/api/v1/stations')
      .expect(200)
    
    expect(res.body.success).toBe(true)
  })

  it('should block POST requests without token', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .send({ station_id: 'test' })
      .expect(401)
    
    expect(res.body.success).toBe(false)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('should allow POST with valid token', async () => {
    // Mock Supabase getUser to return valid user
    supabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', 'Bearer valid-test-token')
      .send({
        station_id: 'mock-station-id',
        charger_id: 'mock-charger-id',
        booking_date: '2026-12-25',
        booking_time: '10:00',
        duration_minutes: 60
      })
      .expect(200)
    
    expect(res.body.success).toBe(true)
    expect(res.body.user.id).toBe(mockUser.id)
  })

  it('should block with invalid token', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token', status: 401 }
    })
    
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', 'Bearer invalid-token')
      .send({})
      .expect(401)
    
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('should block with malformed authorization header', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', 'Basic some-base64-stuff')
      .send({})
      .expect(401)
      
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })
})
