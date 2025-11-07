const mongoose = require('mongoose');

const waiterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('Waiter', waiterSchema, 'waiters');
