import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, TrendingUp, TrendingDown, ArrowRightLeft, History, LogOut } from 'lucide-react';
import { DepositForm } from './DepositForm';
import { WithdrawForm } from './WithdrawForm';
import { TransferForm } from './TransferForm';
import { TransactionHistory } from './TransactionHistory';

export const CustomerDashboard: React.FC = () => {
  const { user, account, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'transfer' | 'history'>('deposit');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const tabs = [
    { id: 'deposit' as const, label: 'Deposit', icon: TrendingUp },
    { id: 'withdraw' as const, label: 'Withdraw', icon: TrendingDown },
    { id: 'transfer' as const, label: 'Transfer', icon: ArrowRightLeft },
    { id: 'history' as const, label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl">Simple Banking</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.full_name}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Balance Card */}
        <div className="mb-8 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-indigo-500">
            <h2 className="text-white">Account Balance</h2>
            <p className="text-sm text-indigo-100">Account #{account?.id}</p>
          </div>
          <div className="p-6">
            <p className="text-4xl">{formatCurrency(account?.balance || 0)}</p>
            <p className="text-sm text-indigo-100 mt-2">
              Available Balance
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-2 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white shadow-sm'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div>
            {activeTab === 'deposit' && <DepositForm />}
            {activeTab === 'withdraw' && <WithdrawForm />}
            {activeTab === 'transfer' && <TransferForm />}
            {activeTab === 'history' && <TransactionHistory />}
          </div>
        </div>
      </main>
    </div>
  );
};
