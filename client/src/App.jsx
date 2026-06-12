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
import Referrals from './pages/Referrals';
import Receipt from './pages/Receipt';
import FeedbackPage from './pages/FeedbackPage';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import AdminMenuPage from './pages/AdminMenuPage';
import PublicReviews from './pages/PublicReviews';
import logo from './image/image.png';
import useTheme from './hooks/useTheme';

// These pages render their own full-page layout (own navbar, footer)
const STANDALONE = ['/', '/menu', '/our-reviews', '/gallery'];

function Layout({ children, isAuth, onLogout, dark, toggleTheme }) {
  const { pathname } = useLocation();
  const isReceipt = pathname.startsWith('/receipt/') || pathname.startsWith('/feedback/');
  // Standalone: public pages that have their own navbar
  // But if admin is logged in and visits /gallery, we want the admin navbar
  const isStandalone = (STANDALONE.includes(pathname) && !isAuth) || isReceipt;

  return (
    <div className={`min-h-screen transition-colors ${isStandalone ? '' : 'bg-[#fdf8f6] dark:bg-[#18100e]'}`}>
      {!isStandalone && isAuth && <Navbar onLogout={onLogout} dark={dark} toggleTheme={toggleTheme} />}
      <Toast />
      {isStandalone ? children : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      )}
    </div>
  );
}

function ProtectedRoute({ isAuth, children }) {
  return isAuth ? children : <Navigate to="/admin" replace />;
}

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [checking, setChecking] = useState(true);
  const [dark, toggleTheme] = useTheme();

  useEffect(() => {
    axios.get('/api/ping').catch(() => {});
    const token = localStorage.getItem('hcz_token');
    if (!token) { setChecking(false); return; }
    axios.post('/api/auth/verify', { token })
      .then(({ data }) => setIsAuth(data.success))
      .catch(() => localStorage.removeItem('hcz_token'))
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = () => setIsAuth(true);
  const handleLogout = () => { localStorage.removeItem('hcz_token'); setIsAuth(false); };

  if (checking) return (
    <div className="min-h-screen bg-[#fdf8f6] flex items-center justify-center">
      <img src={logo} alt="Harsh Cake Zone" className="w-16 h-16 rounded-full object-cover animate-pulse" />
    </div>
  );

  return (
    <AppProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout isAuth={isAuth} onLogout={handleLogout} dark={dark} toggleTheme={toggleTheme}>
          <Routes>
            {/* Public customer routes — standalone layout */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/our-reviews" element={<PublicReviews />} />
            <Route path="/receipt/:token" element={<Receipt />} />
            <Route path="/feedback/:orderId" element={<FeedbackPage />} />

            {/* Gallery: public for customers, admin navbar for logged-in admin */}
            <Route path="/gallery" element={<Gallery isAdmin={isAuth} />} />

            {/* Admin auth */}
            <Route path="/admin" element={isAuth ? <Navigate to="/admin/dashboard" replace /> : <Login onLogin={handleLogin} />} />

            {/* Protected admin routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute isAuth={isAuth}><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute isAuth={isAuth}><Orders /></ProtectedRoute>} />
            <Route path="/admin/expenses" element={<ProtectedRoute isAuth={isAuth}><Expenses /></ProtectedRoute>} />
            <Route path="/admin/reviews" element={<ProtectedRoute isAuth={isAuth}><Reviews /></ProtectedRoute>} />
            <Route path="/admin/referrals" element={<ProtectedRoute isAuth={isAuth}><Referrals /></ProtectedRoute>} />
            <Route path="/admin/menu" element={<ProtectedRoute isAuth={isAuth}><AdminMenuPage /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
