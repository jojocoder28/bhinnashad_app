const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
    },
    orderIds: [{
      type: String,
      required: true,
    }],
    waiterId: {
      type: String,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
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

module.exports = mongoose.model('Bill', billSchema, 'bills');
