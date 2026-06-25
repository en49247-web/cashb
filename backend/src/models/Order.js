const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
    required: true,
    default: 'USDT'
  },
  amount: {
    type: Number,
    required: true
  },
  inr: {
    type: Number,
    required: true
  },
  bankDetails: {
    name: { type: String, required: true },
    number: { type: String, required: true },
    ifsc: { type: String, required: true }
  },
  txId: {
    type: String
  },
  screenshot: {
    type: String // Stored as base64 image data URL
  },
  depositAddress: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  payoutOption: {
    type: String,
    enum: ['CDM deposit', 'wire transfer'],
    default: 'wire transfer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
