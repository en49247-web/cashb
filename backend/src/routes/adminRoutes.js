const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserStatus, updateUserKyc, deleteUser, saveUsdtRate, getUsdtRate, saveAllRates, getAllRates, toggleBankVerify, getAllOrders, updateOrderStatus, saveWallets, getWallets, getWalletsManage, saveWalletsManage, getAllDeposits, updateDepositStatus, getAllWithdrawals, updateWithdrawalStatus, getReferralConfig, saveReferralConfig, getUserReport, getExchangeLimits, saveExchangeLimits, getSwapConfig, saveSwapConfig, getAllReferralRelations, manualCreditReferralReward, getTelegramConfig, saveTelegramConfig } = require('../controllers/adminController');
const { adminGetAllTickets, adminGetTicketDetails, adminAddMessage, adminCloseTicket } = require('../controllers/ticketController');
const { protect, admin } = require('../middleware/authMiddleware');

// Referral configuration routes
router.get('/referral-config', protect, admin, getReferralConfig);
router.put('/referral-config', protect, admin, saveReferralConfig);
router.get('/referrals', protect, admin, getAllReferralRelations);
router.post('/referrals/:id/credit', protect, admin, manualCreditReferralReward);

// Exchange Limits routes
router.get('/exchange-limits', protect, admin, getExchangeLimits);
router.put('/exchange-limits', protect, admin, saveExchangeLimits);

// Swap Fee Config routes (GET is public so users can preview fees)
router.get('/swap-config', getSwapConfig);
router.put('/swap-config', protect, admin, saveSwapConfig);

// User report endpoint
router.get('/users/:id/report', protect, admin, getUserReport);

// General and USDT rate routes
router.get('/rates', getAllRates);                          // Public - all rates
router.put('/rates', protect, admin, saveAllRates);          // Admin only - save all rates
router.get('/rates/usdt', getUsdtRate);                    // Public - users need this
router.put('/rates/usdt', protect, admin, saveUsdtRate);    // Admin only

// Deposit Wallet Routes
router.get('/wallets', getWallets);                         // Public - users need this
router.put('/wallets', protect, admin, saveWallets);        // Admin only
router.get('/wallets/manage', protect, admin, getWalletsManage); // Admin only
router.put('/wallets/manage', protect, admin, saveWalletsManage); // Admin only

// Admin Deposits proof routes
router.get('/deposits', protect, admin, getAllDeposits);
router.put('/deposits/:id/status', protect, admin, updateDepositStatus);

// Admin Withdrawals routes
router.get('/withdrawals', protect, admin, getAllWithdrawals);
router.put('/withdrawals/:id/status', protect, admin, updateWithdrawalStatus);

// Mount routes with auth and admin protections
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/status', protect, admin, updateUserStatus);
router.put('/users/:id/kyc', protect, admin, updateUserKyc);
router.delete('/users/:id', protect, admin, deleteUser);
router.put('/users/:userId/banks/:bankId/verify', protect, admin, toggleBankVerify);

// Order Management Routes
router.get('/orders', protect, admin, getAllOrders);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);

// Support Ticket Management Routes
router.get('/tickets', protect, admin, adminGetAllTickets);
router.get('/tickets/:id', protect, admin, adminGetTicketDetails);
router.post('/tickets/:id/messages', protect, admin, adminAddMessage);
router.put('/tickets/:id/close', protect, admin, adminCloseTicket);

// Telegram Config Routes
router.get('/telegram-config', protect, admin, getTelegramConfig);
router.put('/telegram-config', protect, admin, saveTelegramConfig);

module.exports = router;
