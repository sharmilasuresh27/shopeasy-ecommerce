const router = require('express').Router();
const Notification = require('../models/Notification');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// GET /api/notifications - Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate('product', 'name image price')
      .sort({ createdAt: -1 })
      .limit(50);
    const unread = await Notification.countDocuments({ user: req.user.id, read: false });
    res.json({ notifications, unread });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/subscribe - Subscribe to price drop for a product
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId)
      return res.status(400).json({ error: 'Product ID required' });
    
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ error: 'Product not found' });
    
    // Check if already subscribed
    const existing = await Notification.findOne({
      user: req.user.id,
      product: productId,
      type: 'price_drop',
      read: false
    });
    
    if (existing)
      return res.json({ message: 'Already subscribed to price drop alerts' });
    
    const notification = await Notification.create({
      user: req.user.id,
      product: productId,
      type: 'price_drop',
      title: `Price Drop Alert: ${product.name}`,
      message: `We'll notify you when the price drops for ${product.name}`,
      oldPrice: product.price,
      newPrice: product.price,
      read: true // Mark as read since it's just a subscription
    });
    
    res.json({ message: 'Subscribed to price drop alerts', notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { returnDocument: 'after' }
    );
    if (!notification)
      return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    if (!notification)
      return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/trigger-price-drop - Admin endpoint to trigger price drop notifications
router.post('/trigger-price-drop', async (req, res) => {
  try {
    const { productId, oldPrice, newPrice } = req.body;
    if (!productId || !oldPrice || !newPrice)
      return res.status(400).json({ error: 'Product ID and prices required' });
    
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ error: 'Product not found' });
    
    // Find all users subscribed to this product
    const subscribers = await Notification.find({
      product: productId,
      type: 'price_drop'
    }).distinct('user');
    
    // Create notifications for all subscribers
    const notifications = await Notification.insertMany(
      subscribers.map(userId => ({
        user: userId,
        product: productId,
        type: 'price_drop',
        title: `Price Dropped! ${product.name}`,
        message: `${product.name} is now ₹${newPrice.toLocaleString('en-IN')} (was ₹${oldPrice.toLocaleString('en-IN')})`,
        oldPrice,
        newPrice,
        read: false
      }))
    );
    
    res.json({ message: `Price drop notifications sent to ${subscribers.length} users`, count: notifications.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
