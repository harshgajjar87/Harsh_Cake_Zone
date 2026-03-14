import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { exportToExcel } from '../utils/exportUtils';

const CATEGORIES = ['Ingredients', 'Raw Materials', 'Packaging', 'Other'];
const CAT_COLORS = {
  Ingredients: 'bg-green-100 text-green-700',
  'Raw Materials': 'bg-purple-100 text-purple-700',
  Packaging: 'bg-blue-100 text-blue-700',
  Other: 'bg-gray-100 text-gray-700',
};

export default function Expenses() {
  const { showToast } = useApp();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('');
  const [form, setForm] = useState({ materialName: '', amountSpent: '', category: 'Ingredients', date: '', notes: '' });
  const [billImage, setBillImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // holds expense being edited
  const [editForm, setEditForm] = useState({});

  const load = async () => {
    const [e, s] = await Promise.all([
      axios.get('/api/expenses' + (filterCat ? `?category=${filterCat}` : '')),
      axios.get('/api/expenses/summary'),
    ]);
    if (e.data.success) setExpenses(e.data.data);
    if (s.data.success) setSummary(s.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterCat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (billImage) fd.append('billImage', billImage);
      await axios.post('/api/expenses', fd);
      showToast('Expense logged!');
      setForm({ materialName: '', amountSpent: '', category: 'Ingredients', date: '', notes: '' });
      setBillImage(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (exp) => {
    setEditTarget(exp._id);
    setEditForm({
      materialName: exp.materialName,
      amountSpent: exp.amountSpent,
      category: exp.category,
      date: new Date(exp.date).toLocaleDateString('en-CA'),
      notes: exp.notes || '',
    });
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    try {
      await axios.patch(`/api/expenses/${id}`, editForm);
      showToast('Expense updated!');
      setEditTarget(null);
      load();
    } catch {
      showToast('Update failed', 'error');
    }
  };

  const deleteExpense = async (id) => {
    await axios.delete(`/api/expenses/${id}`);
    showToast('Deleted');
    load();
  };

  const totalExpenses = expenses.reduce((s, e) => s + e.amountSpent, 0);

  const exportExpenses = () => {
    const cols = [
      { header: 'Item', key: 'materialName' },
      { header: 'Category', key: 'category' },
      { header: 'Amount (₹)', key: 'amountSpent' },
      { header: 'Date', key: 'dateFmt' },
      { header: 'Notes', key: 'notes' },
    ];
    const rows = expenses.map((e) => ({ ...e, dateFmt: new Date(e.date).toLocaleDateString('en-IN') }));
    const label = filterCat ? filterCat.replace(/\s/g, '_') : 'All';
    exportToExcel(rows, cols, 'Expenses', `Expenses_${label}`);
  };
  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Expenses</h1>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => {
          const found = summary.find((s) => s._id === cat);
          return (
            <button key={cat} onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
              className={`card text-left transition-all border-2 ${filterCat === cat ? 'border-orange-400' : 'border-transparent'}`}>
              <p className="text-xs text-gray-500">{cat}</p>
              <p className="font-bold text-lg">₹{(found?.total || 0).toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-400">{found?.count || 0} entries</p>
            </button>
          );
        })}
      </div>

      {/* Add Expense Form */}
      <div className="card">
        <h2 className="font-semibold mb-4 text-orange-600">Add Expense</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="input" placeholder="Material / Item Name *" required value={form.materialName} onChange={(e) => setForm({ ...form, materialName: e.target.value })} />
          <input className="input" type="number" placeholder="Amount Spent (₹) *" required value={form.amountSpent} onChange={(e) => setForm({ ...form, amountSpent: e.target.value })} />
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input className="input sm:col-span-2" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="sm:col-span-2 border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer hover:border-orange-300 transition-all"
            onClick={() => document.getElementById('billInput').click()}>
            <input id="billInput" type="file" accept="image/*" className="hidden" onChange={(e) => setBillImage(e.target.files[0])} />
            {billImage
              ? <p className="text-green-600 text-sm font-medium">✅ {billImage.name}</p>
              : <p className="text-gray-400 text-sm">📎 Attach bill photo (optional)</p>}
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Expense'}</button>
          </div>
        </form>
      </div>

      {/* Expense List */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-500">{expenses.length} entries {filterCat && `· ${filterCat}`}</p>
        <div className="flex items-center gap-3">
          <button className="btn-secondary text-xs" onClick={exportExpenses} disabled={expenses.length === 0}>
            ⬇ Export Excel
          </button>
          <p className="font-bold text-red-600">Total: ₹{totalExpenses.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="space-y-3">
        {expenses.length === 0 && <p className="text-center text-gray-400 py-12">No expenses logged yet.</p>}
        {expenses.map((exp) => (
          <div key={exp._id} className="card hover:shadow-md transition-shadow">
            {editTarget === exp._id ? (
              <form onSubmit={(e) => handleUpdate(e, exp._id)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className="input" required value={editForm.materialName} onChange={(e) => setEditForm({ ...editForm, materialName: e.target.value })} placeholder="Item name" />
                <input className="input" type="number" required value={editForm.amountSpent} onChange={(e) => setEditForm({ ...editForm, amountSpent: e.target.value })} placeholder="Amount (₹)" />
                <select className="input" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <input className="input" type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
                <input className="input sm:col-span-2" placeholder="Notes (optional)" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
                <div className="sm:col-span-2 flex gap-2 justify-end">
                  <button type="button" className="btn-secondary text-sm" onClick={() => setEditTarget(null)}>Cancel</button>
                  <button type="submit" className="btn-primary text-sm">Save</button>
                </div>
              </form>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {exp.billImageURL ? (
                    <a href={exp.billImageURL} target="_blank" rel="noreferrer" className="flex-shrink-0">
                      <img src={exp.billImageURL} alt="bill" className="w-12 h-12 rounded-xl object-cover border border-gray-100 hover:opacity-80 transition-opacity" />
                    </a>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">🧾</div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{exp.materialName}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CAT_COLORS[exp.category]}`}>{exp.category}</span>
                      <span className="text-xs text-gray-400">{new Date(exp.date).toLocaleDateString('en-IN')}</span>
                    </div>
                    {exp.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{exp.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="font-bold text-red-600">₹{exp.amountSpent.toLocaleString('en-IN')}</p>
                  <button className="text-gray-400 hover:text-orange-500 transition-colors" onClick={() => startEdit(exp)} aria-label="Edit">✏️</button>
                  <button className="text-gray-300 hover:text-red-400 transition-colors" onClick={() => deleteExpense(exp._id)} aria-label="Delete">✕</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
