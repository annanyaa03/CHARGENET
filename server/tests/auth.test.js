import { describe, it, expect, vi,
  beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'

import { mockUser } from './helpers/mockData.js'
import supabase from '../services/supabase.js'

const createTestApp = async () => {
  const app = express()
  app.use(express.json())

  const authRoutes = await import('../routes/auth.js')
  app.use('/api/auth', authRoutes.default)

  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      errors: err.errors
    })
  })

  return app
}

describe('Auth API', () => {
  let app

  beforeEach(async () => {
    app = await createTestApp()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ================================
  // POST /api/auth/signup
  // ================================
  describe('POST /api/auth/signup', () => {

    const validSignupBody = {
      email: 'newuser@example.com',
      password: 'SecurePass123',
      full_name: 'New User'
    }

    it('should signup successfully with valid data', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: {
          user: mockUser,
          session: null
        },
        error: null
      })

      const res = await request(app)
        .post('/api/auth/signup')
        .send(validSignupBody)
        .expect(201)

      expect(res.body.success).toBe(true)
      expect(res.body.data.message).toContain('Check email')
    })

    it('should reject signup with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          ...validSignupBody,
          email: 'not-an-email'
        })
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.errors).toBeDefined()
      
      const emailError = res.body.errors.find(e => e.field === 'email')
      expect(emailError).toBeDefined()
    })

    it('should reject signup with weak password (no uppercase)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          ...validSignupBody,
          password: 'weakpassword123'
        })
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should reject signup with password too short', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          ...validSignupBody,
          password: 'Sh0rt'
        })
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should reject signup with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          password: 'SecurePass123'
        })
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should reject signup with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com'
        })
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should handle Supabase signup error', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already registered' }
      })

      const res = await request(app)
        .post('/api/auth/signup')
        .send(validSignupBody)
        .expect(500)

      expect(res.body.success).toBe(false)
    })
  })

  // ================================
  // POST /api/auth/login
  // ================================
  describe('POST /api/auth/login', () => {

    const validLoginBody = {
      email: 'test@example.com',
      password: 'SecurePass123'
    }

    it('should login successfully with valid credentials', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: mockUser,
          session: {
            access_token: 'mock-access-token',
            expires_at: 9999999999
          }
        },
        error: null
      })

      const res = await request(app)
        .post('/api/auth/login')
        .send(validLoginBody)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.access_token).toBeDefined()
      expect(res.body.data.user).toBeDefined()
    })

    it('should return 401 with wrong credentials', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' }
      })

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'WrongPass123'
        })
        .expect(401)

      expect(res.body.success).toBe(false)
    })

    it('should reject login with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-valid-email',
          password: 'SomePassword123'
        })
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.errors).toBeDefined()
    })

    it('should reject login with empty password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: ''
        })
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should reject login with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.errors.length).toBeGreaterThan(0)
    })

    it('should reject login with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'SecurePass123' })
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should reject login with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400)

      expect(res.body.success).toBe(false)
    })
  })

  // ================================
  // POST /api/auth/logout
  // ================================
  describe('POST /api/auth/logout', () => {

    it('should logout successfully', async () => {
      // Add auth middleware for this test
      const appWithAuth = express()
      appWithAuth.use(express.json())
      appWithAuth.use((req, res, next) => {
        if (req.headers.authorization) {
          req.user = mockUser
          req.token = 'test-token'
        }
        next()
      })
      const authRoutes = await import('../routes/auth.js')
      appWithAuth.use('/api/auth', authRoutes.default)
      appWithAuth.use((err, req, res, next) => {
        res.status(err.status || 500).json({
          success: false,
          message: err.message
        })
      })

      supabase.auth.signOut.mockResolvedValue({
        error: null
      })

      const res = await request(appWithAuth)
        .post('/api/auth/logout')
        .set({
          Authorization: 'Bearer test-token'
        })
        .expect(200)

      expect(res.body.success).toBe(true)
    })
  })
})
