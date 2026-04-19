/**
 * Wraps async route handlers to automatically catch errors and
 * forward them to the global error handler middleware.
 * 
 * Without this wrapper you need try/catch in every controller.
 * With this wrapper errors are automatically forwarded to next(err)
 *
 * Usage:
 * router.get('/route', asyncHandler(myController))
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next)
  }
}

export default asyncHandler
