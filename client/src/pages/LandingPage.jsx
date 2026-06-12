import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../image/image.png';

/* ── Intersection observer hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function AnimatedSection({ children, className = '', delay = 0 }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ── Social SVG icons ── */
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

/* ── Rotating background decorations ── */
function FloatingDecor() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Large slow-spinning circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border-2 border-orange-200/30 animate-[spin_25s_linear_infinite]" />
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full border border-orange-300/20 animate-[spin_18s_linear_infinite_reverse]" />
      <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full border-2 border-rose-200/20 animate-[spin_30s_linear_infinite]" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full border border-orange-200/25 animate-[spin_22s_linear_infinite_reverse]" />

      {/* Floating emoji elements */}
      {[
        { emoji: '🎂', top: '15%', left: '5%', size: 'text-4xl', dur: '6s', delay: '0s' },
        { emoji: '🍰', top: '70%', left: '3%', size: 'text-3xl', dur: '8s', delay: '1s' },
        { emoji: '🧁', top: '40%', left: '8%', size: 'text-2xl', dur: '7s', delay: '2s' },
        { emoji: '✨', top: '25%', left: '15%', size: 'text-xl', dur: '5s', delay: '0.5s' },
        { emoji: '🌸', top: '80%', left: '12%', size: 'text-2xl', dur: '9s', delay: '3s' },
        { emoji: '⭐', top: '10%', left: '22%', size: 'text-lg', dur: '6s', delay: '1.5s' },
      ].map((d, i) => (
        <div key={i}
          className={`absolute ${d.size} opacity-20`}
          style={{
            top: d.top, left: d.left,
            animation: `float ${d.dur} ease-in-out infinite`,
            animationDelay: d.delay,
          }}
        >
          {d.emoji}
        </div>
      ))}

      {/* Gradient blobs */}
      <div className="absolute top-10 left-0 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-rose-200/20 rounded-full blur-2xl animate-[pulse_6s_ease-in-out_infinite_1s]" />
    </div>
  );
}

