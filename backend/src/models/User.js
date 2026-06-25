const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  countryCode: {
    type: String,
    required: [true, 'Please select a country code']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  kycStatus: {
    type: String,
    enum: ['Verified', 'Pending', 'Unverified', 'Rejected'],
    default: 'Unverified'
  },
  kycDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  balances: {
    BTC: { type: Number, default: 0 },
    ETH: { type: Number, default: 0 },
    USDT: { type: Number, default: 0 },
    USDC: { type: Number, default: 0 },
    TRX: { type: Number, default: 0 }
  },
  bankAccounts: {
    type: [
      {
        id: { type: String, default: () => Date.now().toString() },
        name: { type: String, required: true },
        number: { type: String, required: true },
        ifsc: { type: String, required: true },
        verified: { type: Boolean, default: false }
      }
    ],
    default: []
  },
  status: {
    type: String,
    enum: ['Active', 'Blocked'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  cxId: {
    type: String,
    unique: true
  },
  twoFactorCode: {
    type: String
  },
  referralCode: {
    type: String,
    unique: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralWallet: {
    type: Number,
    default: 0
  },
  referralEarnings: {
    type: Number,
    default: 0
  },
  kycRewardClaimed: {
    type: Boolean,
    default: false
  },
  userKycRewardClaimed: {
    type: Boolean,
    default: false
  }
});

// Pre-save hook to generate unique 10-character custom ID and referral code
userSchema.pre('save', async function (next) {
  if (!this.cxId) {
    let unique = false;
    let attempts = 0;
    while (!unique && attempts < 100) {
      const randomNum = Math.floor(10000000 + Math.random() * 90000000); // 8 digits
      const generatedId = `cx${randomNum}`;
      const existingUser = await this.constructor.findOne({ cxId: generatedId });
      if (!existingUser) {
        this.cxId = generatedId;
        unique = true;
      }
      attempts++;
    }
  }

  if (!this.referralCode) {
    let uniqueRef = false;
    let refAttempts = 0;
    while (!uniqueRef && refAttempts < 100) {
      const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digits
      const generatedCode = `REF-${randomNum}`;
      const existingUser = await this.constructor.findOne({ referralCode: generatedCode });
      if (!existingUser) {
        this.referralCode = generatedCode;
        uniqueRef = true;
      }
      refAttempts++;
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
