const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Submit a new withdrawal request
// @route   POST /api/user/withdrawals
// @access  Private
exports.createWithdrawal = async (req, res) => {
  try {
    const { coin, amount, address, twoFactorCode } = req.body;

    if (!coin || !amount || !address || !twoFactorCode) {
      return res.status(400).json({ message: 'All details including coin, amount, destination address, and 6-digit 2FA code are required' });
    }

    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ message: 'Please enter a valid positive withdrawal amount' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify 2FA
    if (!user.twoFactorCode) {
      return res.status(400).json({ message: 'Two-Factor Code (2FA) is not set up for this account.' });
    }

    let is2faMatch = false;
    try {
      if (user.twoFactorCode.startsWith('$2')) {
        is2faMatch = await bcrypt.compare(String(twoFactorCode), user.twoFactorCode);
      } else {
        is2faMatch = (String(twoFactorCode) === user.twoFactorCode);
      }
    } catch (bcryptErr) {
      is2faMatch = (String(twoFactorCode) === user.twoFactorCode);
    }

    if (!is2faMatch) {
      return res.status(400).json({ message: 'Invalid 2FA code. Please enter your correct 6-digit security code.' });
    }

    // Initialize user balances if not present
    if (!user.balances) {
      user.balances = { BTC: 0, ETH: 0, USDT: 0, USDC: 0, TRX: 0 };
    }

    const availableBalance = user.balances[coin] || 0;
    if (availableBalance < amt) {
      return res.status(400).json({ message: `Insufficient available balance in your ${coin} wallet` });
    }

    // Deduct available balance
    user.balances[coin] = Number((availableBalance - amt).toFixed(8));
    user.markModified('balances');
    await user.save();

    const newWithdrawal = new Withdrawal({
      user: user._id,
      userName: user.name,
      coin,
      amount: amt,
      address: address.trim(),
      status: 'Pending'
    });

    await newWithdrawal.save();

    res.status(201).json({
      message: 'Withdrawal request submitted successfully. Admin will process it shortly.',
      withdrawal: newWithdrawal,
      balances: user.balances
    });
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    res.status(500).json({ message: 'Server error submitting withdrawal request' });
  }
};

// @desc    Get user's own withdrawals
// @route   GET /api/user/withdrawals
// @access  Private
exports.getUserWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    console.error('Error fetching user withdrawals:', error);
    res.status(500).json({ message: 'Server error fetching withdrawal history' });
  }
};
