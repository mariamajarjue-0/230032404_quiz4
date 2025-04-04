// controllers/authController.js
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const validator = require('validator');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};


// @desc    Register a new user & send verification email
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body; 

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }
  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const user = await User.create({
    email: email.toLowerCase(),
    password,
    role: role === 'admin' ? 'admin' : 'user'
  });

  const verificationToken = user.getVerificationToken();

  await user.save({ validateBeforeSave: false }); 

  const verifyUrl = `${process.env.FRONTEND_URL || req.protocol + '://' + req.get('host')}/verify-email/${verificationToken}`;

  const message = `
    <h1>Email Verification Required</h1>
    <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
    <a href="${verifyUrl}" clicktracking=off>${verifyUrl}</a>
    <p>This link will expire in 15 minutes.</p>
    <p>If you did not request this registration, please ignore this email.</p>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address - Task Management System',
      html: message,
      text: `Please verify your email by visiting this URL: ${verifyUrl}`
    });

    res.status(201).json({
      success: true,
      message: `Registration successful! Verification email sent to ${user.email}. Please check your inbox (and spam folder).`,
    });
  } catch (err) {
    console.error("Email sending failed after user creation:", err);
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new Error('User registered, but verification email could not be sent. Please contact support or try requesting verification again later.'));
  }
});


// @desc    Verify user email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyUserEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
      res.status(400);
      throw new Error('Verification token is missing');
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400); 
    throw new Error('Invalid or expired verification token. Please register again or request a new verification link.');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You can now log in.',
  });
});


// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }
   if (!validator.isEmail(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (!user.isVerified) {
    res.status(403);
    throw new Error('Email not verified. Please check your inbox or request verification again.');
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
  });
});


// @desc    Get current user profile (Example protected route)
// @route   GET /api/auth/me
// @access  Private (requires JWT)
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


module.exports = {
  registerUser,
  verifyUserEmail,
  loginUser,
  getMe 
};
