const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Get all orders
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, waiterId, tableNumber, orderType } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (waiterId) filter.waiterId = waiterId;
    if (tableNumber) filter.tableNumber = parseInt(tableNumber);
    if (orderType) filter.orderType = orderType;

    if (req.user.role === 'waiter') {
      filter.waiterId = req.user._id.toString();
    }

    const orders = await Order.find(filter).sort({ timestamp: -1 }).limit(100);
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// Get order by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'waiter' && order.waiterId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// Create order
router.post(
  '/',
  authenticate,
  authorize('waiter', 'admin', 'manager'),
  [
    body('orderType').isIn(['dine-in', 'pickup']).withMessage('Order type must be dine-in or pickup'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.menuItemId').notEmpty().withMessage('Menu item ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const { tableNumber, orderType, items } = req.body;

      if (orderType === 'dine-in' && !tableNumber) {
        return res.status(400).json({ message: 'Table number is required for dine-in orders' });
      }

      const orderItems = [];

      for (const item of items) {
        const menuItem = await MenuItem.findById(item.menuItemId);
        
        if (!menuItem) {
          return res.status(404).json({ message: `Menu item ${item.menuItemId} not found` });
        }

        if (!menuItem.isAvailable) {
          return res.status(400).json({ message: `${menuItem.name} is currently unavailable` });
        }

        orderItems.push({
          menuItemId: menuItem._id.toString(),
          quantity: item.quantity,
          price: menuItem.price,
        });
      }

      const order = new Order({
        tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
        orderType,
        waiterId: req.user._id.toString(),
        items: orderItems,
        status: 'pending',
        timestamp: new Date().toISOString(),
      });

      await order.save();

      if (orderType === 'dine-in') {
        await Table.findOneAndUpdate(
          { tableNumber },
          { status: 'occupied', waiterId: req.user._id.toString() }
        );
      }

      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }
);

// Update order status
router.patch('/:id/status', authenticate, authorize('admin', 'manager', 'waiter'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const validTransitions = {
      pending: ['approved', 'cancelled'],
      approved: ['prepared', 'cancelled'],
      prepared: ['served', 'cancelled'],
      served: ['billed'],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ message: `Cannot transition from ${order.status} to ${status}` });
    }

    order.status = status;
    await order.save();

    if ((status === 'served' || status === 'cancelled') && order.tableNumber) {
      const otherActiveOrders = await Order.countDocuments({
        tableNumber: order.tableNumber,
        status: { $nin: ['served', 'cancelled', 'billed'] },
        _id: { $ne: order._id },
      });

      if (otherActiveOrders === 0) {
        await Table.findOneAndUpdate(
          { tableNumber: order.tableNumber },
          { status: 'available', waiterId: null }
        );
      }
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// Cancel order
router.post('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'waiter' && order.waiterId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    await order.save();

    if (order.tableNumber) {
      const otherActiveOrders = await Order.countDocuments({
        tableNumber: order.tableNumber,
        status: { $nin: ['served', 'cancelled', 'billed'] },
        _id: { $ne: order._id },
      });

      if (otherActiveOrders === 0) {
        await Table.findOneAndUpdate(
          { tableNumber: order.tableNumber },
          { status: 'available', waiterId: null }
        );
      }
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
