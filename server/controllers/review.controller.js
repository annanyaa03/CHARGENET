import { reviewService } from '../services/review.service.js'

export const reviewController = {

  getByStation: async (req, res) => {
    const reviews = await reviewService
      .getByStation(req.params.id)
    
    res.json({
      success: true,
      data: { reviews },
      timestamp: new Date().toISOString()
    })
  },

  create: async (req, res) => {
    const review = await reviewService
      .create(
        req.body,
        req.user.id,
        req.user.email
      )
    
    res.status(201).json({
      success: true,
      data: { review },
      timestamp: new Date().toISOString()
    })
  },

  delete: async (req, res) => {
    await reviewService
      .delete(req.params.id, req.user.id)
    
    res.json({
      success: true,
      data: { 
        message: 'Review deleted' 
      },
      timestamp: new Date().toISOString()
    })
  }
}
