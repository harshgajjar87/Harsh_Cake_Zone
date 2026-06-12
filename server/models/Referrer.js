const mongoose = require('mongoose');

const referrerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    totalReferrals: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
    rewardGiven: { type: Boolean, default: false },
    rewardNote: { type: String, default: '' }, // e.g. "Half kg cake given on 12/6/26"
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Referrer', referrerSchema);
