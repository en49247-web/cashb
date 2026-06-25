const User = require('../models/User');
const Settings = require('../models/Settings');
const { broadcastRateUpdate, sendToUser } = require('../websocket');
const { sendTelegramNotification } = require('../services/telegramService');

// @desc    Save USDT exchange rate
// @route   PUT /api/admin/rates/usdt
// @access  Private/Admin
exports.saveUsdtRate = async (req, res) => {
  try {
    const { rate } = req.body;
    if (!rate || isNaN(rate) || Number(rate) <= 0) {
      return res.status(400).json({ message: 'Invalid USDT rate value' });
    }

    const setting = await Settings.findOneAndUpdate(
      { key: 'usdt_rate' },
      { key: 'usdt_rate', value: Number(rate) },
      { upsert: true, new: true }
    );

    // Broadcast to all connected user panels instantly
    broadcastRateUpdate(setting.value);

    res.json({
      key: setting.key,
      value: setting.value,
      message: `USDT rate updated to ₹${setting.value}`
    });
  } catch (error) {
    console.error('Error saving USDT rate:', error);
    res.status(500).json({ message: 'Server error saving USDT rate' });
  }
};

// @desc    Get USDT exchange rate (public)
// @route   GET /api/admin/rates/usdt
// @access  Public
exports.getUsdtRate = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'usdt_rate' });
    res.json({ rate: setting ? setting.value : 85 });
  } catch (error) {
    console.error('Error fetching USDT rate:', error);
    res.status(500).json({ message: 'Server error fetching USDT rate' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    // Auto-generate cxId for legacy users that don't have one yet
    // Use direct updateOne to avoid triggering full validation on old incomplete records
    for (let user of users) {
      if (!user.cxId) {
        let generatedId;
        let attempts = 0;
        while (attempts < 100) {
          const randomNum = Math.floor(10000000 + Math.random() * 90000000);
          generatedId = `cx${randomNum}`;
          const existing = await User.findOne({ cxId: generatedId });
          if (!existing) break;
          attempts++;
        }
        if (generatedId) {
          await User.updateOne({ _id: user._id }, { $set: { cxId: generatedId } });
          user.cxId = generatedId; // reflect in returned array
        }
      }
    }

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching user directory' });
  }
};


// @desc    Update user status (Block / Unblock)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Active', 'Blocked'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Do not allow blocking oneself
    if (req.user && req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({ message: 'You cannot block your own administrative account' });
    }

    // Protect administrative accounts from modification
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Administrative accounts cannot be blocked or unblocked' });
    }

    user.status = status;
    await user.save();

    // Broadcast status change via WebSocket
    sendToUser(user._id.toString(), 'STATUS_UPDATE', { status: user.status });

    res.json({
      _id: user._id,
      name: user.name,
      status: user.status,
      message: `User account is now ${status}`
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error updating user status' });
  }
};

