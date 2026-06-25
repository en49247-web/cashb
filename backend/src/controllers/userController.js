const User = require('../models/User');
const { sendTelegramNotification } = require('../services/telegramService');
const bcrypt = require('bcryptjs');

// @desc    Get current user profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @desc    Submit KYC details
// @route   PUT /api/user/kyc
// @access  Private
exports.submitKyc = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.kycDetails = req.body;
    user.markModified('kycDetails');
    user.kycStatus = 'Pending';
    await user.save();

    // Send Telegram Notification
    sendTelegramNotification(`📋 <b>KYC Details Submitted (Pending Review)</b>\n\n<b>User:</b> ${user.name} (${user.email})\n<b>CX ID:</b> <code>${user.cxId || 'N/A'}</code>\n<b>Country Code:</b> ${user.countryCode || 'N/A'}`);

    res.json({
      _id: user._id,
      kycStatus: user.kycStatus,
      message: 'KYC documents submitted successfully. Status is now Pending.'
    });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    res.status(500).json({ message: 'Server error submitting KYC details' });
  }
};

// @desc    Add a bank account
// @route   POST /api/user/banks
// @access  Private
exports.addBankAccount = async (req, res) => {
  try {
    const { name, number, ifsc } = req.body;
    if (!name || !number || !ifsc) {
      return res.status(400).json({ message: 'Please provide all bank details' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Enforce 1 bank account limit
    if (user.bankAccounts && user.bankAccounts.length >= 1) {
      return res.status(400).json({ message: 'You can only link a maximum of 1 bank account.' });
    }

    const newAccount = {
      id: Date.now().toString(),
      name,
      number,
      ifsc,
      verified: true
    };

    user.bankAccounts = [newAccount];
    user.markModified('bankAccounts');
    await user.save();

    res.status(201).json(user.bankAccounts);
  } catch (error) {
    console.error('Error adding bank account:', error);
    res.status(500).json({ message: 'Server error adding bank account' });
  }
};

// @desc    Update a bank account
// @route   PUT /api/user/banks/:id
// @access  Private
exports.updateBankAccount = async (req, res) => {
  try {
    const { name, number, ifsc } = req.body;
    const { id } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const accountIndex = user.bankAccounts.findIndex(acc => {
      const obj = acc.toObject ? acc.toObject() : acc;
      return String(obj.id) === String(id) || String(acc._id) === String(id);
    });
    if (accountIndex === -1) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    user.bankAccounts[accountIndex].name = name || user.bankAccounts[accountIndex].name;
    user.bankAccounts[accountIndex].number = number || user.bankAccounts[accountIndex].number;
    user.bankAccounts[accountIndex].ifsc = ifsc || user.bankAccounts[accountIndex].ifsc;
    user.bankAccounts[accountIndex].verified = true; // Set verified to true immediately upon edit

    user.markModified('bankAccounts');
    await user.save();

    res.json(user.bankAccounts);
  } catch (error) {
    console.error('Error updating bank account:', error);
    res.status(500).json({ message: 'Server error updating bank account' });
  }
};

// @desc    Verify a bank account (simulation / manual trigger)
// @route   PUT /api/user/banks/:id/verify
// @access  Private
exports.verifyBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const accountIndex = user.bankAccounts.findIndex(acc => {
      const obj = acc.toObject ? acc.toObject() : acc;
      return String(obj.id) === String(id) || String(acc._id) === String(id);
    });
    if (accountIndex === -1) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    user.bankAccounts[accountIndex].verified = true;
    user.markModified('bankAccounts');
    await user.save();

    res.json(user.bankAccounts);
  } catch (error) {
    console.error('Error verifying bank account:', error);
    res.status(500).json({ message: 'Server error verifying bank account' });
  }
};

// @desc    Delete a bank account
// @route   DELETE /api/user/banks/:id
// @access  Private
exports.deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.bankAccounts = user.bankAccounts.filter(acc => {
      const obj = acc.toObject ? acc.toObject() : acc;
      return String(obj.id) !== String(id) && String(acc._id) !== String(id);
    });
    user.markModified('bankAccounts');
    await user.save();

    res.json(user.bankAccounts);
  } catch (error) {
    console.error('Error deleting bank account:', error);
    res.status(500).json({ message: 'Server error deleting bank account' });
  }
};

// @desc    Change user password
// @route   PUT /api/user/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Please enter current and new passwords' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Find user including password
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
};

