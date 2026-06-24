const router = require('express').Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');
const adminAuth = require('../middleware/adminAuth');

// POST /api/admin/products - Add new product
router.post('/products', adminAuth, async (req, res) => {
  try {
    const { name, category, price, image, description, stock, originalPrice, discount, rating } = req.body;
    if (!name || !category || !price)
      return res.status(400).json({ error: 'Name, category, and price are required' });
    
    const product = await Product.create({
      name,
      category,
      price,
      image: image || '',
      description: description || '',
      stock: stock || 10,
      originalPrice: originalPrice || 0,
      discount: discount || 0,
      rating: rating || 4.5,
      priceHistory: [{ price, date: new Date() }]
    });
    
    res.json({ message: 'Product added successfully', product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/products/:id - Update product
router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    const { name, category, price, image, description, stock, originalPrice, discount, rating } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product)
      return res.status(404).json({ error: 'Product not found' });
    
    const oldPrice = product.price;
    
    // Update product
    product.name = name || product.name;
    product.category = category || product.category;
    product.price = price !== undefined ? price : product.price;
    product.image = image !== undefined ? image : product.image;
    product.description = description !== undefined ? description : product.description;
    product.stock = stock !== undefined ? stock : product.stock;
    product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
    product.discount = discount !== undefined ? discount : product.discount;
    product.rating = rating !== undefined ? rating : product.rating;
    
    // Add price history if price changed
    if (price !== undefined && price !== oldPrice) {
      product.priceHistory.push({ price, date: new Date() });
      
      // Trigger price drop notifications
      if (price < oldPrice) {
        await fetch(`${req.protocol}://${req.get('host')}/api/notifications/trigger-price-drop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product._id, oldPrice, newPrice: price })
        });
      }
    }
    
    await product.save();
    
    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/products/:id - Delete product
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ error: 'Product not found' });
    
    // Delete related notifications
    await Notification.deleteMany({ product: req.params.id });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/orders - Get all orders
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/orders/:id/status - Update order status
router.put('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: 'Invalid status' });
    
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ error: 'Order not found' });
    
    order.status = status;
    order.statusHistory.push({ status, time: new Date(), msg: `Status updated to ${status}` });
    
    // Update product sold count if delivered
    if (status === 'delivered') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { sold: item.qty } });
      }
    }
    
    await order.save();
    
    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/users/:id/block - Block user
router.put('/users/:id/block', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { blocked: true }, { returnDocument: 'after' });
    if (!user)
      return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User blocked successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/users/:id/unblock - Unblock user
router.put('/users/:id/unblock', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { blocked: false }, { returnDocument: 'after' });
    if (!user)
      return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User unblocked successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ error: 'User not found' });
    
    // Delete user's notifications
    await Notification.deleteMany({ user: req.params.id });
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
