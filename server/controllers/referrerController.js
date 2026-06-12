const Referrer = require('../models/Referrer');
const Order = require('../models/Order');

// Default commission rates by weight keyword
const DEFAULT_RATES = [
  { match: '500', commission: 30 },
  { match: '1kg', commission: 100 },
  { match: '1.5', commission: 150 },
  { match: '2kg', commission: 200 },
  { match: '3kg', commission: 350 },
  { match: '4kg', commission: 500 },
  { match: '5kg', commission: 650 },
];

exports.getCommissionRate = (weight = '') => {
  const w = weight.toLowerCase();
  for (const r of DEFAULT_RATES) {
    if (w.includes(r.match)) return r.commission;
  }
  return 100; // default fallback
};

// GET all referrers with their order stats
exports.getReferrers = async (req, res) => {
  try {
    const referrers = await Referrer.find().sort({ createdAt: -1 });
    // Attach order list to each referrer
    const enriched = await Promise.all(referrers.map(async (r) => {
      const orders = await Order.find({ referredBy: r._id }).select('customerName cakeDetails weight sellingPrice commission orderDate paymentStatus');
      return { ...r.toObject(), orders };
    }));
    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create referrer
exports.createReferrer = async (req, res) => {
  try {
    const { name, phone, notes } = req.body;
    const referrer = await Referrer.create({ name, phone, notes });
    res.status(201).json({ success: true, data: referrer });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH update referrer
exports.updateReferrer = async (req, res) => {
  try {
    const { name, phone, notes, rewardGiven, rewardNote } = req.body;
    const update = {};
    if (name) update.name = name;
    if (phone) update.phone = phone;
    if (notes !== undefined) update.notes = notes;
    if (rewardGiven !== undefined) update.rewardGiven = rewardGiven;
    if (rewardNote !== undefined) update.rewardNote = rewardNote;
    const referrer = await Referrer.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!referrer) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: referrer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE referrer
exports.deleteReferrer = async (req, res) => {
  try {
    await Referrer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH update commission on a single order manually
exports.updateOrderCommission = async (req, res) => {
  try {
    const { commission, referredBy } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { commission: parseFloat(commission), referredBy: referredBy || null },
      { new: true, runValidators: false }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Recompute referrer totals
    if (order.referredBy) {
      const orders = await Order.find({ referredBy: order.referredBy });
      const totalCommission = orders.reduce((s, o) => s + (o.commission || 0), 0);
      const totalReferrals = orders.length;
      await Referrer.findByIdAndUpdate(order.referredBy, { totalCommission, totalReferrals });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET commission rates
exports.getRates = async (req, res) => {
  res.json({ success: true, data: DEFAULT_RATES });
};
