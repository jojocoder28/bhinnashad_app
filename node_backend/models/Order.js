const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
    },
    orderType: {
      type: String,
      enum: ['dine-in', 'pickup'],
      required: true,
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'approved', 'prepared', 'served', 'cancelled', 'billed'],
      default: 'pending',
    },
    waiterId: {
      type: String,
      required: true,
    },
    timestamp: {
      type: String,
      required: true,
    },
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('Order', orderSchema, 'orders');
