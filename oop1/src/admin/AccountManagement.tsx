import React, { useEffect, useState } from 'react';
import { accountAPI } from '../services/api';
import type { Account } from '../types';
import { toast } from 'sonner';

export const AccountManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await accountAPI.getAllAccounts();
      setAccounts(data);
    } catch (err) {
      console.error('Failed to load accounts', err);
      toast.error('Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async (accountId: number, currentStatus: boolean) => {
    try {
      await accountAPI.updateAccountStatus(accountId, !currentStatus);
      setAccounts(accounts.map(acc => 
        acc.id === accountId 
          ? { ...acc, user: acc.user ? { ...acc.user, is_active: !currentStatus } : undefined }
          : acc
      ));
      toast.success(`Account ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      toast.error('Failed to update account status');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2>Account Management</h2>
        </div>
        <div className="p-6">
          <p className="text-center text-gray-500 py-8">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2>Customer Accounts</h2>
        <p className="text-sm text-gray-600">
          View and manage all customer accounts
        </p>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm">Account ID</th>
                <th className="text-left py-3 px-4 text-sm">Customer Name</th>
                <th className="text-left py-3 px-4 text-sm">Username</th>
                <th className="text-left py-3 px-4 text-sm">Balance</th>
                <th className="text-left py-3 px-4 text-sm">Created Date</th>
                <th className="text-left py-3 px-4 text-sm">Status</th>
                <th className="text-left py-3 px-4 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">#{account.id}</td>
                  <td className="py-3 px-4 text-sm">{account.user?.full_name || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm">{account.user?.username || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm">{formatCurrency(account.balance)}</td>
                  <td className="py-3 px-4 text-sm">{formatDate(account.created_at)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                      account.user?.is_active 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {account.user?.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusToggle(account.id, account.user?.is_active || false)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          account.user?.is_active ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            account.user?.is_active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-sm text-gray-600">
                        {account.user?.is_active ? 'Active' : 'Frozen'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
