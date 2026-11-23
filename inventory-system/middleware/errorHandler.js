const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Server error';
  let details;

  // Mongoose validation failure (schema rules broken)
  if (err.name === 'ValidationError') {
    status = 400;
    details = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed';
  }
  // Invalid ObjectId or bad type cast
  else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${err.path}`;
  }
  // Duplicate key (unique SKU)
  else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value: ${field} "${err.keyValue[field]}" already exists`;
  }
  // Malformed JSON body
  else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON in request body';
  }

  res.status(status).json({ success: false, message, ...(details && { errors: details }) });
};

module.exports = { notFound, errorHandler };
