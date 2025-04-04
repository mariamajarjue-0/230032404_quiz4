// middleware/roleMiddleware.js

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
      roles = [roles];
    }
  
    return (req, res, next) => {
      
      if (!req.user || !roles.includes(req.user.role)) {
        res.status(403); // Forbidden status
        return next(new Error(`User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`));
      }
      next();
    };
  };
  
  module.exports = { authorize };