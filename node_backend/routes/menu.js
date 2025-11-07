const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const MenuItem = require('../models/MenuItem');
const StockItem = require('../models/StockItem');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Get all menu items
router.get('/', async (req, res, next) => {
  try {
    const { category, isAvailable } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const menuItems = await MenuItem.find(filter).sort({ name: 1 });
    res.json(menuItems);
  } catch (error) {
    next(error);
  }
});

// Get menu item by ID
router.get('/:id', async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    next(error);
  }
});

// Create menu item (admin/manager only)
router.post(
  '/',
  authenticate,
  authorize('admin', 'manager'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const { name, price, category, imageUrl, isAvailable, ingredients } = req.body;

      // Calculate cost of goods if ingredients are provided
      let costOfGoods = 0;
      if (ingredients && ingredients.length > 0) {
        for (const ing of ingredients) {
          const stockItem = await StockItem.findById(ing.stockItemId);
          if (stockItem) {
            costOfGoods += stockItem.averageCostPerUnit * ing.quantity;
          }
        }
      }

      const menuItem = new MenuItem({
        name,
        price,
        category,
        imageUrl: imageUrl || '',
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        ingredients: ingredients || [],
        costOfGoods,
      });

      await menuItem.save();
      res.status(201).json(menuItem);
    } catch (error) {
      next(error);
    }
  }
);

// Update menu item (admin/manager only)
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'manager'),
  async (req, res, next) => {
    try {
      const { name, price, category, imageUrl, isAvailable, ingredients } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (price !== undefined) updateData.price = price;
      if (category) updateData.category = category;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
      if (ingredients !== undefined) updateData.ingredients = ingredients;

      // Recalculate cost of goods if ingredients are updated
      if (ingredients) {
        let costOfGoods = 0;
        for (const ing of ingredients) {
          const stockItem = await StockItem.findById(ing.stockItemId);
          if (stockItem) {
            costOfGoods += stockItem.averageCostPerUnit * ing.quantity;
          }
        }
        updateData.costOfGoods = costOfGoods;
      }

      const menuItem = await MenuItem.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }

      res.json(menuItem);
    } catch (error) {
      next(error);
    }
  }
);

// Delete menu item (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
