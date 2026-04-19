export const successResponse = (
  res,
  data,
  statusCode = 200,
  meta = null
) => {
  const response = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  }
  if (meta) response.meta = meta
  return res.status(statusCode).json(response)
}

export const errorResponse = (
  res,
  message,
  statusCode = 400,
  code = 'ERROR',
  errors = null
) => {
  const response = {
    success: false,
    error: {
      code,
      message
    },
    timestamp: new Date().toISOString()
  }
  if (errors) response.error.details = errors
  return res.status(statusCode).json(response)
}

export const paginatedResponse = (
  res,
  data,
  page,
  limit,
  total
) => {
  return res.status(200).json({
    success: true,
    data,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    },
    timestamp: new Date().toISOString()
  })
}

export const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST'
}
