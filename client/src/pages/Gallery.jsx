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

  const touchStart = useRef(null);
  const lastPinchDist = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef(null);

  const prev = useCallback(() => { setIdx((i) => (i - 1 + images.length) % images.length); setScale(1); setTranslate({ x: 0, y: 0 }); }, [images.length]);
  const next = useCallback(() => { setIdx((i) => (i + 1) % images.length); setScale(1); setTranslate({ x: 0, y: 0 }); }, [images.length]);

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
      <div className="flex items-center justify-between px-4 py-3 text-white/70 text-sm flex-shrink-0">
        <span>{img.name}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs">{idx + 1} / {images.length}</span>
          <button onClick={() => setScale((s) => Math.max(s - 0.5, 1))} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-lg font-bold transition-all">−</button>
          <span className="text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((s) => Math.min(s + 0.5, 5))} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-lg font-bold transition-all">+</button>
          {scale > 1 && <button onClick={resetZoom} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all">Reset</button>}
          <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-xl transition-all">×</button>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center overflow-hidden relative select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <button onClick={prev} className="absolute left-3 z-10 w-10 h-10 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center text-xl transition-all backdrop-blur">‹</button>
        <img
          src={img.url}
          alt={img.name}
          className="max-h-full max-w-full object-contain transition-transform duration-200 rounded-xl"
          style={{ transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`, cursor: scale > 1 ? 'grab' : 'default' }}
          draggable={false}
        />
        <button onClick={next} className="absolute right-3 z-10 w-10 h-10 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center text-xl transition-all backdrop-blur">›</button>
      </div>

      <div className="flex-shrink-0 flex gap-2 px-4 py-3 overflow-x-auto">
        {images.map((im, i) => (
          <button key={i} onClick={() => { setIdx(i); resetZoom(); }}
            className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === idx ? 'border-orange-400 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}>
            <img src={im.url} alt={im.name} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <p className="text-center text-white/30 text-xs pb-3 md:hidden">← Swipe to navigate · Pinch to zoom →</p>
    </div>
  );
}

/* ── Upload Modal ── */
function UploadModal({ onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cakes');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select an image.'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('name', name);
      fd.append('category', category);
      const { data } = await axios.post('/api/gallery', fd);
      if (data.success) {
        onUploaded(data.data);
        onClose();
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Add Gallery Image</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => fileRef.current.click()}
            className="border-2 border-dashed border-orange-200 rounded-xl p-4 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all"
          >
            {preview ? (
              <img src={preview} alt="preview" className="mx-auto max-h-48 rounded-lg object-contain" />
            ) : (
              <div className="py-6 text-gray-400">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm">Click to select image</p>
                <p className="text-xs mt-1 text-gray-300">JPG, PNG, WEBP — max 5MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Label / Caption (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chocolate Truffle Cake"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {uploading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Uploading…</> : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Gallery ── */
export default function Gallery({ isAdmin = false }) {
  const [allImages, setAllImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, galleryRes] = await Promise.all([
        axios.get('/api/orders/images'),
        axios.get('/api/gallery'),
      ]);

      const orderImgs = ordersRes.data.success
        ? ordersRes.data.data.map((o) => ({
            url: o.cakeImageURL,
            name: o.cakeDetails,
            category: o.category || 'Cakes',
            _id: null, // order images can't be deleted from gallery
          }))
        : [];

      const galleryImgs = galleryRes.data.success
        ? galleryRes.data.data.map((g) => ({
            url: g.url,
            name: g.name,
            category: g.category || 'Cakes',
            _id: g._id,
          }))
        : [];

      setAllImages([...galleryImgs, ...orderImgs]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleUploaded = (newImg) => {
    setAllImages((prev) => [
      { url: newImg.url, name: newImg.name, category: newImg.category, _id: newImg._id },
      ...prev,
    ]);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this image from the gallery?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/gallery/${id}`);
      setAllImages((prev) => prev.filter((img) => img._id !== id));
    } catch {
      alert('Failed to delete image.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = activeCategory === 'All' ? allImages : allImages.filter((i) => i.category === activeCategory);
  const openLightbox = (index) => setLightbox({ images: filtered, index });

  return (
    <div className="min-h-screen bg-[#f5f3ff] font-sans">
      {/* Public navbar */}
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

      {/* Public header */}
      {!isAdmin && (
        <div className="bg-gradient-to-br from-orange-700 to-rose-600 text-white text-center py-14 px-4">
          <img src={logo} alt="Harsh Cake Zone" className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-4 border-white/30" />
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-2">Our Cake Gallery</h1>
          <p className="text-white/80">Every photo is a cake made with love 🎂</p>
        </div>
      )}

      {/* Admin header */}
      {isAdmin && (
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cake Gallery</h1>
            <p className="text-sm text-gray-400 mt-0.5">All cake photos from orders and manual uploads.</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <span className="text-lg leading-none">+</span> Add Image
          </button>
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
          <div className="text-center py-16">
            <p className="text-gray-400">
              {activeCategory === 'All' ? 'No cakes yet. Check back soon! 🎂' : `No ${activeCategory} photos yet.`}
            </p>
            {isAdmin && (
              <button onClick={() => setShowUpload(true)} className="mt-4 text-orange-600 text-sm font-semibold hover:underline">
                + Upload the first image
              </button>
            )}
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {filtered.map((img, i) => (
              <div key={img._id || i}
                className="break-inside-avoid cursor-pointer rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group relative"
                onClick={() => openLightbox(i)}>
                <img src={img.url} alt={img.name} className="w-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-all text-white text-2xl">🔍</span>
                </div>
                {/* Delete button — only for manually uploaded images */}
                {isAdmin && img._id && (
                  <button
                    onClick={(e) => handleDelete(img._id, e)}
                    disabled={deletingId === img._id}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-lg disabled:opacity-50"
                    title="Delete image"
                  >
                    {deletingId === img._id ? '…' : '×'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox && <Lightbox images={lightbox.images} startIndex={lightbox.index} onClose={() => setLightbox(null)} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />}

      {!isAdmin && (
        <footer className="bg-orange-900 text-white/60 text-xs text-center py-5">
          © {new Date().getFullYear()} Harsh Cake Zone — Handcrafted with love 🎂
        </footer>
      )}
    </div>
  );
}
