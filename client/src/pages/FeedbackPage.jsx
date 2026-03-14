import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function FeedbackPage() {
  const { orderId } = useParams();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return setError('Please select a rating');
    setLoading(true);
    try {
      await axios.post('/api/feedback', { orderId, rating, comment, wouldRecommend });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800">Thank you!</h2>
        <p className="text-gray-500 mt-2">Your feedback means the world to us.</p>
        <p className="text-sm text-gray-400 mt-4">You can close this tab now. 😊</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card border border-orange-100">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">⭐</div>
          <h1 className="text-xl font-bold">How was your experience?</h1>
          <p className="text-sm text-gray-500 mt-1">Your feedback helps us bake better!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Tap to rate</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-4xl transition-transform hover:scale-110 ${star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-orange-500 mt-1 font-medium">
                {['', 'Poor 😞', 'Fair 😐', 'Good 🙂', 'Great 😊', 'Amazing! 🤩'][rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm text-gray-600 font-medium block mb-1">Tell us more (optional)</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="The cake was delicious and delivered on time..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {/* Recommend */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recommend"
              checked={wouldRecommend}
              onChange={(e) => setWouldRecommend(e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            <label htmlFor="recommend" className="text-sm text-gray-600">I would recommend HarshCakes to friends</label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
