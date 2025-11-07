const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const StockItem = require('../models/StockItem');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const StockUsageLog = require('../models/StockUsageLog');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// ===== STOCK ITEMS =====

// Get all stock items
router.get('/items', authenticate, async (req, res, next) => {
  try {
    const stockItems = await StockItem.find().sort({ name: 1 });
    res.json(stockItems);
  } catch (error) {
    next(error);
  }
});

// Create stock item (admin/manager only)
router.post(
  '/items',
  authenticate,
  authorize('admin', 'manager'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('unit').isIn(['kg', 'g', 'l', 'ml', 'piece']).withMessage('Invalid unit'),
    body('quantityInStock').isFloat({ min: 0 }).withMessage('Quantity must be positive'),
    body('lowStockThreshold').isFloat({ min: 0 }).withMessage('Threshold must be positive'),
    body('averageCostPerUnit').isFloat({ min: 0 }).withMessage('Cost must be positive'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const stockItem = new StockItem(req.body);
      await stockItem.save();
      res.status(201).json(stockItem);
    } catch (error) {
      next(error);
    }
  }
);

// Update stock item (admin/manager only)
router.put(
  '/items/:id',
  authenticate,
  authorize('admin', 'manager'),
  async (req, res, next) => {
    try {
      const stockItem = await StockItem.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!stockItem) {
        return res.status(404).json({ message: 'Stock item not found' });
      }

      res.json(stockItem);
    } catch (error) {
      next(error);
    }
  }
);

// Delete stock item (admin only)
router.delete('/items/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const stockItem = await StockItem.findByIdAndDelete(req.params.id);

    if (!stockItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    res.json({ message: 'Stock item deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ===== SUPPLIERS =====

// Get all suppliers
router.get('/suppliers', authenticate, async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
});

// Create supplier (admin/manager only)
router.post(
  '/suppliers',
  authenticate,
  authorize('admin', 'manager'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const supplier = new Supplier(req.body);
      await supplier.save();
      res.status(201).json(supplier);
    } catch (error) {
      next(error);
    }
  }
);

// Update supplier (admin/manager only)
router.put(
  '/suppliers/:id',
  authenticate,
  authorize('admin', 'manager'),
  async (req, res, next) => {
    try {
      const supplier = await Supplier.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }

      res.json(supplier);
    } catch (error) {
      next(error);
    }
  }
);

// Delete supplier (admin only)
router.delete('/suppliers/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ===== PURCHASE ORDERS =====

// Get all purchase orders
router.get('/purchase-orders', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const purchaseOrders = await PurchaseOrder.find().sort({ date: -1 }).limit(100);
    res.json(purchaseOrders);
  } catch (error) {
    next(error);
  }
});

// Create purchase order (admin/manager only)
router.post(
  '/purchase-orders',
  authenticate,
  authorize('admin', 'manager'),
  async (req, res, next) => {
    try {
      const { supplierId, items, date } = req.body;

      // Validate supplier
      const supplier = await Supplier.findById(supplierId);
      if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }

      // Calculate total cost
      let totalCost = 0;
      for (const item of items) {
        const stockItem = await StockItem.findById(item.stockItemId);
        if (!stockItem) {
          return res.status(404).json({ 
            message: `Stock item ${item.stockItemId} not found` 
          });
        }
        totalCost += item.costPerUnit * item.quantity;
      }

      const purchaseOrder = new PurchaseOrder({
        supplierId,
        items,
        totalCost,
        date: date || new Date().toISOString(),
        status: 'ordered',
      });

      await purchaseOrder.save();
      res.status(201).json(purchaseOrder);
    } catch (error) {
      next(error);
    }
  }
);

// Update purchase order status (admin/manager only)
router.patch(
  '/purchase-orders/:id/status',
  authenticate,
  authorize('admin', 'manager'),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const purchaseOrder = await PurchaseOrder.findById(req.params.id);

      if (!purchaseOrder) {
        return res.status(404).json({ message: 'Purchase order not found' });
      }

      purchaseOrder.status = status;

      // If status is 'received', update stock quantities and average costs
      if (status === 'received') {
        for (const item of purchaseOrder.items) {
          const stockItem = await StockItem.findById(item.stockItemId);
          if (stockItem) {
            const currentStockValue = stockItem.quantityInStock * stockItem.averageCostPerUnit;
            const purchaseValue = item.quantity * item.costPerUnit;
            
            const newTotalQuantity = stockItem.quantityInStock + item.quantity;
            const newAverageCost = (currentStockValue + purchaseValue) / newTotalQuantity;

            stockItem.quantityInStock = newTotalQuantity;
            stockItem.averageCostPerUnit = newAverageCost;
            await stockItem.save();
          }
        }
      }

      await purchaseOrder.save();
      res.json(purchaseOrder);
    } catch (error) {
      next(error);
    }
  }
);

// ===== STOCK USAGE LOGS =====

// Get stock usage logs
router.get('/usage-logs', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const { stockItemId, category } = req.query;
    const filter = {};

    if (stockItemId) filter.stockItemId = stockItemId;
    if (category) filter.category = category;

    const logs = await StockUsageLog.find(filter).sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

// Record stock usage (admin/manager only)
router.post(
  '/usage-logs',
  authenticate,
  authorize('admin', 'manager'),
  [
    body('stockItemId').notEmpty().withMessage('Stock item ID is required'),
    body('quantityUsed').isFloat({ min: 0 }).withMessage('Quantity must be positive'),
    body('category').isIn(['kitchen_prep', 'spillage', 'staff_meal', 'other']).withMessage('Invalid category'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const { stockItemId, quantityUsed, category, notes } = req.body;

      // Validate stock item
      const stockItem = await StockItem.findById(stockItemId);
      if (!stockItem) {
        return res.status(404).json({ message: 'Stock item not found' });
      }

      // Update stock quantity
      stockItem.quantityInStock -= quantityUsed;
      await stockItem.save();

      // Record usage
      const stockUsageLog = new StockUsageLog({
        stockItemId,
        quantityUsed,
        category,
        notes,
        recordedBy: req.user._id.toString(),
        timestamp: new Date().toISOString(),
      });

      await stockUsageLog.save();
      res.status(201).json(stockUsageLog);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
