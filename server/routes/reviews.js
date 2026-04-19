import { Router } from 'express'
import { reviewController } from '../controllers/reviewsController.js'
import asyncHandler from '../middleware/asyncHandler.js'
import validateBody from '../middleware/validate.js'
import { createReviewSchema } from '../schemas/review.schema.js'
import { reviewLimiter } from '../middleware/rateLimit.js'

const router = Router()

// POST /api/reviews
router.post('/',
  reviewLimiter,
  validateBody(createReviewSchema),
  asyncHandler(reviewController.create)
)

// DELETE /api/reviews/:id
router.delete('/:id',
  asyncHandler(reviewController.delete)
)

export default router
