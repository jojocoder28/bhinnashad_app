const mongoose = require('mongoose');

const menuItemIngredientSchema = new mongoose.Schema({
  stockItemId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    ingredients: [menuItemIngredientSchema],
    costOfGoods: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('MenuItem', menuItemSchema, 'menu');
