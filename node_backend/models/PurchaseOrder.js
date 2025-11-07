const mongoose = require('mongoose');

const purchaseOrderItemSchema = new mongoose.Schema({
  stockItemId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  costPerUnit: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const purchaseOrderSchema = new mongoose.Schema(
  {
    supplierId: {
      type: String,
      required: true,
    },
    items: [purchaseOrderItemSchema],
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['ordered', 'received', 'cancelled'],
      default: 'ordered',
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema, 'purchase_orders');
