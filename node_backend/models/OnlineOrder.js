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

const onlineOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['payment_pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'payment_pending',
    },
    timestamp: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('OnlineOrder', onlineOrderSchema, 'online_orders');
