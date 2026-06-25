const Order = require('../models/Order');
const User = require('../models/User');
const { sendTelegramNotification } = require('../services/telegramService');

// @desc    Create a new sell order
// @route   POST /api/user/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { coin, amount, inr, bankDetails, txId, screenshot, depositAddress, payoutOption } = req.body;

    if (!coin || !amount || !inr || !bankDetails) {
      return res.status(400).json({ message: 'Coin, amount, inr, and bankDetails are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Enforce Exchange Limits based on KYC Status (calculated in USDT)
    const Settings = require('../models/Settings');
    const limitSetting = await Settings.findOne({ key: 'exchange_limits' });
    const limits = limitSetting ? limitSetting.value : { unverifiedLimit: 120, verifiedDailyLimit: 1200, minExchangeUsdt: 100 };
    const unverifiedLimit = limits.unverifiedLimit ?? 120;
    const verifiedDailyLimit = limits.verifiedDailyLimit ?? 1200;
    const minExchangeUsdt = limits.minExchangeUsdt ?? 100;

    // Enforce Minimum USDT Exchange Limit
    if (coin.split(' ')[0].toUpperCase() === 'USDT' && amount < minExchangeUsdt) {
      return res.status(400).json({ message: `Minimum exchange amount for USDT is ${minExchangeUsdt} USDT.` });
    }

    const rateSetting = await Settings.findOne({ key: 'exchange_rates' });
    const usdtRate = rateSetting?.value?.USDT || 85;

    const startOf24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const pastOrders = await Order.find({
      user: user._id,
      createdAt: { $gte: startOf24h },
      status: { $ne: 'Rejected' }
    });

    const dailyTotalUsdt = pastOrders.reduce((sum, o) => sum + ((o.inr || 0) / usdtRate), 0);
    const userLimit = user.kycStatus === 'Verified' ? verifiedDailyLimit : unverifiedLimit;
    const userLimitName = user.kycStatus === 'Verified' ? 'KYC Verified Daily Limit' : 'Unverified KYC Daily Limit';
    const newOrderUsdt = Number(inr) / usdtRate;

    if (dailyTotalUsdt + newOrderUsdt > userLimit) {
      const remainingUsdt = Math.max(0, userLimit - dailyTotalUsdt);
      return res.status(400).json({
        message: `Exchange limit exceeded! Your current daily limit is ${userLimit} USDT (${userLimitName}). You have already exchanged ${dailyTotalUsdt.toFixed(2)} USDT in the last 24 hours. Remaining limit: ${remainingUsdt.toFixed(2)} USDT.`
      });
    }

    const baseCoin = coin.split(' ')[0].toUpperCase();
    const userBalance = user.balances?.[baseCoin] ?? 0;
    if (amount > userBalance) {
      return res.status(400).json({ message: `Insufficient ${baseCoin} balance! Your available balance is ${userBalance} ${baseCoin}.` });
    }

    // Deduct balance
    user.balances[baseCoin] = Number((userBalance - amount).toFixed(8));
    await user.save();

    const newOrder = new Order({
      user: user._id,
      userName: user.name,
      coin,
      amount,
      inr,
      bankDetails,
      txId: txId || 'DIRECT_EXCHANGE',
      screenshot: screenshot || 'direct',
      depositAddress: depositAddress || 'N/A',
      status: 'Pending',
      payoutOption: payoutOption || 'wire transfer'
    });

    await newOrder.save();

    // Send Telegram Notification
    sendTelegramNotification(`🔀 <b>New Exchange Order Placed</b>\n\n<b>User:</b> ${user.name} (${user.email})\n<b>CX ID:</b> <code>${user.cxId || 'N/A'}</code>\n<b>Exchanged:</b> ${amount} ${coin.toUpperCase()}\n<b>Receiving:</b> ${inr} (Local Currency)\n<b>Payout Method:</b> ${payoutOption || 'bank'}`);

    res.status(201).json({
      message: 'Exchange sell order submitted successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error submitting order' });
  }
};

// @desc    Get user's own orders
// @route   GET /api/user/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error fetching orders list' });
  }
};
