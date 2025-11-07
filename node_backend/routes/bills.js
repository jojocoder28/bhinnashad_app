const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Order = require('../models/Order');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const StockItem = require('../models/StockItem');
const { authenticate, authorize } = require('../middleware/auth');

// Get all bills
router.get('/', authenticate, authorize('admin', 'manager', 'waiter'), async (req, res, next) => {
  try {
    const { status, tableNumber } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (tableNumber) filter.tableNumber = parseInt(tableNumber);

    const bills = await Bill.find(filter).sort({ timestamp: -1 }).limit(100);
    res.json(bills);
  } catch (error) {
    next(error);
  }
});

// Get bill by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    next(error);
  }
});

// Create bill for table (waiter/manager/admin only)
router.post(
  '/table/:tableNumber',
  authenticate,
  authorize('waiter', 'admin', 'manager'),
  async (req, res, next) => {
    try {
      const tableNumber = parseInt(req.params.tableNumber);

      // Find all served orders for this table
      const ordersToBill = await Order.find({
        tableNumber,
        status: 'served',
      });

      if (ordersToBill.length === 0) {
        return res.status(404).json({ message: 'No served orders found for this table' });
      }

      // Calculate totals
      let subtotal = 0;
      for (const order of ordersToBill) {
        for (const item of order.items) {
          subtotal += item.price * item.quantity;
        }
      }

      const tax = 0; // Tax included in price
      const total = subtotal;

      // Create bill
      const bill = new Bill({
        tableNumber,
        orderIds: ordersToBill.map(o => o._id.toString()),
        waiterId: ordersToBill[0].waiterId,
        subtotal,
        tax,
        total,
        status: 'unpaid',
        timestamp: new Date().toISOString(),
      });

      await bill.save();

      // Update orders to 'billed' status
      await Order.updateMany(
        { _id: { $in: ordersToBill.map(o => o._id) } },
        { $set: { status: 'billed' } }
      );

      res.status(201).json(bill);
    } catch (error) {
      next(error);
    }
  }
);

// Mark bill as paid
router.patch(
  '/:id/pay',
  authenticate,
  authorize('waiter', 'admin', 'manager'),
  async (req, res, next) => {
    try {
      const bill = await Bill.findById(req.params.id);

      if (!bill) {
        return res.status(404).json({ message: 'Bill not found' });
      }

      if (bill.status === 'paid') {
        return res.status(400).json({ message: 'Bill is already paid' });
      }

      bill.status = 'paid';
      await bill.save();

      // Free up table if it's a dine-in order
      if (bill.tableNumber) {
        await Table.findOneAndUpdate(
          { tableNumber: bill.tableNumber },
          { status: 'available', waiterId: null }
        );
      }

      // Auto-deplete stock based on sold items
      const billedOrders = await Order.find({ 
        _id: { $in: bill.orderIds.map(id => id) } 
      });

      for (const order of billedOrders) {
        for (const item of order.items) {
          const menuItem = await MenuItem.findById(item.menuItemId);
          if (menuItem && menuItem.ingredients) {
            for (const ingredient of menuItem.ingredients) {
              await StockItem.findByIdAndUpdate(
                ingredient.stockItemId,
                { $inc: { quantityInStock: -(ingredient.quantity * item.quantity) } }
              );
            }
          }
        }
      }

      res.json(bill);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
