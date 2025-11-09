import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Account } from '../types';
import { authAPI, accountAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  account: Account | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authAPI.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      if (currentUser.role === 'customer') {
        accountAPI.getMyAccount()
          .then(setAccount)
          .catch(console.error)
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authAPI.login(username, password);
    setUser(response.user);
    if (response.account) {
      setAccount(response.account);
    }
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    setAccount(null);
  };

  const refreshAccount = async () => {
    if (user?.role === 'customer') {
      const updatedAccount = await accountAPI.getMyAccount();
      setAccount(updatedAccount);
    }
  };

  return (
    <AuthContext.Provider value={{ user, account, login, logout, isLoading, refreshAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
