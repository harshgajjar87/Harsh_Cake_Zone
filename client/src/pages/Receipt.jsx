import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../image/image.png';

export default function Receipt() {
  const { token } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/orders/${token}`)
      .then(({ data }) => { if (data.success) setOrder(data.data); else setError('Receipt not found'); })
      .catch(() => setError('Receipt not found'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading receipt...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (order && order.paymentStatus !== 'Paid') return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-gray-700">Receipt not available yet</h2>
      <p className="text-gray-400 mt-2">The receipt will be available once payment is confirmed.</p>
    </div>
  );

  const upiLink = `upi://pay?pa=${process.env.REACT_APP_UPI_ID || 'yourname@okaxis'}&pn=HarshCakes&am=${order.sellingPrice}&cu=INR`;

  return (
    <div className="max-w-md mx-auto">
      <div className="card border border-violet-100 print:shadow-none" id="receipt">
        <div className="text-center border-b border-dashed border-violet-100 pb-6 mb-6">
          <img src={logo} alt="Harsh Cake Zone" className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-violet-700">Harsh Cake Zone</h1>
          <p className="text-xs text-gray-400 mt-1">Digital Receipt</p>
        </div>

        <div className="space-y-3 text-sm">
          <Row label="Customer" value={order.customerName} />
          <Row label="Phone" value={order.phone} />
          <Row label="Order" value={order.cakeDetails} />
          <Row label="Order Date" value={new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
          <Row label="Status" value={<span className={order.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}>{order.paymentStatus}</span>} />
        </div>

        <div className="mt-6 bg-violet-50 rounded-2xl p-4 text-center border border-violet-100">
          <p className="text-xs text-violet-500 font-semibold uppercase tracking-wider">Total Amount</p>
          <p className="text-4xl font-bold text-violet-700 mt-1">₹{order.sellingPrice.toLocaleString('en-IN')}</p>
        </div>

        {order.paymentStatus === 'Pending' && (
          <a href={upiLink} className="mt-4 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-2xl transition-all">
            <span>💳</span> Pay ₹{order.sellingPrice} via UPI
          </a>
        )}

        {order.cakeImageURL && (
          <div className="mt-4">
            <img src={order.cakeImageURL} alt="Your cake" className="w-full rounded-2xl object-contain bg-gray-50" />
          </div>
        )}

        <div className="mt-6 text-center border-t border-dashed border-violet-100 pt-4">
          <p className="text-xs text-gray-400">Thank you for your order! 🙏</p>
          <Link to={`/feedback/${order._id}`} className="mt-3 inline-block text-sm text-violet-600 hover:underline font-medium">
            ⭐ Leave a Review
          </Link>
        </div>
      </div>

      <div className="mt-4 flex gap-3 print:hidden">
        <button onClick={() => { document.title = `Receipt - ${order.customerName}`; window.print(); }} className="btn-primary flex-1">
          ⬇️ Download / Print Receipt
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
