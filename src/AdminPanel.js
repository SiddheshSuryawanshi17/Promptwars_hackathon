import React, { useState } from 'react';
import { Settings, Users, AlertCircle, BarChart3, Lock } from 'lucide-react';

export const AdminPanel = ({ isAdmin, userName }) => {
  const [adminMode, setAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock admin password (in production, use proper authentication)
  const ADMIN_PASSWORD = 'admin123';

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setAdminPassword('');
      setAdminMode(true);
    } else {
      alert('Invalid admin password');
      setAdminPassword('');
    }
  };

  const adminStats = [
    { label: 'Active Users', value: '2,543', trend: '+12%' },
    { label: 'Avg Queue Time', value: '12.3 min', trend: '-3%' },
    { label: 'Facility Utilization', value: '78%', trend: '+5%' },
    { label: 'Revenue (Today)', value: '$4,250', trend: '+8%' }
  ];

  const facilitiesStatus = [
    { id: 1, name: 'Pizza Stand', status: 'open', queue: 12, efficiency: '85%' },
    { id: 2, name: 'Burger Hut', status: 'open', queue: 18, efficiency: '72%' },
    { id: 3, name: 'Soda Bar', status: 'maintenance', queue: 0, efficiency: '0%' },
    { id: 4, name: 'Restroom Block A', status: 'open', queue: 5, efficiency: '92%' }
  ];

  if (!authenticated && adminMode) {
    return (
      <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-6 border border-red-600 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-6 h-6 text-red-400" />
          <h3 className="text-xl font-bold text-white">Admin Authentication Required</h3>
        </div>

        <div className="bg-red-900 bg-opacity-50 p-4 rounded border border-red-500 mb-4">
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
            placeholder="Enter admin password"
            className="w-full px-4 py-2 bg-red-800 text-white rounded border border-red-600 placeholder-red-400 focus:outline-none focus:border-red-400 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdminLogin}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
            >
              Authenticate
            </button>
            <button
              onClick={() => { setAdminMode(false); setAdminPassword(''); }}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!adminMode) {
    return (
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 border border-slate-600 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Admin Panel</h3>
          </div>
          <button
            onClick={() => setAdminMode(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition"
          >
            Staff Login
          </button>
        </div>
        <p className="text-gray-400">Contact management for admin access credentials.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border border-purple-600 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Admin Dashboard</h3>
        </div>
        <button
          onClick={() => { setAdminMode(false); setAuthenticated(false); }}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
        >
          Logout (Admin)
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-purple-600">
        {['overview', 'facilities', 'users', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 font-semibold text-sm transition capitalize ${
              selectedTab === tab
                ? 'text-purple-300 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-4">
          <h4 className="text-white font-semibold mb-3">Key Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {adminStats.map((stat, idx) => (
              <div key={idx} className="bg-purple-900 bg-opacity-50 p-4 rounded border border-purple-500">
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-purple-300 mt-2">{stat.value}</p>
                <p className="text-green-400 text-xs mt-1">{stat.trend}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facilities Tab */}
      {selectedTab === 'facilities' && (
        <div className="space-y-3">
          <h4 className="text-white font-semibold mb-3">Facility Status</h4>
          {facilitiesStatus.map(fac => (
            <div key={fac.id} className="bg-purple-900 bg-opacity-50 p-4 rounded border border-purple-500 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white font-semibold">{fac.name}</p>
                <p className="text-gray-400 text-sm">Queue: {fac.queue} | Efficiency: {fac.efficiency}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded text-xs font-semibold ${
                  fac.status === 'open'
                    ? 'bg-green-900 text-green-300'
                    : 'bg-red-900 text-red-300'
                }`}>
                  {fac.status.toUpperCase()}
                </span>
                <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition">
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {selectedTab === 'users' && (
        <div className="space-y-3">
          <h4 className="text-white font-semibold mb-3">Active Users</h4>
          <div className="bg-purple-900 bg-opacity-50 p-4 rounded border border-purple-500">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold">Total Active: 2,543</p>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• North Sector: 512 users (20%)</p>
              <p>• South Sector: 648 users (25%)</p>
              <p>• East Sector: 421 users (17%)</p>
              <p>• West Sector: 356 users (14%)</p>
              <p>• Center: 606 users (24%)</p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
        <div className="space-y-3">
          <h4 className="text-white font-semibold mb-3">Performance Analytics</h4>
          <div className="bg-purple-900 bg-opacity-50 p-4 rounded border border-purple-500">
            <BarChart3 className="w-6 h-6 text-purple-400 mb-3" />
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Average wait time: 12.3 minutes</p>
              <p>• Peak hours: 1:00 PM - 3:00 PM</p>
              <p>• Customer satisfaction: 4.2/5</p>
              <p>• Revenue 4-hour: $4,250</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-purple-900 bg-opacity-50 rounded border border-purple-500">
        <p className="text-purple-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="font-semibold">Soda Bar</span> in maintenance (30 mins remaining)
        </p>
      </div>
    </div>
  );
};
