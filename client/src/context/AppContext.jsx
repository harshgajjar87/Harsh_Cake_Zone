import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSummary = useCallback(async () => {
    const { data } = await axios.get('/api/dashboard/summary');
    if (data.success) setSummary(data.data);
  }, []);

  const fetchOrders = useCallback(async () => {
    const { data } = await axios.get('/api/orders');
    if (data.success) setOrders(data.data);
  }, []);

  const fetchExpenses = useCallback(async () => {
    const { data } = await axios.get('/api/expenses');
    if (data.success) setExpenses(data.data);
  }, []);

  return (
    <AppContext.Provider value={{ summary, orders, expenses, loading, setLoading, toast, showToast, fetchSummary, fetchOrders, fetchExpenses }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
