import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';

const REWARD_MILESTONE = 5;

const REWARD_OPTIONS = ['Half kg Cake 🎂', 'Brownie Box 🍫', 'Chocolate Box 🍬'];

function rewardSuggestion(orders = []) {
  const total = orders.reduce((s, o) => s + (o.sellingPrice || 0), 0);
  if (total >= 3000) return REWARD_OPTIONS[0];
  if (total >= 1500) return REWARD_OPTIONS[1];
  return REWARD_OPTIONS[2];
}

export default function Referrals() {
  const { showToast } = useApp();
  const [referrers, setReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [editCommission, setEditCommission] = useState({}); // orderId -> value
  const [editingReward, setEditingReward] = useState(null);
  const [rewardNote, setRewardNote] = useState('');

  const load = async () => {
    const { data } = await axios.get('/api/referrers');
    if (data.success) setReferrers(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createReferrer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/referrers', form);
      showToast('Referrer added!');
      setForm({ name: '', phone: '', notes: '' });
      setShowForm(false);
      load();
    } catch { showToast('Failed', 'error'); }
    finally { setSubmitting(false); }
  };

  const deleteReferrer = async (id) => {
    if (!window.confirm('Delete this referrer?')) return;
    await axios.delete(`/api/referrers/${id}`);
    showToast('Deleted');
    load();
  };

  const saveCommission = async (orderId, referredBy) => {
    const val = editCommission[orderId];
    if (val === undefined || val === '') return;
    try {
      await axios.patch(`/api/referrers/order/${orderId}/commission`, { commission: val, referredBy });
      showToast('Commission updated!');
      setEditCommission((p) => { const n = { ...p }; delete n[orderId]; return n; });
      load();
    } catch { showToast('Failed', 'error'); }
  };

  const markReward = async (id) => {
    try {
      await axios.patch(`/api/referrers/${id}`, { rewardGiven: true, rewardNote });
      showToast('Reward marked as given!');
      setEditingReward(null);
      setRewardNote('');
      load();
    } catch { showToast('Failed', 'error'); }
  };

  const sendCommissionMsg = (r) => {
    const digits = r.phone.replace(/\D/g, '');
    const phone = digits.startsWith('91') ? digits : `91${digits}`;
    const remaining = Math.max(0, REWARD_MILESTONE - r.totalReferrals);
    const reward = rewardSuggestion(r.orders || []);
    const msg =
      `Hi *${r.name}* 👋\n\n` +
      `🎉 Here's your referral update from *Harsh Cake Zone!*\n\n` +
      `📦 Total Orders Referred: *${r.totalReferrals}*\n` +
      `💰 Commission Earned: *₹${r.totalCommission}*\n\n` +
      (remaining > 0
        ? `✨ Just *${remaining} more referral${remaining > 1 ? 's' : ''}* to go and you'll get a *${reward}* for FREE! 🎁\n\n`
        : `🏆 You've hit *${REWARD_MILESTONE} referrals!* Your reward: *${reward}* 🎁\n\n`) +
      `Thank you for spreading the love! 🙏\n— Harsh Cake Zone`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Referral Commissions</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track who's referring orders and manage their commission & rewards.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Referrer'}
        </button>
      </div>

      {/* Commission rate guide */}
      <div className="card border border-orange-100">
        <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-3">Default Commission Rates</p>
        <div className="flex flex-wrap gap-2">
          {[['500gm','₹30'],['1kg','₹100'],['1.5kg','₹150'],['2kg','₹200'],['3kg','₹350'],['4kg','₹500'],['5kg','₹650']].map(([w, c]) => (
            <span key={w} className="bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full border border-orange-100">
              {w} → {c}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">You can override any commission manually per order below.</p>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card border border-orange-100">
          <h2 className="font-semibold text-orange-700 mb-4">New Referrer</h2>
          <form onSubmit={createReferrer} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="input" placeholder="Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" placeholder="Phone *" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input sm:col-span-2" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Add Referrer'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Referrer cards */}
      {referrers.length === 0 && !showForm && (
        <p className="text-center text-gray-400 py-16">No referrers yet. Add your first one!</p>
      )}

      <div className="space-y-4">
        {referrers.map((r) => {
          const progress = Math.min(r.totalReferrals, REWARD_MILESTONE);
          const pct = (progress / REWARD_MILESTONE) * 100;
          const reward = rewardSuggestion(r.orders || []);
          const rewardReady = r.totalReferrals >= REWARD_MILESTONE && !r.rewardGiven;

          return (
            <div key={r._id} className={`card border ${rewardReady ? 'border-yellow-300 bg-yellow-50/30' : 'border-orange-50'}`}>
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-lg flex-shrink-0">
                    {r.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold">{r.name}</h3>
                      {rewardReady && <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">🎁 Reward Ready!</span>}
                      {r.rewardGiven && <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">✅ Reward Given</span>}
                    </div>
                    <p className="text-xs text-gray-400">📞 {r.phone}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-700">₹{r.totalCommission}</p>
                    <p className="text-xs text-gray-400">commission</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-700">{r.totalReferrals}</p>
                    <p className="text-xs text-gray-400">referrals</p>
                  </div>
                  <button className="bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-xl" onClick={() => sendCommissionMsg(r)}>
                    📲 Send Update
                  </button>
                  {rewardReady && !r.rewardGiven && (
                    <button className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-xl" onClick={() => { setEditingReward(r._id); setRewardNote(`${reward} given`); }}>
                      🎁 Mark Reward Given
                    </button>
                  )}
                  <button className="bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-xl" onClick={() => setExpanded(expanded === r._id ? null : r._id)}>
                    {expanded === r._id ? '▲ Hide' : '▼ Orders'}
                  </button>
                  <button className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-xl" onClick={() => deleteReferrer(r._id)}>
                    Delete
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Referral Progress</span>
                  <span>{progress} / {REWARD_MILESTONE} → <span className="text-orange-600 font-semibold">{reward}</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Reward given note */}
              {r.rewardGiven && r.rewardNote && (
                <p className="text-xs text-green-600 mt-2">🎁 {r.rewardNote}</p>
              )}

              {/* Reward confirmation input */}
              {editingReward === r._id && (
                <div className="mt-3 flex gap-2">
                  <input className="input flex-1 text-sm" placeholder="e.g. Half kg cake given on 12/6/26" value={rewardNote} onChange={(e) => setRewardNote(e.target.value)} />
                  <button className="btn-primary text-sm" onClick={() => markReward(r._id)}>Save</button>
                  <button className="btn-secondary text-sm" onClick={() => setEditingReward(null)}>Cancel</button>
                </div>
              )}

              {/* Order breakdown */}
              {expanded === r._id && (
                <div className="mt-4 border-t border-orange-50 pt-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Referred Orders</p>
                  {(r.orders || []).length === 0 ? (
                    <p className="text-sm text-gray-400">No orders linked yet.</p>
                  ) : (
                    r.orders.map((o) => (
                      <div key={o._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-orange-50/50 rounded-xl px-4 py-3">
                        <div>
                          <p className="font-medium text-sm">{o.customerName}</p>
                          <p className="text-xs text-gray-400">{o.cakeDetails}{o.weight ? ` · ${o.weight}` : ''} · ₹{o.sellingPrice}</p>
                          <p className="text-xs text-gray-400">{new Date(o.orderDate).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Commission:</span>
                          {editCommission[o._id] !== undefined ? (
                            <>
                              <input
                                type="number"
                                className="input w-24 text-sm py-1"
                                value={editCommission[o._id]}
                                onChange={(e) => setEditCommission((p) => ({ ...p, [o._id]: e.target.value }))}
                              />
                              <button className="btn-primary text-xs py-1 px-3" onClick={() => saveCommission(o._id, r._id)}>Save</button>
                              <button className="btn-secondary text-xs py-1 px-3" onClick={() => setEditCommission((p) => { const n = { ...p }; delete n[o._id]; return n; })}>✕</button>
                            </>
                          ) : (
                            <>
                              <span className="font-bold text-orange-700 text-sm">₹{o.commission || 0}</span>
                              <button className="text-xs text-gray-400 hover:text-orange-600" onClick={() => setEditCommission((p) => ({ ...p, [o._id]: o.commission || 0 }))}>✏️ Edit</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

