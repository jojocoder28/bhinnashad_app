const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'waiter', 'user'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'pending',
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Remove password from JSON response
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema, 'users');
