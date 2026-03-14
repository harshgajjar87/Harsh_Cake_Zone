import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import StatCard from '../components/StatCard';
import { useApp } from '../context/AppContext';
import { exportToPDF } from '../utils/exportUtils';

export default function Dashboard() {
  const { fetchSummary } = useApp();
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const load = async (start = '', end = '') => {
    setLoading(true);
    try {
      const params = start && end ? { startDate: start, endDate: end } : {};
      const [s, t] = await Promise.all([
        axios.get('/api/dashboard/summary', { params }),
        axios.get('/api/dashboard/trend'),
      ]);
      if (s.data.success) setSummary(s.data.data);
      if (t.data.success) setTrend(t.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [fetchSummary]);

  const handleFilter = () => { if (startDate && endDate) load(startDate, endDate); };
  const handleClear = () => { setStartDate(''); setEndDate(''); load(); };

  const exportDashboard = () => {
    const fmt = (n) => `Rs.${(n || 0).toLocaleString('en-IN')}`;
    const dateLabel = startDate && endDate ? `${startDate} to ${endDate}` : 'All Time';
    const fileName = `Dashboard_${startDate || 'All'}_${endDate || 'Time'}`;

    exportToPDF(
      'Harsh Cake Zone - Financial Report',
      `Period: ${dateLabel}  |  Generated: ${new Date().toLocaleDateString('en-IN')}`,
      [
        {
          heading: 'Summary',
          stats: [
            { label: 'Total Revenue', value: fmt(summary?.totalRevenue) },
            { label: 'Total Expenses', value: fmt(summary?.totalExpenses) },
            { label: 'Net Profit', value: fmt(summary?.netProfit) },
            { label: 'Profit Margin', value: `${summary?.profitMargin || 0}%` },
            { label: 'Total Orders', value: summary?.totalOrders || 0 },
            { label: 'Pending Orders', value: summary?.pendingOrders || 0 },
          ],
        },
        {
          heading: 'Monthly Trend',
          columns: [
            { header: 'Month', key: 'month' },
            { header: 'Revenue (Rs.)', key: 'revenue' },
            { header: 'Expenses (Rs.)', key: 'expenses' },
            { header: 'Profit (Rs.)', key: 'profit' },
          ],
          rows: trend,
        },
        {
          heading: 'Recent Orders',
          columns: [
            { header: 'Customer', key: 'customerName' },
            { header: 'Cake', key: 'cakeDetails' },
            { header: 'Amount (Rs.)', key: 'sellingPrice' },
            { header: 'Payment', key: 'paymentStatus' },
          ],
          rows: summary?.recentOrders || [],
        },
      ],
      fileName
    );
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Health</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your bakery at a glance</p>
        </div>
        <div className="flex gap-2">
          <Link to="/orders" className="btn-primary text-sm flex-1 sm:flex-none text-center">+ New Order</Link>
          <Link to="/expenses" className="btn-secondary text-sm flex-1 sm:flex-none text-center">+ Log Expense</Link>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-sm text-gray-500 font-medium whitespace-nowrap">📅 Date Range:</span>
        <input type="date" className="input flex-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <span className="text-sm text-gray-400">to</span>
        <input type="date" className="input flex-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button className="btn-primary text-sm whitespace-nowrap" onClick={handleFilter} disabled={!startDate || !endDate}>
          Apply
        </button>
        {(startDate || endDate) && (
          <button className="text-xs text-orange-500 hover:underline whitespace-nowrap" onClick={handleClear}>
            Clear
          </button>
        )}
        <button className="btn-secondary text-sm whitespace-nowrap" onClick={exportDashboard} disabled={!summary}>
          ⬇ Export PDF
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={fmt(summary?.totalRevenue)} icon="💰" color="green" sub={startDate && endDate ? `${startDate} → ${endDate}` : 'From paid orders'} />
        <StatCard label="Total Expenses" value={fmt(summary?.totalExpenses)} icon="📦" color="red" sub="Materials & bills" />
        <StatCard
          label="Net Profit"
          value={fmt(summary?.netProfit)}
          icon={summary?.netProfit >= 0 ? '📈' : '📉'}
          color={summary?.netProfit >= 0 ? 'blue' : 'red'}
          sub={`${summary?.profitMargin || 0}% margin`}
        />
        <StatCard label="Pending Orders" value={summary?.pendingOrders || 0} icon="⏳" color="orange" sub={`of ${summary?.totalOrders} total`} />
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Monthly Revenue vs Expenses</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={trend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
            <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
            <Legend />
            <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#rev)" name="Revenue" strokeWidth={2} />
            <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#exp)" name="Expenses" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      {summary?.recentOrders?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-orange-500 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {summary.recentOrders.map((o) => (
              <div key={o._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-sm">{o.customerName}</p>
                  <p className="text-xs text-gray-400">{o.cakeDetails}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">₹{o.sellingPrice}</p>
                  <span className={o.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}>
                    {o.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
