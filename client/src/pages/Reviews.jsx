import React, { useEffect, useState } from 'react';
import axios from 'axios';

const STARS = [1, 2, 3, 4, 5];

export default function Reviews() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/feedback').then(({ data }) => {
      if (data.success) {
        setFeedbacks(data.data);
        setAvgRating(data.avgRating);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  const dist = STARS.map((s) => ({
    star: s,
    count: feedbacks.filter((f) => f.rating === s).length,
  })).reverse();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customer Reviews</h1>

      {/* Summary */}
      <div className="card flex flex-col sm:flex-row items-center gap-6">
        <div className="text-center">
          <p className="text-6xl font-bold text-orange-600">{avgRating || '—'}</p>
          <div className="flex gap-0.5 justify-center mt-1">
            {STARS.map((s) => (
              <span key={s} className={`text-xl ${s <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">{feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 w-full space-y-1.5">
          {dist.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-4">{star}</span>
              <span className="text-yellow-400 text-xs">★</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: feedbacks.length ? `${(count / feedbacks.length) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-gray-400 w-4 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      {feedbacks.length === 0 && (
        <p className="text-center text-gray-400 py-12">No reviews yet. Send the review link to customers after delivery!</p>
      )}
      <div className="space-y-3">
        {feedbacks.map((f) => (
          <div key={f._id} className="card space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{f.customerName}</p>
                <p className="text-xs text-gray-400">{f.orderId?.cakeDetails}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex gap-0.5">
                  {STARS.map((s) => (
                    <span key={s} className={`text-base ${s <= f.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
                <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
            {f.comment && <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">"{f.comment}"</p>}
            {f.wouldRecommend && (
              <p className="text-xs text-green-600 font-medium">👍 Would recommend</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
