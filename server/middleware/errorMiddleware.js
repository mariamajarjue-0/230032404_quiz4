// middleware/errorMiddleware.js

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); 
  };
  
  const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;
  
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
      statusCode = 404; 
      message = 'Resource not found (Invalid ID)';
    }
  
    if (err.name === 'ValidationError') {
        statusCode = 400; 
        message = Object.values(err.errors)
                        .map(val => val.message)
                        .join(', ');
    }
  
    if (err.code === 11000) {
      statusCode = 400;
      const field = Object.keys(err.keyValue)[0];
      message = `Duplicate field value entered: ${field} - ${err.keyValue[field]}. Please use another value.`;
    }
  
    res.status(statusCode).json({
      status: 'error',
      message: message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  };
  
  module.exports = { notFound, errorHandler };