// routes/authRoutes.js
const express = require('express');
const {
  registerUser,
  verifyUserEmail,
  loginUser,
  getMe 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); 

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.get('/verify-email/:token', verifyUserEmail);
router.post('/login', loginUser);

router.get('/me', protect, getMe);




module.exports = router;