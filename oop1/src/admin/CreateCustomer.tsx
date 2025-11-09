import React, { useState } from 'react';
import { adminAPI } from '../services/api';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const CreateCustomer: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      const deposit = parseFloat(initialDeposit);
      if (deposit < 0) {
        throw new Error('Initial deposit must be 0 or greater');
      }

      await adminAPI.createCustomer(username, password, fullName, deposit);
      
      setSuccess(true);
      setUsername('');
      setPassword('');
      setFullName('');
      setInitialDeposit('');
      
      toast.success(`Customer account created successfully for ${fullName}`);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create customer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2>Create New Customer</h2>
        <p className="text-sm text-gray-600">
          Create a new customer account with initial balance
        </p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="full-name" className="block text-sm">
              Full Name
            </label>
            <input
              id="full-name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="initial-deposit" className="block text-sm">
              Initial Deposit ($)
            </label>
            <input
              id="initial-deposit"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
              <p className="text-sm text-green-800">
                Customer account created successfully!
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Customer'}
          </button>
        </form>
      </div>
    </div>
  );
};
