import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import ConfirmModal from '../components/ConfirmModal';
import { exportToExcel } from '../utils/exportUtils';

const STATUS_FLOW = ['Received', 'In Progress', 'Ready', 'Delivered'];

function groupByDate(orders) {
  const groups = {};
  orders.forEach((o) => {
    const key = new Date(o.orderDate).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(o);
  });
  return groups;
}

export default function Orders() {
  const { showToast } = useApp();
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ customerName: '', phone: '', cakeDetails: '', sellingPrice: '', orderDate: '', paymentStatus: 'Pending' });
  const [cakeImage, setCakeImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

  const load = async () => {
    const { data } = await axios.get('/api/orders');
    if (data.success) setOrders(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filteredOrders = orders
    .filter((o) => {
      if (!filterDate) return true;
      return new Date(o.orderDate).toLocaleDateString('en-CA') === filterDate;
    })
    .sort((a, b) => {
      const diff = new Date(a.orderDate) - new Date(b.orderDate);
      return sortDir === 'asc' ? diff : -diff;
    });

  const grouped = groupByDate(filteredOrders);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (cakeImage) fd.append('cakeImage', cakeImage);
      await axios.post('/api/orders', fd);
      showToast('Order created successfully!');
      setShowForm(false);
      setForm({ customerName: '', phone: '', cakeDetails: '', sellingPrice: '', orderDate: '', paymentStatus: 'Pending' });
      setCakeImage(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, orderStatus) => {
    try {
      await axios.patch(`/api/orders/${id}/status`, { orderStatus });
      showToast('Status updated');
      load();
    } catch {
      showToast('Update failed', 'error');
    }
  };

  const sendPaymentRequest = async (o) => {
    try {
      await axios.patch(`/api/orders/${o._id}/status`, { paymentStatus: 'Paid' });
      const digits = o.phone.replace(/\D/g, '');
      const phone = digits.startsWith('91') ? digits : `91${digits}`;
      const upiLink = `upi://pay?pa=${process.env.REACT_APP_UPI_ID || '8866319009@okicici'}&pn=HarshCakes&am=${o.sellingPrice}&cu=INR`;
      const message =
        `🎂✨ *Harsh Cake Zone* ✨🎂\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `Hello *${o.customerName}*! 👋\n\n` +
        `🙏 Thank you so much for your order!\n` +
        `Your cake is *ready & waiting* for you! 🎉\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🛍️ *Order:* ${o.cakeDetails}\n` +
        `💰 *Amount Due:* ₹${o.sellingPrice}\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `📲 *Pay via UPI (tap to open):*\n` +
        `👉 ${upiLink}\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `💕 We truly appreciate your support!\n` +
        `See you soon! 😊`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
      showToast('Payment request sent!');
      load();
    } catch {
      showToast('Failed', 'error');
    }
  };

  const sendReceipt = async (o) => {
    const digits = o.phone.replace(/\D/g, '');
    const phone = digits.startsWith('91') ? digits : `91${digits}`;
    const base = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
    const receiptURL = `${base}/receipt/${o.receiptToken}`;
    const message =
      `🧾✨ *Harsh Cake Zone* ✨🧾\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `Hello *${o.customerName}*! 👋\n\n` +
      `📋 Here is your *Digital Receipt* for:\n` +
      `🎂 _${o.cakeDetails}_\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Amount Paid:* ₹${o.sellingPrice} ✅\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `🔗 *View & Download Receipt:*\n` +
      `👉 ${receiptURL}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🙏 Thank you for choosing us!\n` +
      `We hope you loved your cake! 💕🎂`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    await axios.patch(`/api/orders/${o._id}/status`, { receiptSent: true });
    load();
  };

  const sendReview = async (o) => {
    const digits = o.phone.replace(/\D/g, '');
    const phone = digits.startsWith('91') ? digits : `91${digits}`;
    const reviewURL = `${window.location.origin}/feedback/${o._id}`;
    const message =
      `⭐✨ *Harsh Cake Zone* ✨⭐\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `Hello *${o.customerName}*! 👋\n\n` +
      `🎂 We hope you absolutely *loved* your cake!\n\n` +
      `💬 Your feedback means the world to us.\n` +
      `It only takes *30 seconds* — we promise! 🙏\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🌟 *Leave Your Review Here:*\n` +
      `👉 ${reviewURL}\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `💕 Thank you for being our valued customer!\n` +
      `— *Harsh Cake Zone* 🎂`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    await axios.patch(`/api/orders/${o._id}/status`, { reviewSent: true });
    load();
  };

  const exportOrders = () => {
    const cols = [
      { header: 'Customer', key: 'customerName' },
      { header: 'Phone', key: 'phone' },
      { header: 'Cake Details', key: 'cakeDetails' },
      { header: 'Amount (₹)', key: 'sellingPrice' },
      { header: 'Order Date', key: 'orderDateFmt' },
      { header: 'Order Status', key: 'orderStatus' },
      { header: 'Payment', key: 'paymentStatus' },
    ];
    const rows = filteredOrders.map((o) => ({
      ...o,
      orderDateFmt: new Date(o.orderDate).toLocaleDateString('en-IN'),
    }));
    exportToExcel(rows, cols, 'Orders', `Orders_${filterDate || 'All'}`);
  };

  const deleteOrder = async (id) => {
    await axios.delete(`/api/orders/${id}`);
    showToast('Order deleted');
    setDeleteTarget(null);
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={!!deleteTarget}
        orderName={deleteTarget?.name}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteOrder(deleteTarget.id)}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Order'}
        </button>
      </div>

      {/* New Order Form */}
      {showForm && (
        <div className="card border border-orange-100">
          <h2 className="font-semibold mb-4 text-orange-600">New Order</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="input" placeholder="Customer Name *" required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            <input className="input" placeholder="Phone *" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input sm:col-span-2" placeholder="Cake Details *" required value={form.cakeDetails} onChange={(e) => setForm({ ...form, cakeDetails: e.target.value })} />
            <input className="input" type="number" placeholder="Selling Price (₹) *" required value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
            <input className="input" type="date" value={form.orderDate} onChange={(e) => setForm({ ...form, orderDate: e.target.value })} />
            <select className="input" value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
              <option>Pending</option>
              <option>Paid</option>
            </select>
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Cake Photo (optional)</label>
              <input type="file" accept="image/*" className="input" onChange={(e) => setCakeImage(e.target.files[0])} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Create Order'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Date Filter + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-sm text-gray-500 font-medium whitespace-nowrap">📅 Date:</label>
          <input
            type="date"
            className="input flex-1"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <button className="text-xs text-orange-500 hover:underline whitespace-nowrap" onClick={() => setFilterDate('')}>
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary text-xs flex items-center gap-1"
            onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
          >
            {sortDir === 'desc' ? '↓ Newest' : '↑ Oldest'}
          </button>
          <span className="text-xs text-gray-400">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</span>
          <button className="btn-secondary text-xs" onClick={exportOrders} disabled={filteredOrders.length === 0}>
            ⬇ Export Excel
          </button>
        </div>
      </div>

      {/* Orders grouped by date */}
      {filteredOrders.length === 0 && (
        <p className="text-center text-gray-400 py-12">
          {filterDate ? 'No orders on this date.' : 'No orders yet. Create your first one!'}
        </p>
      )}

      {Object.entries(grouped).map(([date, dayOrders]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              📅 {date} · {dayOrders.length} order{dayOrders.length !== 1 ? 's' : ''}
            </span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          <div className="space-y-3">
            {dayOrders.map((o) => (
              <div key={o._id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex gap-3">
                    {o.cakeImageURL && (
                      <img src={o.cakeImageURL} alt="cake" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{o.customerName}</h3>
                        <span className={o.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}>{o.paymentStatus}</span>
                        <span className="badge-ready">{o.orderStatus}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 truncate">{o.cakeDetails}</p>
                      <p className="text-xs text-gray-400 mt-1">📞 {o.phone}</p>
                    </div>
                  </div>
                <div className="flex flex-col gap-2">
                    <p className="text-xl font-bold text-orange-600 sm:text-right">₹{o.sellingPrice}</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_FLOW.indexOf(o.orderStatus) < STATUS_FLOW.length - 1 && (
                        <button
                          className="btn-secondary text-xs"
                          onClick={() => updateStatus(o._id, STATUS_FLOW[STATUS_FLOW.indexOf(o.orderStatus) + 1])}
                        >
                          → {STATUS_FLOW[STATUS_FLOW.indexOf(o.orderStatus) + 1]}
                        </button>
                      )}
                      {o.paymentStatus === 'Pending' && (
                        <button className="bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-xl" onClick={() => sendPaymentRequest(o)}>
                          💳 Send Payment Request
                        </button>
                      )}
                      {o.paymentStatus === 'Paid' && (
                        <span className="bg-green-50 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-xl border border-green-200">
                          ✅ Paid
                        </span>
                      )}
                      {o.paymentStatus === 'Paid' && !o.receiptSent && (
                        <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-xl" onClick={() => sendReceipt(o)}>
                          🧾 Send Receipt
                        </button>
                      )}
                      {o.receiptSent && (
                        <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-200">
                          ✅ Receipt Sent
                        </span>
                      )}
                      {!o.reviewSent && !o.feedbackGiven && (
                        <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-xl" onClick={() => sendReview(o)}>
                          ⭐ Send Review
                        </button>
                      )}
                      {o.reviewSent && !o.feedbackGiven && (
                        <span className="bg-yellow-50 text-yellow-600 text-xs font-semibold px-3 py-1.5 rounded-xl border border-yellow-200">
                          ✅ Review Sent
                        </span>
                      )}
                      {o.feedbackGiven && (
                        <span className="bg-yellow-50 text-yellow-600 text-xs font-semibold px-3 py-1.5 rounded-xl border border-yellow-200">
                          ⭐ Reviewed
                        </span>
                      )}
                      <button className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-xl" onClick={() => setDeleteTarget({ id: o._id, name: o.customerName })}>
                        Delete
                      </button>
                      {o.receiptToken && (
                        <a
                          href={`/receipt/${o.receiptToken}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-xl"
                        >
                          🧾 View Receipt
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
