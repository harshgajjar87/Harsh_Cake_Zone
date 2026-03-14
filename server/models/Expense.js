const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    materialName: { type: String, required: true, trim: true },
    amountSpent: { type: Number, required: true },
    category: {
      type: String,
      enum: ['Ingredients', 'Raw Materials', 'Packaging', 'Other'],
      default: 'Ingredients',
    },
    date: { type: Date, default: Date.now },
    billImageURL: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
