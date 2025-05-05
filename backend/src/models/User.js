const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);