import { stationService } from '../services/station.service.js'
import { 
  successResponse,
  paginatedResponse 
} from '../lib/response.js'

export const stationController = {

  getAll: async (req, res) => {
    const result = await stationService
      .getAll(req.query)
    
    paginatedResponse(
      res,
      { stations: result.data },
      result.page,
      result.limit,
      result.total
    )
  },

  getById: async (req, res) => {
    const station = await stationService
      .getById(req.params.id)
    successResponse(res, { station })
  },

  getBySlug: async (req, res) => {
    const station = await stationService
      .getBySlug(req.params.slug)
    successResponse(res, { station })
  },

  create: async (req, res) => {
    const station = await stationService
      .create(req.body, req.user?.id)
    successResponse(res, { station }, 201)
  },

  update: async (req, res) => {
    const station = await stationService
      .update(req.params.id, req.body, req.user?.id)
    successResponse(res, { station })
  },

  delete: async (req, res) => {
    await stationService
      .delete(req.params.id)
    successResponse(res, { 
      message: 'Station deleted successfully' 
    })
  }
}
