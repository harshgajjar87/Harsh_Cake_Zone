import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import logo from '../image/image.png';

const CATEGORIES = ['All', 'Cakes', 'Cupcakes', 'Chocolates', 'Brownies', 'Other'];

/* ── Lightbox with swipe + pinch-zoom ── */
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // touch state
  const touchStart = useRef(null);
  const lastPinchDist = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef(null);

  const prev = useCallback(() => { setIdx((i) => (i - 1 + images.length) % images.length); setScale(1); setTranslate({ x: 0, y: 0 }); }, [images.length]);
  const next = useCallback(() => { setIdx((i) => (i + 1) % images.length); setScale(1); setTranslate({ x: 0, y: 0 }); }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
      if (e.key === '+') setScale((s) => Math.min(s + 0.5, 5));
      if (e.key === '-') setScale((s) => Math.max(s - 0.5, 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next, onClose]);

  // Touch handlers
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
      if (scale > 1) { isDragging.current = true; dragStart.current = { x: e.touches[0].clientX - translate.x, y: e.touches[0].clientY - translate.y }; }
    } else if (e.touches.length === 2) {
      lastPinchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  };

  const onTouchMove = (e) => {
    if (e.touches.length === 2 && lastPinchDist.current) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const delta = dist / lastPinchDist.current;
      setScale((s) => Math.min(Math.max(s * delta, 1), 5));
      lastPinchDist.current = dist;
    } else if (e.touches.length === 1 && isDragging.current && scale > 1) {
      setTranslate({ x: e.touches[0].clientX - dragStart.current.x, y: e.touches[0].clientY - dragStart.current.y });
    }
  };

  const onTouchEnd = (e) => {
    lastPinchDist.current = null;
    isDragging.current = false;
    if (!touchStart.current || scale > 1) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dt = Date.now() - touchStart.current.time;
    if (Math.abs(dx) > 50 && dt < 400) { dx < 0 ? next() : prev(); }
    touchStart.current = null;
  };

  const resetZoom = () => { setScale(1); setTranslate({ x: 0, y: 0 }); };

  const img = images[idx];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 text-white/70 text-sm flex-shrink-0">
        <span>{img.name}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs">{idx + 1} / {images.length}</span>
          {/* Zoom controls */}
          <button onClick={() => setScale((s) => Math.max(s - 0.5, 1))} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-lg font-bold transition-all">−</button>
          <span className="text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((s) => Math.min(s + 0.5, 5))} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-lg font-bold transition-all">+</button>
          {scale > 1 && <button onClick={resetZoom} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all">Reset</button>}
          <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-xl transition-all">×</button>
        </div>
      </div>

      {/* Image area */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden relative select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Prev button */}
        <button onClick={prev} className="absolute left-3 z-10 w-10 h-10 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center text-xl transition-all backdrop-blur">‹</button>

        <img
          src={img.url}
          alt={img.name}
          className="max-h-full max-w-full object-contain transition-transform duration-200 rounded-xl"
          style={{ transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`, cursor: scale > 1 ? 'grab' : 'default' }}
          draggable={false}
        />

        {/* Next button */}
        <button onClick={next} className="absolute right-3 z-10 w-10 h-10 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center text-xl transition-all backdrop-blur">›</button>
      </div>

      {/* Thumbnail strip */}
      <div className="flex-shrink-0 flex gap-2 px-4 py-3 overflow-x-auto">
        {images.map((im, i) => (
          <button key={i} onClick={() => { setIdx(i); resetZoom(); }}
            className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === idx ? 'border-orange-400 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}>
            <img src={im.url} alt={im.name} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Swipe hint on mobile */}
      <p className="text-center text-white/30 text-xs pb-3 md:hidden">← Swipe to navigate · Pinch to zoom →</p>
    </div>
  );
}

/* ── Main Gallery ── */
export default function Gallery({ isAdmin = false }) {
  const [allImages, setAllImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox, setLightbox] = useState(null); // { images, index }

  useEffect(() => {
    axios.get('/api/orders/images')
      .then(({ data }) => {
        if (data.success) {
          const imgs = data.data.map((o) => ({
            url: o.cakeImageURL,
            name: o.cakeDetails,
            category: o.category || 'Cakes',
          }));
          setAllImages(imgs);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'All' ? allImages : allImages.filter((i) => i.category === activeCategory);

  const openLightbox = (index) => setLightbox({ images: filtered, index });

  return (
    <div className="min-h-screen bg-[#f5f3ff] font-sans">
      {/* Navbar — only show public navbar when not in admin */}
      {!isAdmin && (
        <nav className="bg-white/90 backdrop-blur border-b border-orange-100 sticky top-0 z-40 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
              <span className="font-bold text-orange-700">Harsh Cake Zone</span>
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Link to="/" className="px-3 py-1.5 hover:text-orange-700 transition-colors">Home</Link>
              <Link to="/menu" className="px-3 py-1.5 hover:text-orange-700 transition-colors">Menu</Link>
              <Link to="/our-reviews" className="px-3 py-1.5 hover:text-orange-700 transition-colors">Reviews</Link>
            </div>
          </div>
        </nav>
      )}

      {/* Header */}
      {!isAdmin && (
        <div className="bg-gradient-to-br from-orange-700 to-rose-600 text-white text-center py-14 px-4">
          <img src={logo} alt="Harsh Cake Zone" className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-4 border-white/30" />
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-2">Our Cake Gallery</h1>
          <p className="text-white/80">Every photo is a cake made with love 🎂</p>
        </div>
      )}
      {isAdmin && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Cake Gallery</h1>
          <p className="text-sm text-gray-400 mt-0.5">All cake photos from orders.</p>
        </div>
      )}

      {/* Category tabs */}
      <div className={`${isAdmin ? '' : 'sticky top-16 z-30'} bg-white/90 backdrop-blur border-b border-orange-100 shadow-sm`}>
        <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-1 py-3 w-max">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-orange-600 text-white shadow' : 'text-gray-600 hover:bg-orange-50'}`}>
                {cat}
                {cat !== 'All' && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({allImages.filter((i) => i.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-16">
            {activeCategory === 'All' ? 'No cakes yet. Check back soon! 🎂' : `No ${activeCategory} photos yet.`}
          </p>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {filtered.map((img, i) => (
              <div key={i}
                className="break-inside-avoid cursor-pointer rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group"
                onClick={() => openLightbox(i)}>
                <div className="relative">
                  <img src={img.url} alt={img.name} className="w-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-all text-white text-2xl">🔍</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && <Lightbox images={lightbox.images} startIndex={lightbox.index} onClose={() => setLightbox(null)} />}

      {!isAdmin && (
        <footer className="bg-orange-900 text-white/60 text-xs text-center py-5">
          © {new Date().getFullYear()} Harsh Cake Zone — Handcrafted with love 🎂
        </footer>
      )}
    </div>
  );
}

