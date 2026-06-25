const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { submitKyc, getProfile, updateProfile, addBankAccount, updateBankAccount, verifyBankAccount, deleteBankAccount, changePassword, changeTwoFactorCode, getUserReferrals, transferReferralBalance, getExchangeLimitsInfo, swapCoins } = require('../controllers/userController');
const { createOrder, getUserOrders } = require('../controllers/orderController');
const { createDeposit, getUserDeposits } = require('../controllers/depositController');
const { createWithdrawal, getUserWithdrawals } = require('../controllers/withdrawalController');
const { createUserTicket, getUserTickets, getUserTicketDetails, addUserMessage } = require('../controllers/ticketController');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/exchange-limits', protect, getExchangeLimitsInfo);
router.put('/kyc', protect, submitKyc);
router.put('/change-password', protect, changePassword);
router.put('/change-2fa', protect, changeTwoFactorCode);
router.get('/referrals', protect, getUserReferrals);
router.post('/referrals/transfer', protect, transferReferralBalance);

// Bank Accounts Routes
router.post('/banks', protect, addBankAccount);
router.put('/banks/:id', protect, updateBankAccount);
router.put('/banks/:id/verify', protect, verifyBankAccount);
router.delete('/banks/:id', protect, deleteBankAccount);

// User Exchange Orders Routes
router.post('/orders', protect, createOrder);
router.get('/orders', protect, getUserOrders);

// User Crypto Deposits Routes
router.post('/deposits', protect, createDeposit);
router.get('/deposits', protect, getUserDeposits);

// User Crypto Withdrawals Routes
router.post('/withdrawals', protect, createWithdrawal);
router.get('/withdrawals', protect, getUserWithdrawals);

// Crypto-to-Crypto Internal Swap Route
router.post('/swap', protect, swapCoins);

// Support Ticket Routes
router.post('/tickets', protect, createUserTicket);
router.get('/tickets', protect, getUserTickets);
router.get('/tickets/:id', protect, getUserTicketDetails);
router.post('/tickets/:id/messages', protect, addUserMessage);

module.exports = router;
