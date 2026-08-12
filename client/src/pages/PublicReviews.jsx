import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../image/image.png';

export default function PublicReviews() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    axios.get('/api/feedback').then(({ data }) => {
      if (data.success) { setFeedbacks(data.data); setAvgRating(data.avgRating); }
    }).finally(() => setLoading(false));
  }, []);

  const dist = [5,4,3,2,1].map((s) => ({ star: s, count: feedbacks.filter((f) => f.rating === s).length }));

  return (
    <div className="min-h-screen bg-[#f5f3ff] font-sans">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur border-b border-orange-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-bold text-orange-700">Harsh Cake Zone</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-600">
            <Link to="/" className="px-3 py-1.5 hover:text-orange-700 transition-colors">Home</Link>
            <Link to="/#about" className="px-3 py-1.5 hover:text-orange-700 transition-colors">About</Link>
            <Link to="/menu" className="px-3 py-1.5 hover:text-orange-700 transition-colors">Menu</Link>
            <Link to="/gallery" className="px-3 py-1.5 hover:text-orange-700 transition-colors">Gallery</Link>
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
            {[
              ['/', 'Home'],
              ['/#about', 'About'],
              ['/menu', 'Menu'],
              ['/gallery', 'Gallery']
            ].map(([to, label]) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700">{label}</Link>
            ))}
          </div>
        )}
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-orange-700 to-rose-600 text-white text-center py-8 px-4">
        <div className="text-3xl mb-2">⭐</div>
        <h1 className="text-2xl sm:text-4xl font-extrabold mb-1">Customer Reviews</h1>
        {avgRating > 0 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <span key={s} className={`text-lg ${s <= Math.round(avgRating) ? 'text-yellow-300' : 'text-white/30'}`}>★</span>
              ))}
            </div>
            <span className="text-xl font-bold text-yellow-300">{avgRating}</span>
            <span className="text-white/60 text-sm">/ 5 · {feedbacks.length} reviews</span>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {loading ? (
          <p className="text-center text-gray-400 py-16">Loading reviews...</p>
        ) : feedbacks.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No reviews yet. Be the first! 🎂</p>
        ) : (
          <>
            {/* Rating breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-50 mb-10">
              <h2 className="font-bold text-orange-800 mb-4">Rating Breakdown</h2>
              <div className="space-y-2">
                {dist.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500 w-3">{star}</span>
                    <span className="text-yellow-400 text-xs">★</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-yellow-400 h-2.5 rounded-full transition-all duration-700"
                        style={{ width: feedbacks.length ? `${(count / feedbacks.length) * 100}%` : '0%' }} />
                    </div>
                    <span className="text-gray-400 w-5 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {feedbacks.map((f) => (
                <div key={f._id} className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 flex flex-col gap-3 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-800">{f.customerName}</p>
                      {f.orderId?.cakeDetails && <p className="text-xs text-gray-400 mt-0.5">🎂 {f.orderId.cakeDetails}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <span key={s} className={`text-base ${s <= f.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  {f.comment && <p className="text-sm text-gray-600 bg-orange-50 rounded-xl px-3 py-2 italic">"{f.comment}"</p>}
                  {f.wouldRecommend && <p className="text-xs text-green-600 font-medium">👍 Would recommend</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="bg-orange-900 text-white/60 text-xs text-center py-5">
        © {new Date().getFullYear()} Harsh Cake Zone — Handcrafted with love 🎂
      </footer>
    </div>
  );
}

