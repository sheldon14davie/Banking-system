import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, FileText, LogOut } from 'lucide-react';
import { AccountManagement } from './AccountManagement';
import { SystemLog } from './SystemLog';
import { CreateCustomer } from './CreateCustomer';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'accounts' | 'create' | 'logs'>('accounts');

  const tabs = [
    { id: 'accounts' as const, label: 'Account Management', icon: Users },
    { id: 'create' as const, label: 'Create Customer', icon: Users },
    { id: 'logs' as const, label: 'System Logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl">Admin Panel</h1>
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
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg">
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
            {activeTab === 'accounts' && <AccountManagement />}
            {activeTab === 'create' && <CreateCustomer />}
            {activeTab === 'logs' && <SystemLog />}
          </div>
        </div>
      </main>
    </div>
  );
};
