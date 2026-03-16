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

// PATCH update order status — triggers WhatsApp when marked Ready
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, receiptSent, reviewSent } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const wasNotReady = order.orderStatus !== 'Ready';
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (receiptSent !== undefined) order.receiptSent = receiptSent;
    if (reviewSent !== undefined) order.reviewSent = reviewSent;
    await order.save();

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH edit order fields
exports.updateOrder = async (req, res) => {
  try {
    const { customerName, phone, cakeDetails, weight, sellingPrice, orderDate } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (customerName) order.customerName = customerName;
    if (phone) order.phone = phone;
    if (cakeDetails) order.cakeDetails = cakeDetails;
    if (weight !== undefined) order.weight = weight;
    if (sellingPrice) order.sellingPrice = parseFloat(sellingPrice);
    if (orderDate) order.orderDate = new Date(orderDate);
    if (req.file) order.cakeImageURL = req.file.path;
    await order.save();
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
