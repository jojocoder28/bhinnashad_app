const mongoose = require('mongoose');

const stockItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      enum: ['kg', 'g', 'l', 'ml', 'piece'],
      required: true,
    },
    quantityInStock: {
      type: Number,
      required: true,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      required: true,
      min: 0,
    },
    averageCostPerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('StockItem', stockItemSchema, 'stock');
