import { describe, it, expect, vi, 
  beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'

// Import mock data
import { 
  mockStation, 
  mockCharger,
  mockUser,
  authHeaders
} from './helpers/mockData.js'

// Import mocked supabase
import supabase from '../services/supabase.js'

// Import real error handler
import errorHandler from '../middleware/errorHandler.js'

// Create a minimal test app
// This avoids port conflicts
const createTestApp = async () => {
  const app = express()
  app.use(express.json())
  
  // Mock auth middleware for tests
  // Attaches fake user to req
  app.use((req, res, next) => {
    if (req.headers.authorization?.startsWith('Bearer ')) {
      req.user = mockUser
    }
    next()
  })

  // Import and mount routes
  const stationRoutes = await import('../routes/stations.js')
  app.use('/api/stations', stationRoutes.default)

  // Use the REAL error handler
  app.use(errorHandler)

  return app
}

describe('Stations API', () => {
  let app

  beforeEach(async () => {
    app = await createTestApp()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ================================
  // GET /api/stations
  // ================================
  describe('GET /api/stations', () => {
    
    it('should return all active stations', async () => {
      // Setup mock to return stations
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({
              data: [mockStation],
              error: null
            })
          })
        })
      })

      const res = await request(app)
        .get('/api/stations')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.stations).toBeDefined()
      expect(res.body.meta).toBeDefined()
      expect(res.body.meta.page).toBe(1)
      expect(res.body.meta.total).toBe(0) // Mock doesn't return count unless setup
    })

    it('should return empty array when no stations found', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      })

      const res = await request(app)
        .get('/api/stations')
        .expect(200)

      expect(res.body.success).toBe(true)
    })

    it('should handle database errors', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'DB connection failed' }
            })
          })
        })
      })

      const res = await request(app)
        .get('/api/stations')
        .expect(500)

      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBeDefined()
    })
  })

  // ================================
  // GET /api/stations/:id
  // ================================
  describe('GET /api/stations/:id', () => {

    it('should return station by valid ID', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockStation,
              error: null
            })
          })
        })
      })

      const res = await request(app)
        .get(`/api/stations/${mockStation.id}`)
        .expect(200)

      expect(res.body.success).toBe(true)
    })

    it('should return 404 for unknown station', async () => {
      // Create an error that looks like a Supabase error
      const supabaseError = new Error('Row not found')
      supabaseError.code = 'PGRST116'

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: supabaseError
            })
          })
        })
      })

      // Use a valid UUID format so it passes the UUID guard and hits the DB mock
      const res = await request(app)
        .get('/api/stations/00000000-0000-0000-0000-000000000000')
        .expect(404)

      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('NOT_FOUND')
    })
  })

  // ================================
  // GET /api/stations/slug/:slug
  // ================================
  describe('GET /api/stations/slug/:slug', () => {

    it('should return station by slug', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockStation,
              error: null
            })
          })
        })
      })

      const res = await request(app)
        .get(`/api/stations/slug/${mockStation.slug}`)
        .expect(200)

      expect(res.body.success).toBe(true)
    })
  })

  // ================================
  // POST /api/stations
  // ================================
  describe('POST /api/stations', () => {

    const validStationBody = {
      name: 'New Test Station',
      address: '123 Test Street',
      city: 'Delhi',
      state: 'Delhi',
      lat: 28.6139,
      lng: 77.2090,
      total_slots: 3
    }

    it('should create station with valid data and auth', async () => {
      supabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                ...mockStation,
                ...validStationBody
              },
              error: null
            })
          })
        })
      })

      const res = await request(app)
        .post('/api/stations')
        .set(authHeaders)
        .send(validStationBody)
        .expect(201)

      expect(res.body.success).toBe(true)
    })

    it('should reject station with missing required fields', async () => {
      const res = await request(app)
        .post('/api/stations')
        .set(authHeaders)
        .send({ 
          name: 'Incomplete Station'
          // Missing address, lat, lng etc
        })
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
      expect(res.body.error.details).toBeDefined()
    })

    it('should reject invalid latitude', async () => {
      const res = await request(app)
        .post('/api/stations')
        .set(authHeaders)
        .send({
          ...validStationBody,
          lat: 999  // Invalid lat
        })
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should reject invalid longitude', async () => {
      const res = await request(app)
        .post('/api/stations')
        .set(authHeaders)
        .send({
          ...validStationBody,
          lng: -999  // Invalid lng
        })
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  // ================================
  // PUT /api/stations/:id
  // ================================
  describe('PUT /api/stations/:id', () => {

    it('should update station', async () => {
      // Mock the ownership check (select) AND the update call
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
          .mockResolvedValueOnce({
            // First call: ownership check
            data: { owner_id: mockUser.id },
            error: null
          })
          .mockResolvedValueOnce({
            // Second call: update
            data: {
              ...mockStation,
              name: 'Updated Name'
            },
            error: null
          })
      }
      
      supabase.from.mockReturnValue(mockChain)

      const res = await request(app)
        .put(`/api/stations/${mockStation.id}`)
        .set(authHeaders)
        .send({ name: 'Updated Name' })
        .expect(200)

      expect(res.body.success).toBe(true)
    })
  })

  // ================================
  // DELETE /api/stations/:id
  // ================================
  describe('DELETE /api/stations/:id', () => {

    it('should delete station', async () => {
      supabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      })

      const res = await request(app)
        .delete(`/api/stations/${mockStation.id}`)
        .set(authHeaders)
        .expect(200)

      expect(res.body.success).toBe(true)
    })
  })

  // ================================
  // GET /api/stations/:id/chargers
  // ================================
  describe('GET /api/stations/:id/chargers', () => {

    it('should return chargers for station', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockCharger],
              error: null
            })
          })
        })
      })

      const res = await request(app)
        .get(`/api/stations/${mockStation.id}/chargers`)
        .expect(200)

      expect(res.body.success).toBe(true)
    })
  })
})
