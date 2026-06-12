const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    cakeDetails: { type: String, required: true },
    weight: { type: String, default: '' },
    sellingPrice: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    orderStatus: {
      type: String,
      enum: ['In Progress', 'Delivered'],
      default: 'In Progress',
    },
    cakeImageURL: { type: String, default: '' },
    receiptToken: { type: String, unique: true, sparse: true },
    feedbackGiven: { type: Boolean, default: false },
    receiptSent: { type: Boolean, default: false },
    reviewSent: { type: Boolean, default: false },
    confirmationSent: { type: Boolean, default: false },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Referrer', default: null },
    commission: { type: Number, default: 0 },
    category: { type: String, enum: ['Cakes', 'Cupcakes', 'Chocolates', 'Brownies', 'Other'], default: 'Cakes' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