export default function LandingPage() {
  const [images, setImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    axios.get('/api/orders').then(({ data }) => {
      if (data.success) {
        const imgs = data.data.filter((o) => o.cakeImageURL).map((o) => o.cakeImageURL);
        setImages(imgs.slice(0, 6));
      }
    }).catch(() => {});
    axios.get('/api/feedback').then(({ data }) => {
      if (data.success) { setReviews(data.data.slice(0, 6)); setAvgRating(data.avgRating); }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % images.length), 3800);
    return () => clearInterval(t);
  }, [images]);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">

      {/* ── Keyframes injected via style tag ── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-14px) rotate(5deg); }
          66% { transform: translateY(-7px) rotate(-4deg); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-orange-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-9 h-9 rounded-full object-cover ring-2 ring-orange-200" />
            <span className="font-bold text-lg text-orange-700">Harsh Cake Zone</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {[['/', 'Home'], ['/menu', 'Menu'], ['/gallery', 'Gallery'], ['/our-reviews', 'Reviews']].map(([to, label]) => (
              <Link key={to} to={to} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-700 transition-all">{label}</Link>
            ))}
            {/* <Link to="/admin" className="ml-2 px-4 py-2 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-sm font-semibold transition-all">Admin</Link> */}
          </div>
          <button className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-orange-50" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-orange-50 px-4 pb-4 space-y-1">
            {[['/', 'Home'], ['/menu', 'Menu'], ['/gallery', 'Gallery'], ['/our-reviews', 'Reviews'], ['/admin', 'Admin Panel']].map(([to, label]) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700">{label}</Link>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO — Split layout ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16 bg-gradient-to-br from-[#f5f3ff] via-white to-rose-50">
        <FloatingDecor />

        <div className="relative z-10 max-w-6xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-16 lg:py-0 min-h-[calc(100vh-64px)]">

          {/* ── Left: Content ── */}
          <div style={{ animation: 'fadeUp 0.8s ease forwards' }}>
            {/* Logo badge */}
            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="Harsh Cake Zone" className="w-16 h-16 rounded-2xl object-cover shadow-lg ring-4 ring-orange-100" />
              <div>
                <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest">Harsh Cake Zone</p>
                <p className="text-sm text-gray-500">Handcrafted with love</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-orange-200">
              🎂 Custom Cakes • Fresh Daily • Made to Order
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-5">
              Every Cake<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-400">Tells a Story</span>
            </h1>

            <p className="text-gray-500 text-lg mb-8 max-w-md leading-relaxed">
              Handcrafted cakes made with love for birthdays, weddings & every sweet moment that deserves to be remembered.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link to="/menu" className="px-7 py-3.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-2xl text-sm shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all">
                🍰 View Our Menu
              </Link>
              <Link to="/gallery" className="px-7 py-3.5 bg-white text-orange-700 font-bold rounded-2xl text-sm shadow-sm border-2 border-orange-200 hover:border-orange-400 hover:-translate-y-0.5 transition-all">
                🖼️ See Gallery
              </Link>
              <a href="https://whatsapp.com/channel/0029Vb8TbE7LY6d6hMiCqR2k" target="_blank" rel="noreferrer"
                className="px-7 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl text-sm shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                <WhatsAppIcon /> Order Now
              </a>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-medium">Follow us:</span>
              <a href="https://whatsapp.com/channel/0029Vb8TbE7LY6d6hMiCqR2k" target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-sm">
                <WhatsAppIcon />
              </a>
              <a href="https://www.instagram.com/harsh_cake_zone/" target="_blank" rel="noreferrer"
                className="w-9 h-9 text-white rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                <InstagramIcon />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61572345472233" target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-sm">
                <FacebookIcon />
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-8 pt-8 border-t border-orange-100">
              {[['500+', 'Happy Customers'], ['5★', 'Rated Experience'], ['100%', 'Fresh Ingredients']].map(([val, label]) => (
                <div key={label}>
                  <p className="text-2xl font-extrabold text-orange-700">{val}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Photo slideshow ── */}
          <div className="relative flex items-center justify-center" style={{ animation: 'slideInRight 0.9s ease forwards' }}>
            {/* Decorative rings */}
            <div className="absolute w-80 h-80 rounded-full border-2 border-dashed border-orange-200 animate-[spin_20s_linear_infinite]" />
            <div className="absolute w-96 h-96 rounded-full border border-orange-100 animate-[spin_30s_linear_infinite_reverse]" />

            <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
              {images.length > 0 ? (
                <>
                  {images.map((src, i) => (
                    <div key={i} className={`absolute inset-0 rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 ${i === heroIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                      <img src={src} alt="cake" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {/* Dot indicators */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setHeroIdx(i)}
                        className={`h-1.5 rounded-full transition-all ${i === heroIdx ? 'bg-orange-600 w-5' : 'bg-orange-200 w-1.5'}`} />
                    ))}
                  </div>
                </>
              ) : (
                /* Placeholder when no images yet */
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center shadow-2xl">
                  <div className="text-center">
                    <div className="text-7xl mb-3">🎂</div>
                    <p className="text-orange-500 font-semibold text-sm">Your dream cake awaits</p>
                  </div>
                </div>
              )}

              {/* Floating tag on photo */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md rotate-6 animate-[float_4s_ease-in-out_infinite]">
                ✨ Fresh today!
              </div>
              <div className="absolute -bottom-3 -left-4 bg-white text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-md -rotate-3 border border-orange-100 animate-[float_5s_ease-in-out_infinite_1s]">
                🍰 Custom orders
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-orange-300 animate-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Social proof bar ── */}
      <div className="bg-orange-700 text-white py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 sm:gap-10 text-sm font-semibold">
          <a href="https://whatsapp.com/channel/0029Vb8TbE7LY6d6hMiCqR2k" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-yellow-300 transition-colors">
            <WhatsAppIcon /> WhatsApp us
          </a>
          <a href="https://www.instagram.com/harsh_cake_zone/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-yellow-300 transition-colors">
            <InstagramIcon /> Instagram
          </a>
          <a href="https://www.facebook.com/profile.php?id=61572345472233" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-yellow-300 transition-colors">
            <FacebookIcon /> Facebook
          </a>
        </div>
      </div>

      {/* ── Why Choose Us ── */}
      <section className="py-20 bg-[#f5f3ff]">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-orange-900 mb-3">Why Choose Us?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">We put heart into every layer, every swirl, every bite.</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🎨', title: 'Custom Designs', desc: 'Every cake is uniquely crafted to match your vision and theme.' },
              { icon: '🌿', title: 'Fresh Ingredients', desc: 'Only the finest quality ingredients, sourced fresh every day.' },
              { icon: '⏰', title: 'On-Time Delivery', desc: 'We take your special moments seriously — always on time.' },
              { icon: '💕', title: 'Made with Love', desc: 'Baked with passion and care in every single order.' },
            ].map((f, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-50 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="text-4xl mb-3">{f.icon}</div>
                  <h3 className="font-bold text-orange-800 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery Preview ── */}
      {images.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-orange-900 mb-3">Our Creations</h2>
              <p className="text-gray-500">A glimpse of the magic we bake.</p>
            </AnimatedSection>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((src, i) => (
                <AnimatedSection key={i} delay={i * 60}>
                  <Link to="/gallery">
                    <div className="aspect-square rounded-2xl overflow-hidden group cursor-pointer">
                      <img src={src} alt="cake" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
            <AnimatedSection className="text-center mt-8">
              <Link to="/gallery" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-700 hover:bg-orange-800 text-white font-semibold rounded-2xl transition-all hover:-translate-y-0.5 shadow-md">
                View Full Gallery →
              </Link>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ── Reviews ── */}
      {reviews.length > 0 && (
        <section className="py-20 bg-[#f5f3ff]">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-orange-900 mb-2">What Customers Say</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => <span key={s} className={`text-xl ${s <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}
                </div>
                <span className="text-orange-700 font-bold text-lg">{avgRating}</span>
                <span className="text-gray-400 text-sm">/ 5</span>
              </div>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((r, i) => (
                <AnimatedSection key={r._id} delay={i * 80}>
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 flex flex-col gap-3 hover:shadow-md transition-all">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => <span key={s} className={`text-base ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 italic">"{r.comment}"</p>}
                    <p className="text-sm font-semibold text-orange-700">{r.customerName}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
            <AnimatedSection className="text-center mt-8">
              <Link to="/our-reviews" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-orange-700 text-orange-700 hover:bg-orange-700 hover:text-white font-semibold rounded-2xl transition-all">
                Read All Reviews →
              </Link>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-24 bg-gradient-to-br from-orange-700 to-rose-600 text-white text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <AnimatedSection className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to Order Your Dream Cake?</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">Contact us today and let's create something sweet together.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://whatsapp.com/channel/0029Vb8TbE7LY6d6hMiCqR2k" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-400 hover:bg-green-300 text-gray-900 font-bold rounded-2xl shadow-lg transition-all hover:-translate-y-0.5 text-base">
              <WhatsAppIcon /> Order on WhatsApp
            </a>
            <a href="https://www.instagram.com/harsh_cake_zone/" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 hover:bg-white/25 text-white font-bold rounded-2xl border border-white/30 transition-all hover:-translate-y-0.5 text-base">
              <InstagramIcon /> Follow on Instagram
            </a>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-orange-900 text-white/70 text-sm py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <img src={logo} alt="Logo" className="w-12 h-12 rounded-full object-cover mx-auto mb-3 ring-2 ring-orange-700" />
          <p className="font-bold text-white text-base mb-1">Harsh Cake Zone</p>
          <p className="text-white/50 text-xs mb-5">Handcrafted cakes with love 🎂</p>
          {/* Social icons */}
          <div className="flex justify-center gap-3 mb-5">
            <a href="https://whatsapp.com/channel/0029Vb8TbE7LY6d6hMiCqR2k" target="_blank" rel="noreferrer"
              className="w-9 h-9 bg-green-500 hover:bg-green-400 text-white rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5">
              <WhatsAppIcon />
            </a>
            <a href="https://www.instagram.com/harsh_cake_zone/" target="_blank" rel="noreferrer"
              className="w-9 h-9 text-white rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
              <InstagramIcon />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61572345472233" target="_blank" rel="noreferrer"
              className="w-9 h-9 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-xl flex items-center justify-center transition-all hover:-translate-y-0.5">
              <FacebookIcon />
            </a>
          </div>
          <div className="flex justify-center gap-5 text-xs mb-5">
            {[['/', 'Home'], ['/menu', 'Menu'], ['/gallery', 'Gallery'], ['/our-reviews', 'Reviews']].map(([to, label]) => (
              <Link key={to} to={to} className="hover:text-white transition-colors">{label}</Link>
            ))}
          </div>
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Harsh Cake Zone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

