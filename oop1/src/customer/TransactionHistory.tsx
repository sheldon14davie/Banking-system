import React, { useEffect, useState } from 'react';
import { transactionAPI } from '../services/api';
import type { TransactionHistoryItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';

export const TransactionHistory: React.FC = () => {
  const { account } = useAuth();
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await transactionAPI.getMyTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'withdraw':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'transfer':
        return <ArrowRightLeft className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      completed: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${colors[status] || colors.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTransactionDescription = (transaction: TransactionHistoryItem) => {
    if (transaction.type === 'deposit') {
      return 'Deposit to account';
    } else if (transaction.type === 'withdraw') {
      return 'Withdrawal from account';
    } else if (transaction.type === 'transfer') {
      if (transaction.sender_account_id === account?.id) {
        return `Transfer to Account #${transaction.receiver_account_id}`;
      } else {
        return `Transfer from Account #${transaction.sender_account_id}`;
      }
    }
    return 'Unknown';
  };

  const getAmountDisplay = (transaction: TransactionHistoryItem) => {
    let isPositive = false;
    if (transaction.type === 'deposit') {
      isPositive = true;
    } else if (transaction.type === 'transfer' && transaction.receiver_account_id === account?.id) {
      isPositive = true;
    }

    return (
      <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
        {isPositive ? '+' : '-'}{formatCurrency(transaction.amount)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2>Transaction History</h2>
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
        <h2>Transaction History</h2>
        <p className="text-sm text-gray-600">
          View all your past transactions
        </p>
      </div>
      <div className="p-6">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm">Type</th>
                  <th className="text-left py-3 px-4 text-sm">Description</th>
                  <th className="text-left py-3 px-4 text-sm">Date</th>
                  <th className="text-left py-3 px-4 text-sm">Status</th>
                  <th className="text-right py-3 px-4 text-sm">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <span className="capitalize text-sm">{transaction.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{getTransactionDescription(transaction)}</td>
                    <td className="py-3 px-4 text-sm">{formatDate(transaction.timestamp)}</td>
                    <td className="py-3 px-4">{getStatusBadge(transaction.status)}</td>
                    <td className="py-3 px-4 text-right text-sm">
                      {getAmountDisplay(transaction)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
