const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendTelegramNotification } = require('../services/telegramService');

// Generate JWT Helper
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret_key', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, countryCode, twoFactorCode, referralCode } = req.body;

    if (!name || !email || !password || !phone || !countryCode || !twoFactorCode) {
      return res.status(400).json({ message: 'Please enter all fields including 6-digit Two-Factor Code (2FA)' });
    }

    if (String(twoFactorCode).length !== 6 || isNaN(Number(twoFactorCode))) {
      return res.status(400).json({ message: 'Two-Factor Code must be exactly 6 digits' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Lookup referrer if referral code was provided
    let referredByUser = null;
    if (referralCode && referralCode.trim() !== '') {
      referredByUser = await User.findOne({ referralCode: referralCode.trim() });
      if (!referredByUser) {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Hash 2FA code
    const salt2fa = await bcrypt.genSalt(10);
    const hashed2FA = await bcrypt.hash(String(twoFactorCode), salt2fa);

    // Auto-detect admin role for specific email
    const role = email.toLowerCase() === 'admin@cashXcrypto.com' ? 'admin' : 'user';

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      countryCode,
      role,
      twoFactorCode: hashed2FA,
      referredBy: referredByUser ? referredByUser._id : undefined
    });

    if (user) {
      // Send Telegram notification
      sendTelegramNotification(`👤 <b>New User Registered</b>\n\n<b>Name:</b> ${user.name}\n<b>Email:</b> ${user.email}\n<b>Phone:</b> ${user.countryCode} ${user.phone}\n<b>CX ID:</b> <code>${user.cxId || 'N/A'}</code>`);

      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        countryCode: user.countryCode,
        role: user.role,
        kycStatus: user.kycStatus,
        cxId: user.cxId,
        token: generateToken(user.id, user.role)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check for user email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'Blocked') {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
    }

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
        user.cxId = generatedId;
      }
    }

    if (!user.twoFactorCode) {
      const salt2fa = await bcrypt.genSalt(10);
      const hashed2FA = await bcrypt.hash('000000', salt2fa);
      await User.updateOne({ _id: user._id }, { $set: { twoFactorCode: hashed2FA } });
      user.twoFactorCode = hashed2FA;
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      countryCode: user.countryCode,
      role: user.role,
      kycStatus: user.kycStatus,
      cxId: user.cxId,
      token: generateToken(user.id, user.role)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
