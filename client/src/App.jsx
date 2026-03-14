import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Expenses from './pages/Expenses';
import Reviews from './pages/Reviews';
import Receipt from './pages/Receipt';
import FeedbackPage from './pages/FeedbackPage';
import Login from './pages/Login';

import useTheme from './hooks/useTheme';

function Layout({ children, isAuth, onLogout, dark, toggleTheme }) {
  const { pathname } = useLocation();
  const isPublic = pathname.startsWith('/receipt/') || pathname.startsWith('/feedback/');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {!isPublic && isAuth && <Navbar onLogout={onLogout} dark={dark} toggleTheme={toggleTheme} />}
      <Toast />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ isAuth, children }) {
  return isAuth ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [checking, setChecking] = useState(true);
  const [dark, toggleTheme] = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('hcz_token');
    if (!token) { setChecking(false); return; }
    axios.post('/api/auth/verify', { token })
      .then(({ data }) => setIsAuth(data.success))
      .catch(() => localStorage.removeItem('hcz_token'))
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = () => setIsAuth(true);
  const handleLogout = () => {
    localStorage.removeItem('hcz_token');
    setIsAuth(false);
  };

  if (checking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-4xl animate-pulse">🎂</div>
    </div>
  );

  return (
    <AppProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout isAuth={isAuth} onLogout={handleLogout} dark={dark} toggleTheme={toggleTheme}>
          <Routes>
            {/* Public routes — customers only */}
            <Route path="/receipt/:token" element={<Receipt />} />
            <Route path="/feedback/:orderId" element={<FeedbackPage />} />

            {/* Auth */}
            <Route path="/login" element={isAuth ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute isAuth={isAuth}><Dashboard /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute isAuth={isAuth}><Orders /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute isAuth={isAuth}><Expenses /></ProtectedRoute>} />
            <Route path="/reviews" element={<ProtectedRoute isAuth={isAuth}><Reviews /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
