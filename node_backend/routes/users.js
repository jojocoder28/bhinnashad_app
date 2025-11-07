const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Get all users (admin/manager only)
router.get('/', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Create user (admin only)
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'manager', 'waiter', 'user']).withMessage('Invalid role'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const { name, email, password, role, status } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role,
        status: status || 'approved',
      });

      await user.save();

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
);

// Update user
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  async (req, res, next) => {
    try {
      const { name, email, role, status, password } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (status) updateData.status = status;
      
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// Delete user (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Approve user (admin/manager only)
router.patch(
  '/:id/approve',
  authenticate,
  authorize('admin', 'manager'),
  async (req, res, next) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { status: 'approved' },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
