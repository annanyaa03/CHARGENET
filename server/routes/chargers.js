import { Router } from 'express'
import { chargerController } from '../controllers/charger.controller.js'
import asyncHandler from '../middleware/asyncHandler.js'

const router = Router()

// POST /api/chargers
router.post('/',
  asyncHandler(chargerController.create)
)

// PATCH /api/chargers/:id/status
router.patch('/:id/status',
  asyncHandler(chargerController.updateStatus)
)

// DELETE /api/chargers/:id
router.delete('/:id',
  asyncHandler(chargerController.delete)
)

export default router
