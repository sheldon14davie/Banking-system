import React, { useState } from 'react';
import { transactionAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const WithdrawForm: React.FC = () => {
  const { account, refreshAccount } = useAuth();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      const withdrawAmount = parseFloat(amount);
      if (withdrawAmount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      if (withdrawAmount > (account?.balance || 0)) {
        throw new Error('Insufficient funds');
      }

      await transactionAPI.withdraw(withdrawAmount);
      await refreshAccount();
      
      setSuccess(true);
      setAmount('');
      toast.success(`Successfully withdrew $${withdrawAmount.toFixed(2)}`);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err.message || 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2>Withdraw Funds</h2>
        <p className="text-sm text-gray-600">
          Withdraw money from your account
        </p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="withdraw-amount" className="block text-sm">
              Amount ($)
            </label>
            <input
              id="withdraw-amount"
              type="number"
              step="0.01"
              min="0.01"
              max={account?.balance}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="text-sm text-gray-600">
              Available: ${account?.balance.toFixed(2) || '0.00'}
            </p>
          </div>

          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
              <p className="text-sm text-green-800">
                Withdrawal successful! Your balance has been updated.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Withdraw'}
          </button>
        </form>
      </div>
    </div>
  );
};
