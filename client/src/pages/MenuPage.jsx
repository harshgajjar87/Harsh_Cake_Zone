import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../image/image.png';

const STORAGE_KEY = 'hcz_menu';

const DEFAULT_MENU = [
  {
    category: 'Birthday Cakes',
    emoji: '🎂',
    items: [
      { name: 'Chocolate Truffle', desc: 'Rich dark chocolate ganache layers', price: '₹650 / kg' },
      { name: 'Vanilla Fantasy', desc: 'Classic vanilla sponge with fresh cream', price: '₹550 / kg' },
      { name: 'Strawberry Delight', desc: 'Fresh strawberries with whipped cream', price: '₹700 / kg' },
      { name: 'Red Velvet', desc: 'Signature red velvet with cream cheese frosting', price: '₹750 / kg' },
    ],
  },
  {
    category: 'Wedding Cakes',
    emoji: '💍',
    items: [
      { name: 'Classic White Fondant', desc: 'Elegant 3-tier white fondant cake', price: 'Custom Quote' },
      { name: 'Floral Dream', desc: 'Edible floral decorations, pastel tones', price: 'Custom Quote' },
      { name: 'Gold Leaf Luxury', desc: 'Premium gold leaf finish, multi-tier', price: 'Custom Quote' },
    ],
  },
  {
    category: 'Cupcakes',
    emoji: '🧁',
    items: [
      { name: 'Classic Cupcakes', desc: 'Assorted flavours with buttercream swirls', price: '₹80 / piece' },
      { name: 'Mini Cupcakes', desc: 'Bite-sized, perfect for events', price: '₹50 / piece' },
      { name: 'Premium Cupcakes', desc: 'Loaded with fillings and toppings', price: '₹120 / piece' },
    ],
  },
  {
    category: 'Photo Cakes',
    emoji: '📸',
    items: [
      { name: 'Edible Photo Print', desc: 'Your photo printed on edible paper', price: '₹100 extra' },
      { name: 'Custom Character', desc: 'Hand-crafted fondant characters on top', price: '₹200 extra' },
    ],
  },
  {
    category: 'Jar Cakes',
    emoji: '🫙',
    items: [
      { name: 'Chocolate Jar Cake', desc: 'Layered chocolate cake in a jar', price: '₹150 / jar' },
      { name: 'Biscoff Lotus', desc: 'Biscoff cream with cookie layers', price: '₹180 / jar' },
      { name: 'Oreo Dream', desc: 'Oreo cream and chocolate layers', price: '₹150 / jar' },
    ],
  },
];

function loadMenu() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_MENU;
  } catch {
    return DEFAULT_MENU;
  }
}

export default function MenuPage() {
  const [active, setActive] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const MENU = loadMenu();

  return (
    <div className="min-h-screen bg-[#f5f3ff] font-sans">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur border-b border-orange-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-bold text-orange-700">Harsh Cake Zone</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600">
            <Link to="/" className="px-3 py-1.5 hover:text-orange-700 transition-colors">Home</Link>
            <Link to="/gallery" className="px-3 py-1.5 hover:text-orange-700 transition-colors">Gallery</Link>
            <Link to="/our-reviews" className="px-3 py-1.5 hover:text-orange-700 transition-colors">Reviews</Link>
            <a href="https://whatsapp.com/channel/0029Vb8TbE7LY6d6hMiCqR2k" target="_blank" rel="noreferrer"
              className="ml-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all text-xs font-semibold">
              💬 Order Now
            </a>
          </div>
          <button className="sm:hidden p-2 rounded-xl text-gray-500 hover:bg-orange-50" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="sm:hidden bg-white border-t border-orange-50 px-4 pb-3 space-y-1">
            {[['/', 'Home'], ['/gallery', 'Gallery'], ['/our-reviews', 'Reviews']].map(([to, label]) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700">{label}</Link>
            ))}
            <a href="https://whatsapp.com/channel/0029Vb8TbE7LY6d6hMiCqR2k" target="_blank" rel="noreferrer"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-green-600 hover:bg-green-50">
              💬 Order Now
            </a>
          </div>
        )}
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-orange-700 to-rose-600 text-white text-center py-16 px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">Our Menu</h1>
        <p className="text-white/80 max-w-lg mx-auto">Explore our range of handcrafted cakes and treats. All prices are per kg unless stated.</p>
      </div>

      {/* Category tabs */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur border-b border-orange-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-1 py-3 w-max mx-auto">
            <button
              onClick={() => setActive(null)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${active === null ? 'bg-orange-700 text-white shadow' : 'text-gray-600 hover:bg-orange-50'}`}
            >
              All
            </button>
            {MENU.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setActive(cat.category)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${active === cat.category ? 'bg-orange-700 text-white shadow' : 'text-gray-600 hover:bg-orange-50'}`}
              >
                {cat.emoji} {cat.category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-14">
        {MENU.filter((cat) => !active || cat.category === active).map((cat) => (
          <div key={cat.category}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{cat.emoji}</span>
              <h2 className="text-2xl font-bold text-orange-800">{cat.category}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cat.items.map((item) => (
                <div key={item.name} className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex gap-3 items-start p-4">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-orange-100" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center text-2xl flex-shrink-0">🎂</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                      <span className="text-orange-700 font-bold text-xs whitespace-nowrap bg-orange-50 px-2 py-1 rounded-lg flex-shrink-0">{item.price}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center pb-16 px-4">
        <p className="text-gray-500 mb-4">Want something custom? We love a challenge!</p>
        <a href="https://whatsapp.com/channel/0029Vb8TbE7LY6d6hMiCqR2k" target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg transition-all hover:-translate-y-0.5 text-base">
          💬 Chat with Us on WhatsApp
        </a>
      </div>

      {/* Footer */}
      <footer className="bg-orange-900 text-white/60 text-xs text-center py-5">
        © {new Date().getFullYear()} Harsh Cake Zone — Handcrafted with love 🎂
      </footer>
    </div>
  );
}

