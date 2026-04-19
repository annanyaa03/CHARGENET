import { ZodError } from 'zod'

/**
 * Generic validation middleware factory
 * Usage: router.post('/route', validateBody(schema), handler)
 */
const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      // Parse and validate request body
      // This also strips unknown fields
      const validated = await schema
        .parseAsync(req.body)
      
      // Replace body with validated/cleaned data
      req.body = validated
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        // Format Zod errors into readable messages
        const errors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code
        }))

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
          timestamp: new Date().toISOString()
        })
      }
      next(err)
    }
  }
}

/**
 * Validate query params
 */
const validateQuery = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema
        .parseAsync(req.query)
      req.query = validated
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code
        }))
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors,
          timestamp: new Date().toISOString()
        })
      }
      next(err)
    }
  }
}

/**
 * Validate URL params
 */
const validateParams = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema
        .parseAsync(req.params)
      req.params = validated
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code
        }))
        return res.status(400).json({
          success: false,
          message: 'Invalid URL parameters',
          errors,
          timestamp: new Date().toISOString()
        })
      }
      next(err)
    }
  }
}

export { validateBody, validateQuery, validateParams }
export default validateBody