// @desc    Update user KYC verification status
// @route   PUT /api/admin/users/:id/kyc
// @access  Private/Admin
exports.updateUserKyc = async (req, res) => {
  try {
    const { kycStatus } = req.body;

    if (!['Verified', 'Pending', 'Unverified', 'Rejected'].includes(kycStatus)) {
      return res.status(400).json({ message: 'Invalid KYC status value' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Protect administrative accounts from KYC modifications
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Administrative accounts KYC cannot be modified' });
    }

    const prevKycStatus = user.kycStatus;
    user.kycStatus = kycStatus;
    await user.save();

    // Send Telegram Notification
    if (kycStatus === 'Verified') {
      sendTelegramNotification(`✅ <b>KYC Verification Approved</b>\n\n<b>User:</b> ${user.name} (${user.email})\n<b>CX ID:</b> <code>${user.cxId || 'N/A'}</code>`);
    } else if (kycStatus === 'Rejected') {
      sendTelegramNotification(`❌ <b>KYC Verification Rejected</b>\n\n<b>User:</b> ${user.name} (${user.email})\n<b>CX ID:</b> <code>${user.cxId || 'N/A'}</code>`);
    }

    // Trigger referral & self KYC rewards checking logic if verified
    if (kycStatus === 'Verified') {
      await checkAndCreditKycRewards(user._id);
    }

    // Broadcast KYC status change via WebSocket
    sendToUser(user._id.toString(), 'KYC_UPDATE', { kycStatus: user.kycStatus });

    res.json({
      _id: user._id,
      name: user.name,
      kycStatus: user.kycStatus,
      message: `User KYC status updated to ${kycStatus}`
    });
  } catch (error) {
    console.error('Error updating KYC status:', error);
    res.status(500).json({ message: 'Server error updating KYC status' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Do not allow deleting oneself
    if (req.user && req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own administrative account' });
    }

    // Protect administrative accounts from deletion
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Administrative accounts cannot be deleted' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      _id: user._id,
      message: `User account for ${user.name} has been deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error deleting user account' });
  }
};

// @desc    Toggle user bank verification status
// @route   PUT /api/admin/users/:userId/banks/:bankId/verify
// @access  Private/Admin
exports.toggleBankVerify = async (req, res) => {
  try {
    const { userId, bankId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bankIndex = user.bankAccounts.findIndex(b => {
      const obj = b.toObject ? b.toObject() : b;
      return String(obj.id) === String(bankId) || String(b._id) === String(bankId);
    });
    if (bankIndex === -1) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    user.bankAccounts[bankIndex].verified = !user.bankAccounts[bankIndex].verified;
    user.markModified('bankAccounts');
    await user.save();

    res.json({ message: 'Bank account verification status updated successfully', bankAccounts: user.bankAccounts });
  } catch (error) {
    console.error('Error toggling bank verification:', error);
    res.status(500).json({ message: 'Server error toggling bank verification status' });
  }
};

// @desc    Get all exchange sell orders in system
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const Order = require('../models/Order');
    // Ensure User model is loaded so populate works
    require('../models/User');
    const orders = await Order.find({}).populate('user', 'countryCode email cxId').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const User = require('../models/User');
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Completed', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const prevStatus = order.status;

    // 1. Transitioning to Rejected: Refund User
    if (prevStatus !== 'Rejected' && status === 'Rejected') {
      const baseCoin = order.coin.split(' ')[0].toUpperCase();
      const user = await User.findById(order.user);
      if (user) {
        const currentBal = user.balances?.[baseCoin] ?? 0;
        user.balances[baseCoin] = Number((currentBal + order.amount).toFixed(8));
        await user.save();
      }
    }

    // 2. Transitioning from Rejected to Non-Rejected: Re-deduct User Balance
    if (prevStatus === 'Rejected' && status !== 'Rejected') {
      const baseCoin = order.coin.split(' ')[0].toUpperCase();
      const user = await User.findById(order.user);
      if (user) {
        const currentBal = user.balances?.[baseCoin] ?? 0;
        if (order.amount > currentBal) {
          return res.status(400).json({
            message: `Cannot change status. User has insufficient available ${baseCoin} balance (${currentBal} ${baseCoin}) to re-lock this order.`
          });
        }
        user.balances[baseCoin] = Number((currentBal - order.amount).toFixed(8));
        await user.save();
      }
    }

    if (status === 'Completed') {
      await creditReferralCommission(order.user, order.coin, order.amount);
    }

    order.status = status;
    await order.save();

    // Send Telegram Notification
    const orderUser = await User.findById(order.user);
    if (status === 'Completed') {
      sendTelegramNotification(`✅ <b>Exchange Order Completed / Done</b>\n\n<b>User:</b> ${orderUser ? orderUser.name : 'Unknown'} (${orderUser ? orderUser.email : 'Unknown'})\n<b>CX ID:</b> <code>${orderUser ? orderUser.cxId : 'N/A'}</code>\n<b>Exchanged:</b> ${order.amount} ${order.coin.toUpperCase()}\n<b>Payout Amount:</b> ${order.inr} (Local Currency)\n<b>Method:</b> ${order.payoutOption || 'bank'}`);
    } else if (status === 'Rejected') {
      sendTelegramNotification(`❌ <b>Exchange Order Rejected</b>\n\n<b>User:</b> ${orderUser ? orderUser.name : 'Unknown'} (${orderUser ? orderUser.email : 'Unknown'})\n<b>CX ID:</b> <code>${orderUser ? orderUser.cxId : 'N/A'}</code>\n<b>Amount:</b> ${order.amount} ${order.coin.toUpperCase()}`);
    }

    res.json({ message: `Order status updated to ${status}`, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
};

// Keep track of rotation indexes in memory
const rotationIndexes = {
  USDT_TRC20: 0,
  USDT_BEP20: 0,
  BTC: 0,
  ETH: 0,
  USDC: 0,
  TRX: 0
};

// @desc    Save deposit wallet addresses (Legacy, calls saveWalletsManage)
// @route   PUT /api/admin/wallets
// @access  Private/Admin
exports.saveWallets = async (req, res) => {
  return exports.saveWalletsManage(req, res);
};

// @desc    Get deposit wallet addresses (public, rotated)
// @route   GET /api/admin/wallets
// @access  Public
// @desc    Get rotated active wallet addresses (public endpoint)
// @route   GET /api/admin/wallets
// @access  Public
exports.getWallets = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'deposit_wallets' });
    const defaults = {
      USDT_TRC20: [],
      USDT_BEP20: [],
      BTC: [],
      ETH: [],
      USDC: [],
      TRX: []
    };

    const walletsConfig = setting ? setting.value : defaults;
    const rotatedWallets = {};

    const keys = ['USDT_TRC20', 'USDT_BEP20', 'BTC', 'ETH', 'USDC', 'TRX'];
    keys.forEach(key => {
      const val = walletsConfig[key];
      if (Array.isArray(val) && val.length > 0) {
        const index = rotationIndexes[key] || 0;
        rotatedWallets[key] = val[index % val.length];
        rotationIndexes[key] = (index + 1) % val.length;
      } else if (typeof val === 'string' && val.trim() !== '') {
        rotatedWallets[key] = val.trim();
      } else {
        rotatedWallets[key] = '';
      }
    });

    res.json({ wallets: rotatedWallets });
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ message: 'Server error fetching wallet addresses' });
  }
};

// @desc    Get all deposit wallet address lists (admin only)
// @route   GET /api/admin/wallets/manage
// @access  Private/Admin
exports.getWalletsManage = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'deposit_wallets' });
    const defaults = {
      USDT_TRC20: [],
      USDT_BEP20: [],
      BTC: [],
      ETH: [],
      USDC: [],
      TRX: []
    };

    let wallets = defaults;
    if (setting && setting.value) {
      const keys = ['USDT_TRC20', 'USDT_BEP20', 'BTC', 'ETH', 'USDC', 'TRX'];
      wallets = {};
      keys.forEach(key => {
        const val = setting.value[key];
        if (Array.isArray(val)) {
          wallets[key] = val;
        } else if (typeof val === 'string') {
          wallets[key] = val ? [val] : [];
        } else {
          wallets[key] = [];
        }
      });
    }

    res.json({ wallets });
  } catch (error) {
    console.error('Error fetching managed wallets:', error);
    res.status(500).json({ message: 'Server error fetching managed wallets' });
  }
};

// @desc    Save deposit wallet address lists (admin only)
// @route   PUT /api/admin/wallets/manage
// @access  Private/Admin
exports.saveWalletsManage = async (req, res) => {
  try {
    const { wallets } = req.body;
    if (!wallets || typeof wallets !== 'object') {
      return res.status(400).json({ message: 'Wallets lists object is required' });
    }

    const cleanWallets = {};
    const keys = ['USDT_TRC20', 'USDT_BEP20', 'BTC', 'ETH', 'USDC', 'TRX'];

    for (const key of keys) {
      const val = wallets[key];
      if (Array.isArray(val)) {
        cleanWallets[key] = val.map(addr => addr.trim()).filter(Boolean);
      } else {
        cleanWallets[key] = [];
      }
    }

    const setting = await Settings.findOneAndUpdate(
      { key: 'deposit_wallets' },
      { key: 'deposit_wallets', value: cleanWallets },
      { upsert: true, new: true }
    );
    res.json({ message: 'Deposit wallets configured successfully', wallets: setting.value });
  } catch (error) {
    console.error('Error saving managed wallets:', error);
    res.status(500).json({ message: 'Server error saving managed wallets' });
  }
};

// @desc    Get all user deposit proofs in system
// @route   GET /api/admin/deposits
// @access  Private/Admin
exports.getAllDeposits = async (req, res) => {
  try {
    const Deposit = require('../models/Deposit');
    const deposits = await Deposit.find({}).populate('user', 'email cxId').sort({ createdAt: -1 });
    res.json(deposits);
  } catch (error) {
    console.error('Error fetching admin deposits:', error);
    res.status(500).json({ message: 'Server error fetching deposit requests list' });
  }
};

// @desc    Update deposit status (Approve / Reject)
// @route   PUT /api/admin/deposits/:id/status
// @access  Private/Admin
exports.updateDepositStatus = async (req, res) => {
  try {
    const Deposit = require('../models/Deposit');
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Completed', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const deposit = await Deposit.findById(id);
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit request not found' });
    }

    if (deposit.status !== 'Pending') {
      return res.status(400).json({ message: 'This deposit has already been processed' });
    }

    if (status === 'Completed') {
      const user = await User.findById(deposit.user);
      if (!user) {
        return res.status(404).json({ message: 'User associated with deposit not found' });
      }

      // Dynamic balance increment
      let coin = deposit.coin.toUpperCase().trim();
      if (coin.startsWith('USDT')) {
        coin = 'USDT';
      }
      if (!user.balances) {
        user.balances = { BTC: 0, ETH: 0, USDT: 0, USDC: 0, TRX: 0 };
      }

      const currentBalance = user.balances[coin] || 0;
      user.balances[coin] = Number((currentBalance + deposit.amount).toFixed(8));

      user.markModified('balances');
      await user.save();

      // Credit referral commission
      await creditReferralCommission(deposit.user, deposit.coin, deposit.amount);
    }

    deposit.status = status;
    await deposit.save();

    // Send Telegram Notification
    const depositUser = await User.findById(deposit.user);
    if (status === 'Completed') {
      sendTelegramNotification(`✅ <b>Deposit Request Approved / Done</b>\n\n<b>User:</b> ${depositUser ? depositUser.name : 'Unknown'} (${depositUser ? depositUser.email : 'Unknown'})\n<b>CX ID:</b> <code>${depositUser ? depositUser.cxId : 'N/A'}</code>\n<b>Amount:</b> ${deposit.amount} ${deposit.coin.toUpperCase()}\n<b>Tx ID:</b> <code>${deposit.txId}</code>`);
    } else if (status === 'Rejected') {
      sendTelegramNotification(`❌ <b>Deposit Request Rejected</b>\n\n<b>User:</b> ${depositUser ? depositUser.name : 'Unknown'} (${depositUser ? depositUser.email : 'Unknown'})\n<b>CX ID:</b> <code>${depositUser ? depositUser.cxId : 'N/A'}</code>\n<b>Amount:</b> ${deposit.amount} ${deposit.coin.toUpperCase()}\n<b>Tx ID:</b> <code>${deposit.txId}</code>`);
    }

    if (status === 'Completed') {
      await checkAndCreditKycRewards(deposit.user);
    }

    res.json({ message: `Deposit request has been ${status.toLowerCase()}`, deposit });
  } catch (error) {
    console.error('Error updating deposit status:', error);
    res.status(500).json({ message: 'Server error updating deposit status' });
  }
};

const COUNTRY_DEFAULTS = {
  '+91': { USDT: 85, USDC: 88, BTC: 8540000, ETH: 210000, TRX: 10 },
  '+1': { USDT: 1.00, USDC: 1.00, BTC: 95000, ETH: 3500, TRX: 0.12 },
  '+44': { USDT: 0.79, USDC: 0.79, BTC: 75000, ETH: 2750, TRX: 0.09 },
  '+92': { USDT: 278, USDC: 278, BTC: 26000000, ETH: 970000, TRX: 33 },
  '+971': { USDT: 3.67, USDC: 3.67, BTC: 349000, ETH: 12850, TRX: 0.44 },
  '+61': { USDT: 1.51, USDC: 1.51, BTC: 143500, ETH: 5280, TRX: 0.18 },
  '+49': { USDT: 0.93, USDC: 0.93, BTC: 88500, ETH: 3250, TRX: 0.11 },
  '+65': { USDT: 1.35, USDC: 1.35, BTC: 128000, ETH: 4720, TRX: 0.16 },
  '+966': { USDT: 3.75, USDC: 3.75, BTC: 356000, ETH: 13100, TRX: 0.45 },
  '+880': { USDT: 117, USDC: 117, BTC: 11000000, ETH: 410000, TRX: 14 },
  '+977': { USDT: 133, USDC: 133, BTC: 12600000, ETH: 465000, TRX: 16 },
  '+94': { USDT: 302, USDC: 302, BTC: 28600000, ETH: 1050000, TRX: 36 }
};

// @desc    Save all exchange rates
// @route   PUT /api/admin/rates
// @access  Private/Admin
exports.saveAllRates = async (req, res) => {
  try {
    const { rates, countryCode } = req.body;
    if (!rates || typeof rates !== 'object') {
      return res.status(400).json({ message: 'Rates object is required' });
    }

    const targetCode = countryCode || '+91';
    const setting = await Settings.findOne({ key: 'exchange_rates' });
    let ratesData = setting ? setting.value : {};

    // Handle legacy migration
    if (ratesData.USDT && !ratesData['+91']) {
      ratesData = {
        '+91': {
          USDT: ratesData.USDT || 85,
          BTC: ratesData.BTC || 8540000,
          ETH: ratesData.ETH || 210000,
          USDC: ratesData.USDC || 88,
          TRX: ratesData.TRX || 10
        }
      };
    }

    const cleanRates = {
      USDT: Number(rates.USDT) || COUNTRY_DEFAULTS[targetCode]?.USDT || 85,
      BTC: Number(rates.BTC) || COUNTRY_DEFAULTS[targetCode]?.BTC || 8540000,
      ETH: Number(rates.ETH) || COUNTRY_DEFAULTS[targetCode]?.ETH || 210000,
      USDC: Number(rates.USDC) || COUNTRY_DEFAULTS[targetCode]?.USDC || 88,
      TRX: Number(rates.TRX) || COUNTRY_DEFAULTS[targetCode]?.TRX || 10
    };

    const updatedRatesData = {
      ...COUNTRY_DEFAULTS,
      ...ratesData,
      [targetCode]: cleanRates
    };

    const updatedSetting = await Settings.findOneAndUpdate(
      { key: 'exchange_rates' },
      { key: 'exchange_rates', value: updatedRatesData },
      { upsert: true, new: true }
    );

    // Fetch and scale live Binance rates instantly using the new USDT rate
    try {
      const { updateGlobalRates } = require('../services/binanceService');
      await updateGlobalRates();
    } catch (binanceErr) {
      console.warn('[Admin Controller] Instant Binance sync failed, using manual values:', binanceErr.message);
      // Fallback: broadcast manual cleanRates
      const { broadcastAllRatesUpdate } = require('../websocket');
      broadcastAllRatesUpdate(cleanRates);
    }

    res.json({
      message: `Exchange rates configured successfully for ${targetCode}`,
      rates: cleanRates,
      allRates: updatedSetting.value
    });
  } catch (error) {
    console.error('Error saving rates:', error);
    res.status(500).json({ message: 'Server error saving exchange rates' });
  }
};

// @desc    Get all exchange rates
// @route   GET /api/admin/rates
// @access  Public
exports.getAllRates = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'exchange_rates' });
    let ratesData = setting ? setting.value : {};

    // Handle legacy migration
    if (ratesData.USDT && !ratesData['+91']) {
      ratesData = {
        '+91': {
          USDT: ratesData.USDT || 85,
          BTC: ratesData.BTC || 8540000,
          ETH: ratesData.ETH || 210000,
          USDC: ratesData.USDC || 88,
          TRX: ratesData.TRX || 10
        }
      };
    }

    // Fill missing countries with defaults
    const allRates = { ...COUNTRY_DEFAULTS, ...ratesData };
    const requestedCode = req.query.countryCode || '+91';
    const activeRates = allRates[requestedCode] || allRates['+91'] || COUNTRY_DEFAULTS['+91'];

    res.json({
      rates: activeRates,
      allRates: allRates
    });
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ message: 'Server error fetching exchange rates' });
  }
};

// @desc    Get all user withdrawals in system
// @route   GET /api/admin/withdrawals
// @access  Private/Admin
exports.getAllWithdrawals = async (req, res) => {
  try {
    const Withdrawal = require('../models/Withdrawal');
    const withdrawals = await Withdrawal.find({}).populate('user', 'email cxId').sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    console.error('Error fetching admin withdrawals:', error);
    res.status(500).json({ message: 'Server error fetching withdrawal requests list' });
  }
};

// @desc    Update withdrawal status (Approve / Reject)
// @route   PUT /api/admin/withdrawals/:id/status
// @access  Private/Admin
exports.updateWithdrawalStatus = async (req, res) => {
  try {
    const Withdrawal = require('../models/Withdrawal');
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Completed', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'Pending') {
      return res.status(400).json({ message: 'This withdrawal has already been processed' });
    }

    if (status === 'Rejected') {
      // Refund user balance
      const user = await User.findById(withdrawal.user);
      if (user) {
        if (!user.balances) {
          user.balances = { BTC: 0, ETH: 0, USDT: 0, USDC: 0, TRX: 0 };
        }
        const coin = withdrawal.coin.toUpperCase().trim();
        const currentBalance = user.balances[coin] || 0;
        user.balances[coin] = Number((currentBalance + withdrawal.amount).toFixed(8));
        user.markModified('balances');
        await user.save();
      }
    }

    if (status === 'Completed') {
      await creditReferralCommission(withdrawal.user, withdrawal.coin, withdrawal.amount);
    }

    withdrawal.status = status;
    await withdrawal.save();

    res.json({ message: `Withdrawal request has been ${status.toLowerCase()}`, withdrawal });
  } catch (error) {
    console.error('Error updating withdrawal status:', error);
    res.status(500).json({ message: 'Server error updating withdrawal status' });
  }
};

// @desc    Get referral commission configurations
// @route   GET /api/admin/referral-config
// @access  Private/Admin
exports.getReferralConfig = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'referral_config' });
    const defaults = {
      commissionPercentage: 0.1,
      kycReward: 10.0,
      userKycReward: 5.0,
      minKycRewardDeposit: 100.0,
      minTransferAmount: 50
    };
    res.json({ config: setting ? setting.value : defaults });
  } catch (error) {
    console.error('Error fetching referral config:', error);
    res.status(500).json({ message: 'Server error fetching referral configurations' });
  }
};

// @desc    Save referral commission configurations
// @route   PUT /api/admin/referral-config
// @access  Private/Admin
exports.saveReferralConfig = async (req, res) => {
  try {
    const { commissionPercentage, kycReward, userKycReward, minKycRewardDeposit, minTransferAmount } = req.body;
    if (commissionPercentage === undefined || kycReward === undefined || userKycReward === undefined || minKycRewardDeposit === undefined || minTransferAmount === undefined) {
      return res.status(400).json({ message: 'Commission percentage, KYC reward, User KYC reward, Minimum KYC reward deposit, and Minimum transfer amount are required' });
    }

    const cleanConfig = {
      commissionPercentage: Number(commissionPercentage) || 0.1,
      kycReward: Number(kycReward) || 10.0,
      userKycReward: Number(userKycReward) || 5.0,
      minKycRewardDeposit: Number(minKycRewardDeposit) ?? 100.0,
      minTransferAmount: Number(minTransferAmount) || 50
    };

    const setting = await Settings.findOneAndUpdate(
      { key: 'referral_config' },
      { key: 'referral_config', value: cleanConfig },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Referral configurations updated successfully',
      config: setting.value
    });
  } catch (error) {
    console.error('Error saving referral config:', error);
    res.status(500).json({ message: 'Server error saving referral configurations' });
  }
};

// Helper function to credit referral commission on completed transactions
async function creditReferralCommission(userId, coin, amount) {
  try {
    const User = require('../models/User');
    const Settings = require('../models/Settings');

    // Find the user to check if they have a referrer
    const user = await User.findById(userId);
    if (!user || !user.referredBy) return;

    // Check if the referred user's KYC status is Verified
    if (user.kycStatus !== 'Verified') {
      console.log(`Referral commission skipped: User ${user.email} is not KYC Verified`);
      return;
    }

    // Fetch the active referral configuration
    const setting = await Settings.findOne({ key: 'referral_config' });
    const config = setting ? setting.value : { commissionPercentage: 0.1, kycReward: 10.0 };
    const commissionPct = Number(config.commissionPercentage) || 0.1;

    // Calculate commission (commissionPct is entered as percentage, e.g. 0.1%)
    const commissionAmount = amount * (commissionPct / 100);

    // Convert commission to USDT
    let commissionInUsdt = commissionAmount;
    const cleanCoin = coin.toUpperCase().trim();
    if (cleanCoin !== 'USDT') {
      const settingRates = await Settings.findOne({ key: 'exchange_rates' });
      const rates = settingRates ? settingRates.value : { USDT: 85, BTC: 8540000, ETH: 210000, USDC: 88, TRX: 10 };

      const coinRate = rates[cleanCoin] || rates[cleanCoin.split(' ')[0]] || 0;
      const usdtRate = rates.USDT || 85;

      if (coinRate > 0 && usdtRate > 0) {
        commissionInUsdt = commissionAmount * (coinRate / usdtRate);
      }
    }

    // Round to 8 decimal places
    commissionInUsdt = Number(commissionInUsdt.toFixed(8));

    if (commissionInUsdt <= 0) return;

    // Credit referrer's referralWallet and referralEarnings
    const referrer = await User.findById(user.referredBy);
    if (referrer) {
      const oldWallet = referrer.referralWallet || 0;
      const oldEarnings = referrer.referralEarnings || 0;

      referrer.referralWallet = Number((oldWallet + commissionInUsdt).toFixed(8));
      referrer.referralEarnings = Number((oldEarnings + commissionInUsdt).toFixed(8));

      await referrer.save();
      console.log(`Credited referral commission of ${commissionInUsdt} USDT to ${referrer.email} for transaction of ${amount} ${coin} by ${user.email}`);
    }
  } catch (error) {
    console.error('Error crediting referral commission:', error);
  }
}

// @desc    Get complete user report history
// @route   GET /api/admin/users/:id/report
// @access  Private/Admin
exports.getUserReport = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const Order = require('../models/Order');
    const Deposit = require('../models/Deposit');
    const Withdrawal = require('../models/Withdrawal');

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    const deposits = await Deposit.find({ user: userId }).sort({ createdAt: -1 });
    const withdrawals = await Withdrawal.find({ user: userId }).sort({ createdAt: -1 });
    const referrals = await User.find({ referredBy: userId }).select('name email kycStatus cxId createdAt').sort({ createdAt: -1 });

    res.json({
      user,
      orders,
      deposits,
      withdrawals,
      referrals
    });
  } catch (error) {
    console.error('Error fetching user report:', error);
    res.status(500).json({ message: 'Server error generating user report' });
  }
};

// @desc    Get current exchange limit configurations
// @route   GET /api/admin/exchange-limits
// @access  Private/Admin
exports.getExchangeLimits = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'exchange_limits' });
    const defaults = {
      unverifiedLimit: 120,
      verifiedDailyLimit: 1200,
      minExchangeUsdt: 100
    };
    res.json({ config: setting ? setting.value : defaults });
  } catch (error) {
    console.error('Error fetching exchange limits:', error);
    res.status(500).json({ message: 'Server error fetching exchange limits' });
  }
};

// @desc    Save exchange limit configurations
// @route   PUT /api/admin/exchange-limits
// @access  Private/Admin
exports.saveExchangeLimits = async (req, res) => {
  try {
    const { unverifiedLimit, verifiedDailyLimit, minExchangeUsdt } = req.body;
    if (unverifiedLimit === undefined || verifiedDailyLimit === undefined) {
      return res.status(400).json({ message: 'Unverified limit and Verified daily limit are required' });
    }

    const cleanConfig = {
      unverifiedLimit: Number(unverifiedLimit) || 120,
      verifiedDailyLimit: Number(verifiedDailyLimit) || 1200,
      minExchangeUsdt: minExchangeUsdt !== undefined ? Number(minExchangeUsdt) : 100
    };

    const setting = await Settings.findOneAndUpdate(
      { key: 'exchange_limits' },
      { key: 'exchange_limits', value: cleanConfig },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Exchange limit configurations updated successfully',
      config: setting.value
    });
  } catch (error) {
    console.error('Error saving exchange limits:', error);
    res.status(500).json({ message: 'Server error saving exchange limits' });
  }
};

// @desc    Get swap fee configuration
// @route   GET /api/admin/swap-config
// @access  Public (users need the fee to preview swaps)
exports.getSwapConfig = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'swap_config' });
    const defaults = { swapFeePercent: 0.5 };
    res.json({ config: setting ? setting.value : defaults });
  } catch (error) {
    console.error('Error fetching swap config:', error);
    res.status(500).json({ message: 'Server error fetching swap configuration' });
  }
};

// @desc    Save swap fee configuration
// @route   PUT /api/admin/swap-config
// @access  Private/Admin
exports.saveSwapConfig = async (req, res) => {
  try {
    const { swapFeePercent } = req.body;
    if (swapFeePercent === undefined) {
      return res.status(400).json({ message: 'swapFeePercent is required' });
    }

    const fee = Number(swapFeePercent);
    if (isNaN(fee) || fee < 0 || fee > 100) {
      return res.status(400).json({ message: 'swapFeePercent must be a number between 0 and 100' });
    }

    const cleanConfig = { swapFeePercent: fee };

    const setting = await Settings.findOneAndUpdate(
      { key: 'swap_config' },
      { key: 'swap_config', value: cleanConfig },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Swap fee configuration updated successfully',
      config: setting.value
    });
  } catch (error) {
    console.error('Error saving swap config:', error);
    res.status(500).json({ message: 'Server error saving swap configuration' });
  }
};

// @desc    Get all referred users list
// @route   GET /api/admin/referrals
// @access  Private/Admin
exports.getAllReferralRelations = async (req, res) => {
  try {
    const referredUsers = await User.find({ referredBy: { $exists: true, $ne: null } })
      .populate('referredBy', 'name email cxId')
      .select('name email kycStatus cxId createdAt referralWallet referralEarnings kycRewardClaimed referredBy')
      .sort({ createdAt: -1 });

    res.json({ referrals: referredUsers });
  } catch (error) {
    console.error('Error fetching referral directory:', error);
    res.status(500).json({ message: 'Server error fetching referral directory' });
  }
};

// @desc    Manually credit referral KYC reward
// @route   POST /api/admin/referrals/:id/credit
// @access  Private/Admin
exports.manualCreditReferralReward = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Referred user not found' });
    }

    if (!user.referredBy) {
      return res.status(400).json({ message: 'User does not have a referrer' });
    }

    if (user.kycRewardClaimed) {
      return res.status(400).json({ message: 'KYC reward already claimed/credited' });
    }

    // Load reward config
    const setting = await Settings.findOne({ key: 'referral_config' });
    const config = setting ? setting.value : { commissionPercentage: 0.1, kycReward: 10.0 };
    const kycReward = Number(config.kycReward) || 10.0;

    const referrer = await User.findById(user.referredBy);
    if (referrer) {
      referrer.referralWallet = Number(((referrer.referralWallet || 0) + kycReward).toFixed(8));
      referrer.referralEarnings = Number(((referrer.referralEarnings || 0) + kycReward).toFixed(8));
      await referrer.save();

      user.kycRewardClaimed = true;
      await user.save();

      return res.json({ message: `Successfully credited ${kycReward} USDT to ${referrer.email}` });
    } else {
      return res.status(404).json({ message: 'Referrer user not found' });
    }
  } catch (error) {
    console.error('Error manually crediting reward:', error);
    res.status(500).json({ message: 'Server error manually crediting reward' });
  }
};

// Helper function to check and credit KYC reward when criteria is met
async function checkAndCreditKycRewards(userId) {
  try {
    const User = require('../models/User');
    const Deposit = require('../models/Deposit');
    const Settings = require('../models/Settings');

    const user = await User.findById(userId);
    if (!user) return;

    // Must be KYC Verified
    if (user.kycStatus !== 'Verified') return;

    // If both rewards are already claimed/credited, do nothing
    if (user.kycRewardClaimed && user.userKycRewardClaimed) return;

    // Load configuration
    const setting = await Settings.findOne({ key: 'referral_config' });
    const defaults = {
      commissionPercentage: 0.1,
      kycReward: 10.0,
      userKycReward: 5.0,
      minKycRewardDeposit: 100.0,
      minTransferAmount: 50
    };
    const config = setting ? setting.value : defaults;
    const minKycRewardDeposit = Number(config.minKycRewardDeposit) ?? 100.0;
    const kycReward = Number(config.kycReward) || 10.0;
    const userKycReward = Number(config.userKycReward) ?? 5.0;

    // Calculate user's total completed deposits in USDT
    const completedDeposits = await Deposit.find({ user: userId, status: 'Completed' });
    
    // We convert everything to USDT based on exchange rates
    let totalUsdtDeposits = 0;
    const settingRates = await Settings.findOne({ key: 'exchange_rates' });
    const rates = settingRates ? settingRates.value : { USDT: 85, BTC: 8540000, ETH: 210000, USDC: 88, TRX: 10 };
    const usdtRate = rates.USDT || 85;

    for (const dep of completedDeposits) {
      const cleanCoin = dep.coin.toUpperCase().trim();
      if (cleanCoin === 'USDT') {
        totalUsdtDeposits += dep.amount;
      } else {
        const coinRate = rates[cleanCoin] || rates[cleanCoin.split(' ')[0]] || 0;
        if (coinRate > 0 && usdtRate > 0) {
          totalUsdtDeposits += dep.amount * (coinRate / usdtRate);
        }
      }
    }

    console.log(`User ${user.email} total completed deposits in USDT: ${totalUsdtDeposits}. Threshold: ${minKycRewardDeposit}`);

    if (totalUsdtDeposits >= minKycRewardDeposit) {
      // 1. Credit referrer reward if not claimed
      if (user.referredBy && !user.kycRewardClaimed && kycReward > 0) {
        const referrer = await User.findById(user.referredBy);
        if (referrer) {
          referrer.referralWallet = Number(((referrer.referralWallet || 0) + kycReward).toFixed(8));
          referrer.referralEarnings = Number(((referrer.referralEarnings || 0) + kycReward).toFixed(8));
          await referrer.save();

          user.kycRewardClaimed = true;
          await user.save();
          console.log(`Credited KYC referral reward of ${kycReward} USDT to referrer ${referrer.email} for verified user ${user.email}`);
        }
      }

      // 2. Credit self-KYC reward if not claimed
      if (!user.userKycRewardClaimed && userKycReward > 0) {
        if (!user.balances) {
          user.balances = { BTC: 0, ETH: 0, USDT: 0, USDC: 0, TRX: 0 };
        }
        user.balances.USDT = Number(((user.balances.USDT || 0) + userKycReward).toFixed(8));
        user.userKycRewardClaimed = true;
        await user.save();
        console.log(`Credited self-KYC reward of ${userKycReward} USDT directly to user ${user.email}`);
      }
    }
  } catch (err) {
    console.error('Error checking and crediting KYC rewards:', err);
  }
}

// @desc    Get telegram notification configuration
// @route   GET /api/admin/telegram-config
// @access  Private/Admin
exports.getTelegramConfig = async (req, res) => {
  try {
    let setting = await Settings.findOne({ key: 'telegram_config' });
    if (!setting) {
      setting = {
        value: {
          botToken: '',
          chatIds: [],
          enabled: false
        }
      };
    }
    res.json(setting.value);
  } catch (error) {
    console.error('Error fetching telegram config:', error);
    res.status(500).json({ message: 'Server error fetching Telegram configuration' });
  }
};

// @desc    Save/Update telegram notification configuration
// @route   PUT /api/admin/telegram-config
// @access  Private/Admin
exports.saveTelegramConfig = async (req, res) => {
  try {
    const { botToken, chatIds, enabled } = req.body;
    
    let parsedChatIds = [];
    if (Array.isArray(chatIds)) {
      parsedChatIds = chatIds.map(id => String(id).trim()).filter(Boolean);
    } else if (typeof chatIds === 'string') {
      parsedChatIds = chatIds.split(',').map(id => id.trim()).filter(Boolean);
    }

    const updatedValue = {
      botToken: botToken ? String(botToken).trim() : '',
      chatIds: parsedChatIds,
      enabled: !!enabled
    };

    const setting = await Settings.findOneAndUpdate(
      { key: 'telegram_config' },
      { value: updatedValue },
      { new: true, upsert: true }
    );

    res.json({ message: 'Telegram configuration saved successfully', config: setting.value });
  } catch (error) {
    console.error('Error saving telegram config:', error);
    res.status(500).json({ message: 'Server error saving Telegram configuration' });
  }
};
