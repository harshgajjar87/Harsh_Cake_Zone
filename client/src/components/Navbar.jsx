import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/orders', label: 'Orders', icon: '🎂' },
  { to: '/expenses', label: 'Expenses', icon: '💸' },
  { to: '/reviews', label: 'Reviews', icon: '⭐' },
];

export default function Navbar({ onLogout, dark, toggleTheme }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 sticky top-0 z-50 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎂</span>
            <span className="font-bold text-xl text-orange-600">HarshCakes</span>
            <span className="hidden sm:block text-xs text-gray-400 font-medium ml-1">Bakery Suite</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  pathname === l.to
                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900'
                }`}
              >
                <span>{l.icon}</span>
                {l.label}
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
              aria-label="Toggle theme"
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={onLogout}
              className="ml-1 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 transition-all"
            >
              🚪 Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-3 space-y-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  pathname === l.to ? 'bg-orange-50 text-orange-600' : 'text-gray-600'
                }`}
              >
                <span>{l.icon}</span>
                {l.label}
              </Link>
            ))}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 w-full"
            >
              🚪 Logout
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 w-full"
            >
              {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
