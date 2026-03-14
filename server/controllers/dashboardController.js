const Order = require('../models/Order');
const Expense = require('../models/Expense');

exports.getFinancialSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    let orderFilter = { paymentStatus: 'Paid' };
    let expenseFilter = {};

    // Optional month/year filter
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      orderFilter.orderDate = { $gte: start, $lte: end };
      expenseFilter.date = { $gte: start, $lte: end };
    }

    const [revenueResult, expenseResult, totalOrders, pendingOrders, recentOrders, expenseByCategory] =
      await Promise.all([
        Order.aggregate([
          { $match: orderFilter },
          { $group: { _id: null, total: { $sum: '$sellingPrice' } } },
        ]),
        Expense.aggregate([
          { $match: expenseFilter },
          { $group: { _id: null, total: { $sum: '$amountSpent' } } },
        ]),
        Order.countDocuments(),
        Order.countDocuments({ paymentStatus: 'Pending' }),
        Order.find().sort({ createdAt: -1 }).limit(5),
        Expense.aggregate([
          { $match: expenseFilter },
          { $group: { _id: '$category', total: { $sum: '$amountSpent' } } },
        ]),
      ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const totalExpenses = expenseResult[0]?.total || 0;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin: parseFloat(profitMargin),
        totalOrders,
        pendingOrders,
        recentOrders,
        expenseByCategory,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Monthly trend data for charts
exports.getMonthlyTrend = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const [revenueByMonth, expenseByMonth] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'Paid',
            orderDate: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) },
          },
        },
        { $group: { _id: { $month: '$orderDate' }, total: { $sum: '$sellingPrice' } } },
        { $sort: { _id: 1 } },
      ]),
      Expense.aggregate([
        {
          $match: {
            date: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) },
          },
        },
        { $group: { _id: { $month: '$date' }, total: { $sum: '$amountSpent' } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend = months.map((name, i) => {
      const rev = revenueByMonth.find((r) => r._id === i + 1)?.total || 0;
      const exp = expenseByMonth.find((e) => e._id === i + 1)?.total || 0;
      return { month: name, revenue: rev, expenses: exp, profit: rev - exp };
    });

    res.json({ success: true, data: trend });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
