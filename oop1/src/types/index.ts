// Type definitions for the Banking System

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: 'customer' | 'admin';
  is_active: boolean;
}

export interface Account {
  id: number;
  user_id: number;
  balance: number;
  created_at: string;
  user?: User;
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'deposit' | 'withdraw' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  sender_account_id: number | null;
  receiver_account_id: number | null;
  timestamp: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
  account?: Account;
}

export interface TransactionHistoryItem extends Transaction {
  sender_account?: Account;
  receiver_account?: Account;
}
