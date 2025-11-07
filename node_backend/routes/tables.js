const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Table = require('../models/Table');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Get all tables
router.get('/', authenticate, async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    next(error);
  }
});

// Get table by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json(table);
  } catch (error) {
    next(error);
  }
});

// Create table (admin/manager only)
router.post(
  '/',
  authenticate,
  authorize('admin', 'manager'),
  [
    body('tableNumber').isInt({ min: 1 }).withMessage('Valid table number is required'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const { tableNumber } = req.body;

      // Check if table number already exists
      const existingTable = await Table.findOne({ tableNumber });
      if (existingTable) {
        return res.status(400).json({ message: 'Table number already exists' });
      }

      const table = new Table({
        tableNumber,
        status: 'available',
        waiterId: null,
      });

      await table.save();
      res.status(201).json(table);
    } catch (error) {
      next(error);
    }
  }
);

// Update table status
router.patch(
  '/:id/status',
  authenticate,
  authorize('waiter', 'admin', 'manager'),
  async (req, res, next) => {
    try {
      const { status, waiterId } = req.body;

      const table = await Table.findByIdAndUpdate(
        req.params.id,
        { 
          status,
          waiterId: status === 'occupied' ? waiterId : null,
        },
        { new: true, runValidators: true }
      );

      if (!table) {
        return res.status(404).json({ message: 'Table not found' });
      }

      res.json(table);
    } catch (error) {
      next(error);
    }
  }
);

// Delete table (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
