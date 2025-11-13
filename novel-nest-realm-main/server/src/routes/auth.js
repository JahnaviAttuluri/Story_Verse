const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function signToken(userId) {
  const secret = process.env.JWT_SECRET || 'jonv0488';
  return jwt.sign({ sub: userId }, secret, { expiresIn: '7d' });
}

function authRequired(req, res, next) {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const secret = process.env.JWT_SECRET || 'jonv0488';
    const payload = jwt.verify(token, secret);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(503).json({ message: 'Database connection unavailable. Please check MongoDB.' });
    }
    
    const { name, email, password } = req.body;
    console.log('Signup request:', { name, email: email ? 'provided' : 'missing', password: password ? 'provided' : 'missing' });
    
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await User.create({ name, email: email.toLowerCase(), passwordHash });
    const token = signToken(created._id.toString());
    res
      .cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .status(201)
      .json({ id: created._id, name: created.name, email: created.email });
  } catch (err) {
    console.error('Signup error:', err);
    console.error('Error stack:', err.stack);
    
    // Handle MongoDB connection errors
    if (err.name === 'MongoServerError' || err.message.includes('buffering timed out')) {
      return res.status(503).json({ message: 'Database connection error. Please check MongoDB is running.' });
    }
    
    // Handle duplicate key error (email already exists)
    if (err.code === 11000 || err.code === 11001) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message || 'Validation error' });
    }
    
    const message = err.message || 'Failed to sign up';
    res.status(500).json({ message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user._id.toString());
    res
      .cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message || 'Failed to login' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res
    .clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
    .status(204)
    .send();
});

// GET /api/auth/me
router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('_id name email');
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authRequired, async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.userId,
      { name },
      { new: true, select: '_id name email' }
    );
    res.json({ id: updated._id, name: updated.name, email: updated.email });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// PUT /api/auth/password
router.put('/password', authRequired, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'currentPassword and newPassword are required' });
    }
    const user = await User.findById(req.userId);
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(204).send();
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

module.exports = router;



