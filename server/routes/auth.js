import { Router } from 'express'
import { authController } from '../controllers/authController.js'
import asyncHandler from '../middleware/asyncHandler.js'
import validateBody from '../middleware/validate.js'
import { loginSchema, signupSchema } from '../schemas/auth.schema.js'

const router = Router()

// POST /api/auth/signup
router.post('/signup',
  validateBody(signupSchema),
  asyncHandler(authController.signup)
)

// POST /api/auth/login
router.post('/login',
  validateBody(loginSchema),
  asyncHandler(authController.login)
)

// POST /api/auth/logout
router.post('/logout',
  asyncHandler(authController.logout)
)

export default router
