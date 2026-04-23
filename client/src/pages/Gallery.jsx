import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get('/api/orders')
      .then(({ data }) => {
        if (data.success) {
          const imgs = data.data
            .filter((o) => o.cakeImageURL)
            .map((o) => ({ url: o.cakeImageURL, name: o.cakeDetails, date: o.orderDate }));
          setImages(imgs);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Loading gallery...</div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={selected.url} alt={selected.name} className="w-full rounded-2xl object-contain max-h-[80vh]" />
            <p className="text-white text-center mt-3 text-sm font-medium">{selected.name}</p>
            <button
              className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">🎂</div>
        <h1 className="text-2xl font-bold text-orange-600">Harsh Cake Zone</h1>
        <p className="text-gray-400 text-sm mt-1">Our Cake Gallery</p>
      </div>

      {images.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No cakes yet. Check back soon! 🎂</p>
      ) : (
        <div className="columns-2 sm:columns-3 gap-3 space-y-3">
          {images.map((img, i) => (
            <div
              key={i}
              className="break-inside-avoid cursor-pointer rounded-2xl overflow-hidden shadow hover:shadow-md transition-shadow"
              onClick={() => setSelected(img)}
            >
              <img src={img.url} alt={img.name} className="w-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
