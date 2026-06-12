import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../image/image.png';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/orders', label: 'Orders', icon: '🎂' },
  { to: '/admin/expenses', label: 'Expenses', icon: '💸' },
  { to: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { to: '/admin/referrals', label: 'Referrals', icon: '🤝' },
  { to: '/admin/menu', label: 'Menu', icon: '🍰' },
  { to: '/gallery', label: 'Gallery', icon: '🖼️' },
];

export default function Navbar({ onLogout, dark, toggleTheme }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (to) => pathname === to || (to !== '/gallery' && pathname.startsWith(to));

  return (
    <nav className="bg-white dark:bg-[#2a1a14] border-b border-orange-100 dark:border-orange-900/40 sticky top-0 z-50 shadow-sm transition-colors">
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#2a1a14] rounded-2xl shadow-xl p-6 w-80 text-center">
            <div className="text-4xl mb-3">🚪</div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Logout?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-5">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 rounded-xl border border-orange-200 text-sm font-medium text-gray-600 hover:bg-orange-50 transition-all" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all" onClick={() => { setShowLogoutConfirm(false); onLogout(); }}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <img src={logo} alt="Harsh Cake Zone" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-bold text-xl text-orange-700 dark:text-orange-300">Harsh Cake Zone</span>
            <span className="hidden sm:block text-xs text-gray-400 font-medium ml-1">Bakery Suite</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(l.to)
                    ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-900/20'
                }`}>
                <span>{l.icon}</span>{l.label}
              </Link>
            ))}
            <button onClick={toggleTheme} className="p-2 rounded-xl text-gray-500 hover:bg-orange-50 transition-all" aria-label="Toggle theme">
              {dark ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setShowLogoutConfirm(true)}
              className="ml-1 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all">
              🚪 Logout
            </button>
          </div>

          <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-orange-50" onClick={() => setOpen(!open)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-3 space-y-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${isActive(l.to) ? 'bg-orange-50 text-orange-700' : 'text-gray-600'}`}>
                <span>{l.icon}</span>{l.label}
              </Link>
            ))}
            <button onClick={() => { setOpen(false); setShowLogoutConfirm(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 w-full">🚪 Logout</button>
            <button onClick={toggleTheme} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 w-full">{dark ? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
          </div>
        )}
      </div>
    </nav>
  );
}
