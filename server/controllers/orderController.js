const crypto = require('crypto');
const Order = require('../models/Order');

// GET all orders
exports.getOrders = async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single order by ID or receipt token
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { receiptToken: req.params.id }],
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create order
exports.createOrder = async (req, res) => {
  try {
    const { customerName, phone, cakeDetails, weight, sellingPrice, orderDate, paymentStatus } = req.body;
    const receiptToken = crypto.randomBytes(12).toString('hex');
    const cakeImageURL = req.file ? req.file.path : '';

    const order = await Order.create({
      customerName,
      phone,
      cakeDetails,
      weight: weight || '',
      sellingPrice: parseFloat(sellingPrice),
      orderDate: orderDate ? new Date(orderDate) : new Date(),
      paymentStatus: paymentStatus || 'Pending',
      cakeImageURL,
      receiptToken,
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, receiptSent, reviewSent } = req.body;
    const update = {};
    if (orderStatus) update.orderStatus = orderStatus;
    if (paymentStatus) update.paymentStatus = paymentStatus;
    if (receiptSent !== undefined) update.receiptSent = receiptSent;
    if (reviewSent !== undefined) update.reviewSent = reviewSent;
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: false });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH edit order fields
exports.updateOrder = async (req, res) => {
  try {
    const { customerName, phone, cakeDetails, weight, sellingPrice, orderDate } = req.body;
    const update = {};
    if (customerName) update.customerName = customerName;
    if (phone) update.phone = phone;
    if (cakeDetails) update.cakeDetails = cakeDetails;
    if (weight !== undefined) update.weight = weight;
    if (sellingPrice) update.sellingPrice = parseFloat(sellingPrice);
    if (orderDate) update.orderDate = new Date(orderDate);
    if (req.file) update.cakeImageURL = req.file.path;
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: false });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE order
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function generateUPILink(amount, customerName) {
  const upiId = process.env.UPI_ID || 'yourname@okaxis';
  const name = encodeURIComponent(process.env.BUSINESS_NAME || 'HarshCakes');
  const note = encodeURIComponent(`Order by ${customerName}`);
  return `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
}
