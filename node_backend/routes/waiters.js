const express = require('express');
const router = express.Router();
const Waiter = require('../models/Waiter');
const { authenticate, authorize } = require('../middleware/auth');

// Get all waiters
router.get('/', authenticate, async (req, res, next) => {
  try {
    const waiters = await Waiter.find().sort({ name: 1 });
    res.json(waiters);
  } catch (error) {
    next(error);
  }
});

// Get waiter by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const waiter = await Waiter.findById(req.params.id);

    if (!waiter) {
      return res.status(404).json({ message: 'Waiter not found' });
    }

    res.json(waiter);
  } catch (error) {
    next(error);
  }
});

// Create waiter (admin/manager only)
router.post(
  '/',
  authenticate,
  authorize('admin', 'manager'),
  async (req, res, next) => {
    try {
      const { name, userId } = req.body;

      const waiter = new Waiter({
        name,
        userId,
      });

      await waiter.save();
      res.status(201).json(waiter);
    } catch (error) {
      next(error);
    }
  }
);

// Delete waiter (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const waiter = await Waiter.findByIdAndDelete(req.params.id);

    if (!waiter) {
      return res.status(404).json({ message: 'Waiter not found' });
    }

    res.json({ message: 'Waiter deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
