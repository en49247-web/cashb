const Deposit = require('../models/Deposit');
const User = require('../models/User');
const { sendTelegramNotification } = require('../services/telegramService');

// @desc    Submit a new deposit proof
// @route   POST /api/user/deposits
// @access  Private
exports.createDeposit = async (req, res) => {
  try {
    const { coin, amount, txId, screenshot } = req.body;

    if (!coin || !amount || !txId || !screenshot) {
      return res.status(400).json({ message: 'All details including transaction ID and deposit screenshot are required' });
    }

    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ message: 'Please enter a valid positive deposit amount' });
    }

    // Check if duplicate txId exists
    const duplicate = await Deposit.findOne({ txId: txId.trim() });
    if (duplicate) {
      return res.status(400).json({ message: 'This transaction ID has already been submitted' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newDeposit = new Deposit({
      user: user._id,
      userName: user.name,
      coin,
      amount: amt,
      txId: txId.trim(),
      screenshot,
      status: 'Pending'
    });

    await newDeposit.save();

    // Send Telegram Notification
    sendTelegramNotification(`💰 <b>New Deposit Submitted (Pending Verification)</b>\n\n<b>User:</b> ${user.name} (${user.email})\n<b>CX ID:</b> <code>${user.cxId || 'N/A'}</code>\n<b>Amount:</b> ${amt} ${coin.toUpperCase()}\n<b>Tx ID:</b> <code>${txId.trim()}</code>`);

    res.status(201).json({
      message: 'Deposit proof submitted successfully. Admin will verify and credit your balance.',
      deposit: newDeposit
    });
  } catch (error) {
    console.error('Error creating deposit:', error);
    res.status(500).json({ message: 'Server error submitting deposit proof' });
  }
};

// @desc    Get user's own deposits
// @route   GET /api/user/deposits
// @access  Private
exports.getUserDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(deposits);
  } catch (error) {
    console.error('Error fetching user deposits:', error);
    res.status(500).json({ message: 'Server error fetching deposit history' });
  }
};
