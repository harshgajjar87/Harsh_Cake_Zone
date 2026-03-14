const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    customerName: { type: String },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: '' },
    wouldRecommend: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