// @desc    Change user 2FA PIN
// @route   PUT /api/user/change-2fa
// @access  Private
exports.changeTwoFactorCode = async (req, res) => {
  try {
    const { password, new2fa } = req.body;
    if (!password || !new2fa) {
      return res.status(400).json({ message: 'Please enter password and new 6-digit 2FA PIN' });
    }

    if (new2fa.length !== 6 || /\D/.test(new2fa)) {
      return res.status(400).json({ message: 'New 2FA PIN must be exactly 6 digits' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password first for security
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect account password' });
    }

    // Hash and save new 2FA code
    const salt = await bcrypt.genSalt(10);
    user.twoFactorCode = await bcrypt.hash(new2fa, salt);
    await user.save();

    res.json({ message: 'Two-Factor PIN updated successfully' });
  } catch (error) {
    console.error('Error changing 2FA PIN:', error);
    res.status(500).json({ message: 'Server error updating 2FA PIN' });
  }
};

// @desc    Get user's referrals list and statistics
// @route   GET /api/user/referrals
// @access  Private
exports.getUserReferrals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Auto-generate referral code if user doesn't have one (legacy user migration)
    if (!user.referralCode) {
      let uniqueRef = false;
      let refAttempts = 0;
      while (!uniqueRef && refAttempts < 100) {
        const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digits
        const generatedCode = `REF-${randomNum}`;
        const existingUser = await User.findOne({ referralCode: generatedCode });
        if (!existingUser) {
          user.referralCode = generatedCode;
          uniqueRef = true;
        }
        refAttempts++;
      }
      await user.save();
    }

    // Find all users referred by this user
    const referredUsers = await User.find({ referredBy: user._id }).select('name email kycStatus createdAt');

    const Settings = require('../models/Settings');
    const configSetting = await Settings.findOne({ key: 'referral_config' });
    const config = configSetting ? configSetting.value : { commissionPercentage: 0.1, kycReward: 10.0, userKycReward: 5.0, minKycRewardDeposit: 100.0, minTransferAmount: 50 };
    const minTransferAmount = config.minTransferAmount ?? 50;
    const minKycRewardDeposit = config.minKycRewardDeposit ?? 100.0;
    const kycReward = config.kycReward ?? 10.0;
    const userKycReward = config.userKycReward ?? 5.0;
    const commissionPercentage = config.commissionPercentage ?? 0.1;

    res.json({
      referralCode: user.referralCode,
      referralWallet: user.referralWallet || 0,
      referralEarnings: user.referralEarnings || 0,
      minTransferAmount,
      minKycRewardDeposit,
      kycReward,
      userKycReward,
      commissionPercentage,
      referredUsers: referredUsers.map(u => ({
        name: u.name,
        email: u.email ? u.email.replace(/(.{3})(.*)(@.*)/, '$1***$3') : '',
        kycStatus: u.kycStatus,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ message: 'Server error fetching referrals data' });
  }
};

// @desc    Transfer referral wallet balance to main USDT balance
// @route   POST /api/user/referrals/transfer
// @access  Private
exports.transferReferralBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const Settings = require('../models/Settings');
    const configSetting = await Settings.findOne({ key: 'referral_config' });
    const config = configSetting ? configSetting.value : { commissionPercentage: 0.1, kycReward: 10.0, userKycReward: 5.0, minTransferAmount: 50 };
    const minTransferAmount = config.minTransferAmount ?? 50;

    const referralAmt = user.referralWallet || 0;
    if (referralAmt <= 0) {
      return res.status(400).json({ message: 'No referral balance available to transfer' });
    }

    if (referralAmt < minTransferAmount) {
      return res.status(400).json({
        message: `Minimum amount to transfer is ${minTransferAmount} USDT. Current balance: ${referralAmt.toFixed(4)} USDT.`
      });
    }

    // Initialize balances if not present
    if (!user.balances) {
      user.balances = { BTC: 0, ETH: 0, USDT: 0, USDC: 0, TRX: 0 };
    }

    // Add to main USDT balance
    const currentUsdt = user.balances.USDT || 0;
    user.balances.USDT = Number((currentUsdt + referralAmt).toFixed(8));

    // Deduct from referral wallet
    user.referralWallet = 0;

    user.markModified('balances');
    await user.save();

    res.json({
      message: `Successfully transferred ${referralAmt} USDT to your main wallet balance.`,
      balances: user.balances,
      referralWallet: user.referralWallet
    });
  } catch (error) {
    console.error('Error transferring referral balance:', error);
    res.status(500).json({ message: 'Server error transferring referral balance' });
  }
};

// @desc    Get user's personal exchange limits & volume info
// @route   GET /api/user/exchange-limits
// @access  Private
exports.getExchangeLimitsInfo = async (req, res) => {
  try {
    const User = require('../models/User');
    const Order = require('../models/Order');
    const Settings = require('../models/Settings');

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const limitSetting = await Settings.findOne({ key: 'exchange_limits' });
    const limits = limitSetting ? limitSetting.value : { unverifiedLimit: 120, verifiedDailyLimit: 1200, minExchangeUsdt: 100 };
    const unverifiedLimit = limits.unverifiedLimit ?? 120;
    const verifiedDailyLimit = limits.verifiedDailyLimit ?? 1200;
    const minExchangeUsdt = limits.minExchangeUsdt ?? 100;

    const rateSetting = await Settings.findOne({ key: 'exchange_rates' });
    const usdtRate = rateSetting?.value?.USDT || 85;

    const startOf24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const pastOrders = await Order.find({
      user: user._id,
      createdAt: { $gte: startOf24h },
      status: { $ne: 'Rejected' }
    });

    const dailyTotal = pastOrders.reduce((sum, o) => sum + ((o.inr || 0) / usdtRate), 0);
    const userLimit = user.kycStatus === 'Verified' ? verifiedDailyLimit : unverifiedLimit;
    const remainingLimit = Math.max(0, userLimit - dailyTotal);

    res.json({
      kycStatus: user.kycStatus,
      unverifiedLimit,
      verifiedDailyLimit,
      minExchangeUsdt,
      userLimit: Number(userLimit.toFixed(2)),
      dailyTotal: Number(dailyTotal.toFixed(2)),
      remainingLimit: Number(remainingLimit.toFixed(2))
    });
  } catch (error) {
    console.error('Error fetching user exchange limits info:', error);
    res.status(500).json({ message: 'Server error retrieving exchange limits info' });
  }
};

// @desc    Swap between crypto assets (USDT ↔ BTC, USDT ↔ ETH, USDT ↔ USDC, etc.)
// @route   POST /api/user/swap
// @access  Private
exports.swapCoins = async (req, res) => {
  try {
    const { fromCoin, toCoin, fromAmount } = req.body;

    if (!fromCoin || !toCoin || !fromAmount) {
      return res.status(400).json({ message: 'fromCoin, toCoin, and fromAmount are required.' });
    }

    const SUPPORTED_COINS = ['USDT', 'BTC', 'ETH', 'USDC', 'TRX'];
    if (!SUPPORTED_COINS.includes(fromCoin) || !SUPPORTED_COINS.includes(toCoin)) {
      return res.status(400).json({ message: `Unsupported coin. Supported: ${SUPPORTED_COINS.join(', ')}` });
    }

    if (fromCoin === toCoin) {
      return res.status(400).json({ message: 'Cannot swap a coin with itself.' });
    }

    const amount = Number(fromAmount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid swap amount.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!user.balances) {
      user.balances = { BTC: 0, ETH: 0, USDT: 0, USDC: 0, TRX: 0 };
    }

    const fromBalance = user.balances[fromCoin] ?? 0;
    if (amount > fromBalance) {
      return res.status(400).json({
        message: `Insufficient ${fromCoin} balance. Available: ${fromBalance} ${fromCoin}.`
      });
    }

    // Fetch country-specific rates
    const Settings = require('../models/Settings');
    const rateSetting = await Settings.findOne({ key: 'exchange_rates' });
    const userCountryCode = user.countryCode || '+91';
    const allRates = rateSetting?.value || {};
    const rates = allRates[userCountryCode] || allRates['+91'] || {
      USDT: 85, BTC: 8540000, ETH: 210000, USDC: 88, TRX: 10
    };

    const isStable = (coin) => coin === 'USDT' || coin === 'USDC';
    const isStableToStable = isStable(fromCoin) && isStable(toCoin);

    // Convert through fiat as intermediary: (amount * fromFiatRate) / toFiatRate
    let rawOutput;
    if (isStableToStable) {
      rawOutput = amount;
    } else {
      const fromRateInFiat = rates[fromCoin] || 1;
      const toRateInFiat = rates[toCoin] || 1;
      rawOutput = (amount * fromRateInFiat) / toRateInFiat;
    }

    // Fetch admin-controlled swap fee percentage from Settings
    const swapConfigSetting = await Settings.findOne({ key: 'swap_config' });
    const swapFeePercent = isStableToStable ? 0 : (swapConfigSetting?.value?.swapFeePercent ?? 0.5);
    const FEE_PCT = swapFeePercent / 100; // convert percent to decimal

    const fee = rawOutput * FEE_PCT;
    const toAmount = Number((rawOutput - fee).toFixed(8));
    const feeAmount = Number(fee.toFixed(8));

    if (toAmount <= 0) {
      return res.status(400).json({ message: 'Swap amount too small after fee deduction.' });
    }

    // Atomically update balances
    user.balances[fromCoin] = Number((fromBalance - amount).toFixed(8));
    user.balances[toCoin] = Number(((user.balances[toCoin] ?? 0) + toAmount).toFixed(8));
    user.markModified('balances');
    await user.save();

    res.json({
      message: `Successfully swapped ${amount} ${fromCoin} → ${toAmount} ${toCoin}`,
      from: { coin: fromCoin, amount },
      to: { coin: toCoin, amount: toAmount },
      fee: { coin: toCoin, amount: feeAmount },
      balances: user.balances
    });
  } catch (error) {
    console.error('Error swapping coins:', error);
    res.status(500).json({ message: 'Server error processing swap.' });
  }
};

// @desc    Update user profile details
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.countryCode) user.countryCode = req.body.countryCode;
    if (req.body.phone) user.phone = req.body.phone;

    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
