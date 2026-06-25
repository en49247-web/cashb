const API_URL = 'http://localhost:5000/api/admin';

// Helper to get auth headers with bearer token
const getHeaders = () => {
  const token = localStorage.getItem('cashXcrypto_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Fetch all registered users
 * @returns {Promise<Array>} List of users
 */
export const fetchAllUsers = async () => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch registered customers');
  }
  return data;
};

/**
 * Toggle user status (Active / Blocked)
 * @param {string} userId 
 * @param {string} status - 'Active' or 'Blocked'
 * @returns {Promise<Object>} Updated user
 */
export const updateUserStatus = async (userId, status) => {
  const response = await fetch(`${API_URL}/users/${userId}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update user status');
  }
  return data;
};

/**
 * Update user KYC verification status
 * @param {string} userId 
 * @param {string} kycStatus - 'Verified', 'Pending', or 'Unverified'
 * @returns {Promise<Object>} Updated user
 */
export const updateUserKyc = async (userId, kycStatus) => {
  const response = await fetch(`${API_URL}/users/${userId}/kyc`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ kycStatus })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update user KYC verification status');
  }
  return data;
};

/**
 * Delete a registered user account
 * @param {string} userId 
 * @returns {Promise<Object>} Success message details
 */
export const deleteUser = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });

  let data = {};
  try {
    data = await response.json();
  } catch (e) {
    // Ignore JSON parsing issues on empty/text responses
  }
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete user account');
  }
  return data;
};

/**
 * Save USDT exchange rate to database
 * @param {number} rate - USDT rate in INR
 * @returns {Promise<Object>}
 */
export const saveUsdtRate = async (rate) => {
  const response = await fetch(`${API_URL}/rates/usdt`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ rate })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to save USDT rate');
  }
  return data;
};

/**
 * Fetch current USDT exchange rate from database (public)
 * @returns {Promise<Object>} { rate: number }
 */
export const fetchUsdtRate = async () => {
  const response = await fetch(`${API_URL}/rates/usdt`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch USDT rate');
  }
  return data;
};

/**
 * Save all exchange rates to database
 * @param {Object} rates - { USDT, BTC, ETH, USDC }
 * @returns {Promise<Object>}
 */
export const saveExchangeRates = async (rates, countryCode) => {
  const response = await fetch(`${API_URL}/rates`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ rates, countryCode })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to save exchange rates');
  }
  return data;
};

/**
 * Fetch all exchange rates from database (public)
 * @param {string} [countryCode] - Optional country code
 * @returns {Promise<Object>} { rates: { USDT, BTC, ETH, USDC } }
 */
export const fetchExchangeRates = async (countryCode) => {
  const url = countryCode ? `${API_URL}/rates?countryCode=${encodeURIComponent(countryCode)}` : `${API_URL}/rates`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch exchange rates');
  }
  return data;
};

/**
 * Toggle user bank verification status
 * @param {string} userId
 * @param {string} bankId
 * @returns {Promise<Object>}
 */
export const toggleAdminBankVerify = async (userId, bankId) => {
  const response = await fetch(`${API_URL}/users/${userId}/banks/${bankId}/verify`, {
    method: 'PUT',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to toggle bank verification status');
  }
  return data;
};

export const fetchAllOrders = async () => {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch admin orders');
  }
  return data;
};

export const updateOrderStatusApi = async (orderId, status) => {
  const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update order status');
  }
  return data;
};

export const fetchDepositWallets = async () => {
  const response = await fetch(`${API_URL}/wallets`, {
    method: 'GET'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch deposit wallets');
  }
  return data.wallets;
};

export const saveDepositWalletsApi = async (wallets) => {
  const response = await fetch(`${API_URL}/wallets`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ wallets })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to save deposit wallets');
  }
  return data;
};

export const fetchDepositWalletsManage = async () => {
  const response = await fetch(`${API_URL}/wallets/manage`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch managed deposit wallets');
  }
  return data.wallets;
};

export const saveDepositWalletsManageApi = async (wallets) => {
  const response = await fetch(`${API_URL}/wallets/manage`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ wallets })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to save managed deposit wallets');
  }
  return data;
};

export const fetchAdminDeposits = async () => {
  const response = await fetch(`${API_URL}/deposits`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch admin deposits list');
  }
  return data;
};

export const updateDepositStatusApi = async (depositId, status) => {
  const response = await fetch(`${API_URL}/deposits/${depositId}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update deposit status');
  }
  return data;
};

export const fetchAdminWithdrawals = async () => {
  const response = await fetch(`${API_URL}/withdrawals`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch admin withdrawals list');
  }
  return data;
};

export const updateWithdrawalStatusApi = async (withdrawalId, status) => {
  const response = await fetch(`${API_URL}/withdrawals/${withdrawalId}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update withdrawal status');
  }
  return data;
};

export const fetchUserReport = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}/report`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user report');
  }
  return data;
};

export const fetchExchangeLimits = async () => {
  const response = await fetch(`${API_URL}/exchange-limits`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch exchange limits');
  }
  return data;
};

export const saveExchangeLimitsApi = async (limits) => {
  const response = await fetch(`${API_URL}/exchange-limits`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(limits)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to save exchange limits');
  }
  return data;
};

// Fetch swap fee configuration (public)
export const fetchSwapConfig = async () => {
  const response = await fetch(`${API_URL}/swap-config`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch swap config');
  return data;
};

// Save swap fee configuration (admin only)
export const saveSwapConfigApi = async (config) => {
  const response = await fetch(`${API_URL}/swap-config`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(config)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to save swap config');
  return data;
};

/**
 * Admin Support Tickets
 */
export const fetchAdminTicketsApi = async () => {
  const response = await fetch(`${API_URL}/tickets`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch admin support tickets');
  }
  return data;
};

export const fetchAdminTicketDetailsApi = async (id) => {
  const response = await fetch(`${API_URL}/tickets/${id}`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch ticket details');
  }
  return data;
};

export const addAdminTicketMessageApi = async (id, message) => {
  const response = await fetch(`${API_URL}/tickets/${id}/messages`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ message })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to add message to ticket');
  }
  return data;
};

export const closeAdminTicketApi = async (id) => {
  const response = await fetch(`${API_URL}/tickets/${id}/close`, {
    method: 'PUT',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to close ticket');
  }
  return data;
};

export const fetchTelegramConfig = async () => {
  const response = await fetch(`${API_URL}/telegram-config`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch Telegram config');
  }
  return data;
};

export const saveTelegramConfigApi = async (config) => {
  const response = await fetch(`${API_URL}/telegram-config`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(config)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to save Telegram config');
  }
  return data;
};
