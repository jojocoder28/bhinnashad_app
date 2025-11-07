const mongoose = require('mongoose');

const stockUsageLogSchema = new mongoose.Schema(
  {
    stockItemId: {
      type: String,
      required: true,
    },
    quantityUsed: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ['kitchen_prep', 'spillage', 'staff_meal', 'other'],
      required: true,
    },
    notes: {
      type: String,
    },
    recordedBy: {
      type: String,
      required: true,
    },
    timestamp: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('StockUsageLog', stockUsageLogSchema, 'stock_usage_logs');
