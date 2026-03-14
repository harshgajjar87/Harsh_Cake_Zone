import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const { pathname } = useLocation();
  const isPublic = pathname.startsWith('/receipt/') || pathname.startsWith('/feedback/');
  return (
    <div className="min-h-screen bg-gray-50">
      {!isPublic && <Navbar />}
      <Toast />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Expenses from './pages/Expenses';
import Receipt from './pages/Receipt';
import FeedbackPage from './pages/FeedbackPage';

import Reviews from './pages/Reviews';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/receipt/:token" element={<Receipt />} />
            <Route path="/feedback/:orderId" element={<FeedbackPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
