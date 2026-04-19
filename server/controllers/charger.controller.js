import { chargerService } from '../services/charger.service.js'

export const chargerController = {

  getByStation: async (req, res) => {
    const chargers = await chargerService
      .getByStation(req.params.id)
    
    res.json({
      success: true,
      data: { chargers },
      timestamp: new Date().toISOString()
    })
  },

  create: async (req, res) => {
    const charger = await chargerService
      .create(req.body)
    
    res.status(201).json({
      success: true,
      data: { charger },
      timestamp: new Date().toISOString()
    })
  },

  updateStatus: async (req, res) => {
    const charger = await chargerService
      .updateStatus(
        req.params.id, 
        req.body.status
      )
    
    res.json({
      success: true,
      data: { charger },
      timestamp: new Date().toISOString()
    })
  },

  delete: async (req, res) => {
    await chargerService
      .delete(req.params.id)
    
    res.json({
      success: true,
      data: { 
        message: 'Charger deleted' 
      },
      timestamp: new Date().toISOString()
    })
  }
}
