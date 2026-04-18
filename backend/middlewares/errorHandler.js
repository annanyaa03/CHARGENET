/**
 * Global error handler middleware
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
    let error = { ...err };
  
    error.message = err.message;
  
    // Log to console for dev
    console.error(err);
  
    // Mongoose bad ObjectId (if using MongoDB, but kept for reference or custom errors)
    if (err.name === 'CastError') {
      const message = 'Resource not found';
      error = new Error(message);
      error.statusCode = 404;
    }
  
    // Duplicate key error
    if (err.code === 11000) {
      const message = 'Duplicate field value entered';
      error = new Error(message);
      error.statusCode = 400;
    }
  
    // Validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message);
      error = new Error(message);
      error.statusCode = 400;
    }
  
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
      error: process.env.NODE_ENV === 'development' ? err : undefined
    });
  };
  
  module.exports = errorHandler;
