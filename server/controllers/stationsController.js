import { stationService } from '../services/supabase.js'

export const stationController = {

  getAll: async (req, res) => {
    const { stations, total } = await stationService
      .getAll(req.query)
    
    res.json({
      success: true,
      data: { 
        stations,
        total,
        count: stations.length
      },
      timestamp: new Date().toISOString()
    })
  },

  getById: async (req, res) => {
    const station = await stationService
      .getById(req.params.id)
    
    res.json({
      success: true,
      data: { station },
      timestamp: new Date().toISOString()
    })
  },

  getBySlug: async (req, res) => {
    const station = await stationService
      .getBySlug(req.params.slug)
    
    res.json({
      success: true,
      data: { station },
      timestamp: new Date().toISOString()
    })
  },

  create: async (req, res) => {
    const station = await stationService
      .create(req.body, req.user?.id)
    
    res.status(201).json({
      success: true,
      data: { station },
      timestamp: new Date().toISOString()
    })
  },

  update: async (req, res) => {
    const station = await stationService
      .update(req.params.id, req.body, req.user?.id)
    
    res.json({
      success: true,
      data: { station },
      timestamp: new Date().toISOString()
    })
  },

  delete: async (req, res) => {
    await stationService
      .delete(req.params.id)
    
    res.json({
      success: true,
      data: { 
        message: 'Station deleted successfully' 
      },
      timestamp: new Date().toISOString()
    })
  }
}
