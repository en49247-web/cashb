const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  coin: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  txId: {
    type: String,
    required: true,
    unique: true
  },
  screenshot: {
    type: String, // Stored as base64 image data URL
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Deposit', depositSchema);
