import { Router } from 'express'
import { stationController } from '../controllers/station.controller.js'
import { chargerController } from '../controllers/charger.controller.js'
import { reviewController } from '../controllers/review.controller.js'
import asyncHandler from '../middleware/asyncHandler.js'
import validateBody, { validateQuery } from '../middleware/validate.js'
import { 
  createStationSchema,
  updateStationSchema,
  stationQuerySchema
} from '../schemas/station.schema.js'

const router = Router()

// GET /api/stations
router.get('/',
  validateQuery(stationQuerySchema),
  asyncHandler(stationController.getAll)
)

// GET /api/stations/slug/:slug
// NOTE: Must be before /:id to avoid conflict
router.get('/slug/:slug',
  asyncHandler(stationController.getBySlug)
)

// GET /api/stations/:id
router.get('/:id',
  asyncHandler(stationController.getById)
)

// POST /api/stations
router.post('/',
  validateBody(createStationSchema),
  asyncHandler(stationController.create)
)

// PUT /api/stations/:id
router.put('/:id',
  validateBody(updateStationSchema),
  asyncHandler(stationController.update)
)

// DELETE /api/stations/:id
router.delete('/:id',
  asyncHandler(stationController.delete)
)

// GET /api/stations/:id/chargers
router.get('/:id/chargers',
  asyncHandler(chargerController.getByStation)
)

// GET /api/stations/:id/reviews
router.get('/:id/reviews',
  asyncHandler(reviewController.getByStation)
)

export default router
