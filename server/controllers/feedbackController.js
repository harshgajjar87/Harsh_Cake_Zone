const Feedback = require('../models/Feedback');
const Order = require('../models/Order');

exports.submitFeedback = async (req, res) => {
  try {
    const { orderId, rating, comment, wouldRecommend } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const existing = await Feedback.findOne({ orderId });
    if (existing) return res.status(400).json({ success: false, message: 'Feedback already submitted' });

    const feedback = await Feedback.create({
      orderId,
      customerName: order.customerName,
      rating,
      comment,
      wouldRecommend,
    });

    // Mark the order as having received feedback
    await Order.findByIdAndUpdate(orderId, { feedbackGiven: true });

    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('orderId', 'customerName cakeDetails').sort({ createdAt: -1 });
    const avgRating = feedbacks.length
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : 0;
    res.json({ success: true, data: feedbacks, avgRating: parseFloat(avgRating) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
