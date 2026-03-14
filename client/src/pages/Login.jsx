import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/auth/login', form);
      if (data.success) {
        localStorage.setItem('hcz_token', data.token);
        onLogin();
      }
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="card border border-orange-100">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎂</div>
            <h1 className="text-2xl font-bold text-orange-600">Harsh Cake Zone</h1>
            <p className="text-sm text-gray-400 mt-1">Bakery Management Suite</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Username</label>
              <input
                className="input"
                placeholder="Enter username"
                autoComplete="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
