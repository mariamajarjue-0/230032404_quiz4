// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
           res.status(401); 
           throw new Error('Not authorized, user not found for this token');
      }

      if (!req.user.isVerified) {
          res.status(403); 
          throw new Error('Not authorized, email not verified');
      }


      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401); 
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401); 
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect };