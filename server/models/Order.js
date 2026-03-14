const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    cakeDetails: { type: String, required: true },
    sellingPrice: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    orderStatus: {
      type: String,
      enum: ['Received', 'In Progress', 'Ready', 'Delivered'],
      default: 'Received',
    },
    cakeImageURL: { type: String, default: '' },
    receiptToken: { type: String, unique: true, sparse: true },
    feedbackGiven: { type: Boolean, default: false },
    receiptSent: { type: Boolean, default: false },
    reviewSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
