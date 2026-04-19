import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'
import asyncHandler from '../middleware/asyncHandler.js'
import validateBody from '../middleware/validate.js'
import { loginSchema, signupSchema } from '../schemas/auth.schema.js'
import { authLimiter } from '../middleware/rateLimit.js'

const router = Router()

// POST /api/auth/signup
router.post('/signup',
  authLimiter,
  validateBody(signupSchema),
  asyncHandler(authController.signup)
)

// POST /api/auth/login
router.post('/login',
  authLimiter,
  validateBody(loginSchema),
  asyncHandler(authController.login)
)

// POST /api/auth/logout
router.post('/logout',
  asyncHandler(authController.logout)
)

export default router
