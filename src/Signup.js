import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { UserPlus } from 'lucide-react';

export const Signup = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const { register, loading, error } = useAuth();

  const handlePasswordChange = (value) => {
    setPassword(value);
    setPasswordMatch(value === confirmPassword);
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    setPasswordMatch(password === value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordMatch(false);
      return;
    }
    await register(email, password, name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-center mb-6">
          <UserPlus className="w-8 h-8 text-green-400 mr-2" />
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-green-400"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-green-400"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-green-400"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 text-white rounded border focus:outline-none ${
                passwordMatch ? 'border-gray-600 focus:border-green-400' : 'border-red-500'
              }`}
              placeholder="••••••••"
              required
            />
          </div>

          {!passwordMatch && (
            <div className="bg-red-900 text-red-200 p-3 rounded text-sm">
              Passwords do not match
            </div>
          )}

          {error && (
            <div className="bg-red-900 text-red-200 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !passwordMatch}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-green-400 hover:text-green-300 font-semibold"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
