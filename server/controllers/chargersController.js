import { chargerService } from '../services/supabase.js'
import { successResponse } from '../lib/response.js'

export const chargerController = {

  getByStation: async (req, res) => {
    const chargers = await chargerService
      .getByStation(req.params.id)
    successResponse(res, { chargers })
  },

  create: async (req, res) => {
    const charger = await chargerService
      .create(req.body)
    successResponse(res, { charger }, 201)
  },

  updateStatus: async (req, res) => {
    const charger = await chargerService
      .updateStatus(
        req.params.id, 
        req.body.status
      )
    successResponse(res, { charger })
  },

  delete: async (req, res) => {
    await chargerService
      .delete(req.params.id)
    successResponse(res, { 
      message: 'Charger deleted' 
    })
  }
}
