import { Router } from 'express'
import supabase from '../lib/supabase.js'
import logger from '../lib/logger.js'
import { stationController } from '../controllers/stationsController.js'
import { chargerController } from '../controllers/chargersController.js'
import { reviewController } from '../controllers/reviewsController.js'
import asyncHandler from '../middleware/asyncHandler.js'
import validateBody, { validateQuery } from '../middleware/validate.js'
import { 
  createStationSchema,
  updateStationSchema,
  stationQuerySchema
} from '../schemas/station.schema.js'
import { 
  uploadStationImage,
  uploadProfilePhoto
} from '../middleware/upload.js'
import { 
  storageService 
} from '../services/storage.service.js'

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

// GET /api/v1/stations/:id/bookings
// Returns today's bookings for a station to show availability
router.get('/:id/bookings',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('bookings')
      .select('id, status, booking_date, booking_time, charger_id')
      .eq('station_id', id)
      .eq('booking_date', today)
      .eq('status', 'confirmed')
    
    if (error) {
      logger.error({ err: error, stationId: id }, 'Bookings fetch error')
      throw error
    }
    
    res.json({
      success: true,
      data: { bookings: data || [] },
      timestamp: new Date().toISOString()
    })
  })
)

// POST /api/v1/stations/:id/images
router.post('/:id/images',
  uploadStationImage.array('images', 3),
  asyncHandler(async (req, res) => {
    const { id } = req.params
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILES',
          message: 'No images provided'
        }
      })
    }

    const uploadedUrls = await Promise.all(
      req.files.map(file => 
        storageService.uploadStationImage(
          file, id
        )
      )
    )

    // Update station images in database
    const { data: station } = await supabase
      .from('stations')
      .select('images')
      .eq('id', id)
      .single()

    const existingImages = station?.images || []
    const allImages = [
      ...existingImages,
      ...uploadedUrls
    ]

    await supabase
      .from('stations')
      .update({ images: allImages })
      .eq('id', id)

    res.status(201).json({
      success: true,
      data: {
        urls: uploadedUrls,
        total: allImages.length
      },
      timestamp: new Date().toISOString()
    })
  })
)

// POST /api/v1/stations/profile-photo
router.post('/profile-photo',
  uploadProfilePhoto.single('photo'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No photo provided'
        }
      })
    }

    const photoUrl = await storageService.uploadProfilePhoto(
      req.file, req.user.id
    )

    // Update user profile
    await supabase
      .from('profiles')
      .update({ avatar_url: photoUrl })
      .eq('id', req.user.id)

    res.json({
      success: true,
      data: { photoUrl },
      timestamp: new Date().toISOString()
    })
  })
)


export default router

