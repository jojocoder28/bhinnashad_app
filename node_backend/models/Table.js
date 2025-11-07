const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['available', 'occupied'],
      default: 'available',
    },
    waiterId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('Table', tableSchema, 'tables');
