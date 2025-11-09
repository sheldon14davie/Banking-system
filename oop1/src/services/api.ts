// API Service Layer - Connect to Django Backend
// Replace API_BASE_URL with your actual Django server URL

const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Helper function to create headers
const createHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Mock data for development (remove when connecting to real backend)
const MOCK_MODE = true;

const mockUser = {
  id: 1,
  username: 'demo_customer',
  full_name: 'John Doe',
  role: 'customer' as const,
  is_active: true,
};

const mockAdminUser = {
  id: 2,
  username: 'admin',
  full_name: 'Admin User',
  role: 'admin' as const,
  is_active: true,
};

const mockAccount = {
  id: 1001,
  user_id: 1,
  balance: 5000.00,
  created_at: new Date().toISOString(),
  user: mockUser,
};

const mockTransactions = [
  {
    id: 1,
    amount: 1000.00,
    type: 'deposit' as const,
    status: 'completed' as const,
    sender_account_id: null,
    receiver_account_id: 1001,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 2,
    amount: 200.00,
    type: 'withdraw' as const,
    status: 'completed' as const,
    sender_account_id: 1001,
    receiver_account_id: null,
    timestamp: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 3,
    amount: 500.00,
    type: 'transfer' as const,
    status: 'completed' as const,
    sender_account_id: 1001,
    receiver_account_id: 1002,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    if (MOCK_MODE) {
      // Mock login
      await new Promise(resolve => setTimeout(resolve, 500));
      const user = username === 'admin' ? mockAdminUser : mockUser;
      const response = {
        access: 'mock_access_token',
        refresh: 'mock_refresh_token',
        user,
        account: username !== 'admin' ? mockAccount : undefined,
      };
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('user', JSON.stringify(user));
      return response;
    }

    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  logout: async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    if (MOCK_MODE) return;

    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: createHeaders(),
    });
    
    if (!response.ok) throw new Error('Logout failed');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Account API
export const accountAPI = {
  getMyAccount: async () => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockAccount;
    }

    const response = await fetch(`${API_BASE_URL}/accounts/me/`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch account');
    return response.json();
  },

  getAllAccounts: async () => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        mockAccount,
        {
          id: 1002,
          user_id: 3,
          balance: 3500.00,
          created_at: new Date().toISOString(),
          user: {
            id: 3,
            username: 'jane_smith',
            full_name: 'Jane Smith',
            role: 'customer' as const,
            is_active: true,
          },
        },
        {
          id: 1003,
          user_id: 4,
          balance: 7200.50,
          created_at: new Date().toISOString(),
          user: {
            id: 4,
            username: 'bob_jones',
            full_name: 'Bob Jones',
            role: 'customer' as const,
            is_active: true,
          },
        },
      ];
    }

    const response = await fetch(`${API_BASE_URL}/accounts/`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return response.json();
  },

  updateAccountStatus: async (accountId: number, isActive: boolean) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    }

    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/status/`, {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify({ is_active: isActive }),
    });
    
    if (!response.ok) throw new Error('Failed to update account status');
    return response.json();
  },
};

// Transaction API
export const transactionAPI = {
  deposit: async (amount: number) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id: Date.now(),
        amount,
        type: 'deposit' as const,
        status: 'completed' as const,
        sender_account_id: null,
        receiver_account_id: mockAccount.id,
        timestamp: new Date().toISOString(),
      };
    }

    const response = await fetch(`${API_BASE_URL}/transactions/deposit/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ amount }),
    });
    
    if (!response.ok) throw new Error('Deposit failed');
    return response.json();
  },

  withdraw: async (amount: number) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (amount > mockAccount.balance) {
        throw new Error('Insufficient funds');
      }
      return {
        id: Date.now(),
        amount,
        type: 'withdraw' as const,
        status: 'completed' as const,
        sender_account_id: mockAccount.id,
        receiver_account_id: null,
        timestamp: new Date().toISOString(),
      };
    }

    const response = await fetch(`${API_BASE_URL}/transactions/withdraw/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ amount }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Withdrawal failed');
    }
    return response.json();
  },

  transfer: async (receiverAccountId: number, amount: number) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (amount > mockAccount.balance) {
        throw new Error('Insufficient funds');
      }
      return {
        id: Date.now(),
        amount,
        type: 'transfer' as const,
        status: 'completed' as const,
        sender_account_id: mockAccount.id,
        receiver_account_id: receiverAccountId,
        timestamp: new Date().toISOString(),
      };
    }

    const response = await fetch(`${API_BASE_URL}/transactions/transfer/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ receiver_account_id: receiverAccountId, amount }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Transfer failed');
    }
    return response.json();
  },

  getMyTransactions: async () => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockTransactions;
    }

    const response = await fetch(`${API_BASE_URL}/transactions/me/`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  getAllTransactions: async () => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockTransactions;
    }

    const response = await fetch(`${API_BASE_URL}/transactions/`, {
      headers: createHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },
};

// Admin API
export const adminAPI = {
  createCustomer: async (username: string, password: string, fullName: string, initialDeposit: number) => {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        user: {
          id: Date.now(),
          username,
          full_name: fullName,
          role: 'customer' as const,
          is_active: true,
        },
        account: {
          id: Date.now() + 1000,
          user_id: Date.now(),
          balance: initialDeposit,
          created_at: new Date().toISOString(),
        },
      };
    }

    const response = await fetch(`${API_BASE_URL}/admin/customers/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({
        username,
        password,
        full_name: fullName,
        initial_deposit: initialDeposit,
      }),
    });
    
    if (!response.ok) throw new Error('Failed to create customer');
    return response.json();
  },
};
