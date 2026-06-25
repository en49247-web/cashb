const API_URL = 'http://localhost:5000/api/auth';

/**
 * Register a new user
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @param {string} phone 
 * @param {string} countryCode 
 * @returns {Promise<Object>} User data & Token
 */
export const registerUser = async (name, email, password, phone, countryCode, twoFactorCode) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password, phone, countryCode, twoFactorCode })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  return data;
};

/**
 * Log in an existing user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} User data & Token
 */
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data;
};

/**
 * Submit KYC verification
 * @param {Object} details KYC document details
 * @returns {Promise<Object>}
 */
export const submitUserKyc = async (details) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/kyc', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(details)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'KYC submission failed');
  }
  return data;
};

/**
 * Fetch latest user profile state
 * @returns {Promise<Object>}
 */
export const fetchUserProfile = async () => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/profile', {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user profile');
  }
  return data;
};

/**
 * Update user profile details
 * @param {Object} details
 * @returns {Promise<Object>}
 */
export const updateUserProfile = async (details) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(details)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update user profile');
  }
  return data;
};

export const addBankAccount = async (bankDetails) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/banks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(bankDetails)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to add bank account');
  }
  return data;
};

export const updateBankAccount = async (bankId, bankDetails) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch(`http://localhost:5000/api/user/banks/${bankId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(bankDetails)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update bank account');
  }
  return data;
};

export const verifyBankAccount = async (bankId) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch(`http://localhost:5000/api/user/banks/${bankId}/verify`, {
    method: 'PUT',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify bank account');
  }
  return data;
};

export const deleteBankAccount = async (bankId) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch(`http://localhost:5000/api/user/banks/${bankId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete bank account');
  }
  return data;
};

export const submitSellOrder = async (orderDetails) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(orderDetails)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit sell order');
  }
  return data;
};

export const fetchUserOrders = async () => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/orders', {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user orders');
  }
  return data;
};

export const submitDepositProof = async (depositDetails) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/deposits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(depositDetails)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit deposit proof');
  }
  return data;
};

export const fetchUserDeposits = async () => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/deposits', {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user deposits');
  }
  return data;
};

export const changePassword = async (passwords) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/change-password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(passwords)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to change password');
  }
  return data;
};

export const submitWithdrawalRequest = async (withdrawalDetails) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/withdrawals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(withdrawalDetails)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit withdrawal request');
  }
  return data;
};

export const fetchUserWithdrawals = async () => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/withdrawals', {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user withdrawals');
  }
  return data;
};

export const changeTwoFactorPin = async (details) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/change-2fa', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(details)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update Two-Factor PIN');
  }
  return data;
};

export const fetchUserReferrals = async () => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/referrals', {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch referrals');
  }
  return data;
};

export const transferReferralEarnings = async () => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/referrals/transfer', {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to transfer referral earnings');
  }
  return data;
};

export const fetchReferralConfig = async () => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/admin/referral-config', {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch referral configurations');
  }
  return data;
};

export const saveReferralConfig = async (config) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/admin/referral-config', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(config)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to save referral configurations');
  }
  return data;
};

export const fetchAllReferrals = async () => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/admin/referrals', {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch referral directory');
  }
  return data;
};

export const manualCreditReferral = async (userId) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch(`http://localhost:5000/api/admin/referrals/${userId}/credit`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to credit referral reward');
  }
  return data;
};

export const fetchUserExchangeLimits = async () => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/exchange-limits', {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch exchange limits');
  }
  return data;
};

/**
 * Swap crypto-to-crypto inside user wallet
 * @param {string} fromCoin - e.g. 'USDT'
 * @param {string} toCoin   - e.g. 'BTC'
 * @param {number} fromAmount
 * @returns {Promise<Object>} swap result with updated balances
 */
export const swapCoins = async (fromCoin, toCoin, fromAmount) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/swap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify({ fromCoin, toCoin, fromAmount })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Swap failed');
  }
  return data;
};

/**
 * Support Tickets
 */
export const createTicketApi = async (subject, message) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify({ subject, message })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create support ticket');
  }
  return data;
};

export const fetchUserTicketsApi = async () => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch('http://localhost:5000/api/user/tickets', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch support tickets');
  }
  return data;
};

export const fetchUserTicketDetailsApi = async (id) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch(`http://localhost:5000/api/user/tickets/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch ticket details');
  }
  return data;
};

export const addUserTicketMessageApi = async (id, message) => {
  const token = localStorage.getItem('cashXcrypto_token');
  const response = await fetch(`http://localhost:5000/api/user/tickets/${id}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify({ message })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to add message to ticket');
  }
  return data;
};
