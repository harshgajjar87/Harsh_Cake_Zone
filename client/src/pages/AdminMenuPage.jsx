import { useState, useRef } from 'react';
import axios from 'axios';

const DEFAULT_MENU = [
  {
    category: 'Birthday Cakes', emoji: '🎂',
    items: [
      { name: 'Chocolate Truffle', desc: 'Rich dark chocolate ganache layers', price: '₹650 / kg', image: '' },
      { name: 'Vanilla Fantasy', desc: 'Classic vanilla sponge with fresh cream', price: '₹550 / kg', image: '' },
      { name: 'Strawberry Delight', desc: 'Fresh strawberries with whipped cream', price: '₹700 / kg', image: '' },
      { name: 'Red Velvet', desc: 'Signature red velvet with cream cheese frosting', price: '₹750 / kg', image: '' },
    ],
  },
  {
    category: 'Wedding Cakes', emoji: '💍',
    items: [
      { name: 'Classic White Fondant', desc: 'Elegant 3-tier white fondant cake', price: 'Custom Quote', image: '' },
      { name: 'Floral Dream', desc: 'Edible floral decorations, pastel tones', price: 'Custom Quote', image: '' },
      { name: 'Gold Leaf Luxury', desc: 'Premium gold leaf finish, multi-tier', price: 'Custom Quote', image: '' },
    ],
  },
  {
    category: 'Cupcakes', emoji: '🧁',
    items: [
      { name: 'Classic Cupcakes', desc: 'Assorted flavours with buttercream swirls', price: '₹80 / piece', image: '' },
      { name: 'Mini Cupcakes', desc: 'Bite-sized, perfect for events', price: '₹50 / piece', image: '' },
      { name: 'Premium Cupcakes', desc: 'Loaded with fillings and toppings', price: '₹120 / piece', image: '' },
    ],
  },
  {
    category: 'Photo Cakes', emoji: '📸',
    items: [
      { name: 'Edible Photo Print', desc: 'Your photo printed on edible paper', price: '₹100 extra', image: '' },
      { name: 'Custom Character', desc: 'Hand-crafted fondant characters on top', price: '₹200 extra', image: '' },
    ],
  },
  {
    category: 'Jar Cakes', emoji: '🫙',
    items: [
      { name: 'Chocolate Jar Cake', desc: 'Layered chocolate cake in a jar', price: '₹150 / jar', image: '' },
      { name: 'Biscoff Lotus', desc: 'Biscoff cream with cookie layers', price: '₹180 / jar', image: '' },
      { name: 'Oreo Dream', desc: 'Oreo cream and chocolate layers', price: '₹150 / jar', image: '' },
    ],
  },
];

const STORAGE_KEY = 'hcz_menu';

function loadMenu() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_MENU;
  } catch { return DEFAULT_MENU; }
}

function saveMenu(menu) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(menu));
}

const BLANK_ITEM = { name: '', desc: '', price: '', image: '' };

