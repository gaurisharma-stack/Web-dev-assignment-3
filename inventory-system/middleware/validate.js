const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

// Rejects malformed :id params before hitting the DB
const validateObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError('Invalid product ID', 400));
  }
  next();
};

// Rejects empty bodies
const requireBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new AppError('Request body cannot be empty', 400));
  }
  next();
};

module.exports = { validateObjectId, requireBody };
