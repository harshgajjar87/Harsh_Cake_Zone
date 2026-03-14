const Expense = require('../models/Expense');


// GET all expenses with optional filters
exports.getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create expense (with optional bill image from Cloudinary)
exports.createExpense = async (req, res) => {
  try {
    const { materialName, amountSpent, category, date, notes } = req.body;
    const billImageURL = req.file ? req.file.path : (req.body.billImageURL || '');

    const expense = await Expense.create({
      materialName,
      amountSpent: parseFloat(amountSpent),
      category: category || 'Ingredients',
      date: date ? new Date(date) : new Date(),
      billImageURL,
      notes,
    });

    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH update expense
exports.updateExpense = async (req, res) => {
  try {
    const { materialName, amountSpent, category, date, notes } = req.body;
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        ...(materialName && { materialName }),
        ...(amountSpent && { amountSpent: parseFloat(amountSpent) }),
        ...(category && { category }),
        ...(date && { date: new Date(date) }),
        notes: notes ?? undefined,
      },
      { new: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET expense summary by category
exports.getExpenseSummary = async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amountSpent' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