export default function AdminMenuPage() {
  const [menu, setMenu] = useState(loadMenu);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  // item edit
  const [editKey, setEditKey] = useState(null);
  const [editValues, setEditValues] = useState({});
  const editFileRef = useRef(null);

  // add item
  const [addingTo, setAddingTo] = useState(null);
  const [newItem, setNewItem] = useState(BLANK_ITEM);
  const newFileRef = useRef(null);

  // add category
  const [addingCat, setAddingCat] = useState(false);
  const [newCat, setNewCat] = useState({ category: '', emoji: '' });

  const persist = (updated) => {
    setMenu(updated);
    saveMenu(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  /* ── Image upload to Cloudinary via server ── */
  const uploadImage = async (file) => {
    if (!file) return '';
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await axios.post('/api/menu/upload', fd);
      return data.success ? data.url : '';
    } catch { return ''; }
    finally { setUploading(false); }
  };

  /* ── Edit item ── */
  const startEdit = (catIdx, itemIdx) => {
    const item = menu[catIdx].items[itemIdx];
    setEditKey(`${catIdx}-${itemIdx}`);
    setEditValues({ name: item.name, desc: item.desc, price: item.price, image: item.image || '' });
  };

  const saveEdit = async (catIdx, itemIdx) => {
    let image = editValues.image;
    if (editFileRef.current?.files[0]) {
      image = await uploadImage(editFileRef.current.files[0]);
    }
    const updated = menu.map((cat, ci) =>
      ci !== catIdx ? cat : {
        ...cat,
        items: cat.items.map((item, ii) =>
          ii !== itemIdx ? item : { ...editValues, image }
        ),
      }
    );
    persist(updated);
    setEditKey(null);
    if (editFileRef.current) editFileRef.current.value = '';
  };

  /* ── Delete item ── */
  const deleteItem = (catIdx, itemIdx) => {
    const updated = menu.map((cat, ci) =>
      ci !== catIdx ? cat : { ...cat, items: cat.items.filter((_, ii) => ii !== itemIdx) }
    );
    persist(updated);
  };

  /* ── Add item ── */
  const addItem = async (catIdx) => {
    if (!newItem.name.trim()) return;
    let image = '';
    if (newFileRef.current?.files[0]) {
      image = await uploadImage(newFileRef.current.files[0]);
    }
    const updated = menu.map((cat, ci) =>
      ci !== catIdx ? cat : { ...cat, items: [...cat.items, { ...newItem, image }] }
    );
    persist(updated);
    setNewItem(BLANK_ITEM);
    setAddingTo(null);
    if (newFileRef.current) newFileRef.current.value = '';
  };

  /* ── Add category ── */
  const addCategory = () => {
    if (!newCat.category.trim()) return;
    persist([...menu, { category: newCat.category, emoji: newCat.emoji || '🎂', items: [] }]);
    setNewCat({ category: '', emoji: '' });
    setAddingCat(false);
  };

  /* ── Delete category ── */
  const deleteCategory = (catIdx) => {
    persist(menu.filter((_, ci) => ci !== catIdx));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage categories, items, prices and photos shown on the public menu.</p>
        </div>
        <div className="flex items-center gap-2">
          {uploading && <span className="text-xs text-blue-500 font-semibold animate-pulse">⬆ Uploading...</span>}
          {saved && <span className="text-xs text-green-600 font-semibold">✅ Saved</span>}
          <button onClick={() => persist(DEFAULT_MENU)} className="btn-secondary text-xs">↺ Reset</button>
        </div>
      </div>

      {/* Categories */}
      {menu.map((cat, catIdx) => (
        <div key={cat.category} className="card border border-orange-50">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-2xl">{cat.emoji}</span>
            <h2 className="text-lg font-bold text-orange-800">{cat.category}</h2>
            <span className="text-xs text-gray-400">{cat.items.length} items</span>
            <button
              onClick={() => { if (window.confirm(`Delete category "${cat.category}"?`)) deleteCategory(catIdx); }}
              className="ml-auto bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
            >
              🗑 Delete Category
            </button>
          </div>

          <div className="space-y-2">
            {cat.items.map((item, itemIdx) => {
              const key = `${catIdx}-${itemIdx}`;
              return (
                <div key={key} className="bg-orange-50/50 rounded-xl p-3">
                  {editKey === key ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input className="input" placeholder="Name *" value={editValues.name}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} />
                      <input className="input" placeholder="Price (e.g. ₹650 / kg)" value={editValues.price}
                        onChange={(e) => setEditValues({ ...editValues, price: e.target.value })} />
                      <input className="input sm:col-span-2" placeholder="Description" value={editValues.desc}
                        onChange={(e) => setEditValues({ ...editValues, desc: e.target.value })} />
                      <div className="sm:col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">Photo</label>
                        <div className="flex items-center gap-3">
                          {editValues.image && (
                            <img src={editValues.image} alt="item" className="w-14 h-14 rounded-xl object-cover border border-orange-100" />
                          )}
                          <input ref={editFileRef} type="file" accept="image/*" className="input flex-1" />
                        </div>
                      </div>
                      <div className="sm:col-span-2 flex gap-2 justify-end">
                        <button className="btn-secondary text-xs" onClick={() => setEditKey(null)}>Cancel</button>
                        <button className="btn-primary text-xs" onClick={() => saveEdit(catIdx, itemIdx)} disabled={uploading}>
                          {uploading ? 'Uploading...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-orange-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-xl flex-shrink-0">🎂</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-orange-700 font-bold text-xs bg-orange-100 px-2 py-1 rounded-lg">{item.price}</span>
                          <button onClick={() => startEdit(catIdx, itemIdx)}
                            className="bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all">
                            ✏️ Edit
                          </button>
                          <button onClick={() => deleteItem(catIdx, itemIdx)}
                            className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add item to category */}
          {addingTo === catIdx ? (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-orange-100 pt-3">
              <input className="input" placeholder="Name *" value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
              <input className="input" placeholder="Price (e.g. ₹650 / kg)" value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
              <input className="input sm:col-span-2" placeholder="Description" value={newItem.desc}
                onChange={(e) => setNewItem({ ...newItem, desc: e.target.value })} />
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Photo (optional)</label>
                <input ref={newFileRef} type="file" accept="image/*" className="input" />
              </div>
              <div className="sm:col-span-2 flex gap-2 justify-end">
                <button className="btn-secondary text-xs" onClick={() => { setAddingTo(null); setNewItem(BLANK_ITEM); }}>Cancel</button>
                <button className="btn-primary text-xs" onClick={() => addItem(catIdx)} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Add Item'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setAddingTo(catIdx); setNewItem(BLANK_ITEM); }}
              className="mt-3 w-full text-xs text-orange-600 hover:text-orange-700 border border-dashed border-orange-200 hover:border-orange-400 rounded-xl py-2 transition-all"
            >
              + Add Item
            </button>
          )}
        </div>
      ))}

      {/* Add new category */}
      {addingCat ? (
        <div className="card border border-orange-100">
          <h3 className="font-semibold text-orange-800 mb-3">New Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input" placeholder="Category name *" value={newCat.category}
              onChange={(e) => setNewCat({ ...newCat, category: e.target.value })} />
            <input className="input" placeholder="Emoji (e.g. 🎂)" value={newCat.emoji}
              onChange={(e) => setNewCat({ ...newCat, emoji: e.target.value })} />
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button className="btn-secondary text-xs" onClick={() => setAddingCat(false)}>Cancel</button>
              <button className="btn-primary text-xs" onClick={addCategory}>Add Category</button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingCat(true)}
          className="w-full text-sm text-orange-600 hover:text-orange-700 border-2 border-dashed border-orange-200 hover:border-orange-400 rounded-2xl py-3 font-semibold transition-all"
        >
          + Add New Category
        </button>
      )}
    </div>
  );
}
