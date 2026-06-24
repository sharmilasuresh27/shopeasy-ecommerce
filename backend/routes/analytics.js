const router = require('express').Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');

// GET /api/analytics/dashboard - Get dashboard overview
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Calculate total revenue
    const orders = await Order.find({ status: 'delivered' });
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Most viewed product
    const mostViewed = await Product.findOne().sort({ views: -1 });
    
    // Most sold product
    const mostSold = await Product.findOne().sort({ sold: -1 });
    
    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');
    
    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      mostViewed: mostViewed ? { name: mostViewed.name, views: mostViewed.views } : null,
      mostSold: mostSold ? { name: mostSold.name, sold: mostSold.sold } : null,
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/sales - Get sales data for graph
router.get('/sales', adminAuth, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    let startDate = new Date();
    
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else startDate.setFullYear(startDate.getFullYear() - 1);
    
    const orders = await Order.find({
      createdAt: { $gte: startDate },
      status: 'delivered'
    }).sort({ createdAt: 1 });
    
    // Group by date
    const salesByDate = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      salesByDate[date] = (salesByDate[date] || 0) + order.total;
    });
    
    res.json({
      labels: Object.keys(salesByDate),
      data: Object.values(salesByDate)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/category-sales - Get sales by category
router.get('/category-sales', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find({ status: 'delivered' }).populate('items.product');
    
    const categorySales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          const category = item.product.category;
          categorySales[category] = (categorySales[category] || 0) + (item.price * item.qty);
        }
      });
    });
    
    res.json({
      labels: Object.keys(categorySales),
      data: Object.values(categorySales)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/top-products - Get top selling products
router.get('/top-products', adminAuth, async (req, res) => {
  try {
    const topProducts = await Product.find()
      .sort({ sold: -1 })
      .limit(10)
      .select('name sold price category image');
    
    res.json(topProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
