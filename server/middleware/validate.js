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
      // Delegate to central error handler
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
      next(err)
    }
  }
}

export { validateBody, validateQuery, validateParams }
export default validateBody
