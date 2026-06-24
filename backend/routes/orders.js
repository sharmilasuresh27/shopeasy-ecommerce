const router  = require('express').Router();
const auth    = require('../middleware/auth');
const Order   = require('../models/Order');

// Place order
router.post('/', auth, async (req, res) => {
  try {
    const { items, total, address, phone, paymentMethod } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'No items' });
    if (!address || !phone)      return res.status(400).json({ error: 'Address and phone required' });
    const order = await Order.create({
      user: req.user.id, items, total,
      address, phone,
      paymentMethod: paymentMethod || 'cod',
      status: 'confirmed',
      statusHistory: [{ status: 'confirmed', time: new Date(), msg: 'Order placed successfully!' }]
    });
    res.json(order);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// My orders
router.get('/mine', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Get single order (for tracking)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Simulate status advance (for demo)
router.post('/:id/advance', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ error: 'Not found' });
    const flow = ['confirmed','processing','shipped','out_for_delivery','delivered'];
    const msgs = {
      confirmed:'Order placed successfully!',
      processing:'Your order is being packed.',
      shipped:'Order handed to courier. On its way!',
      out_for_delivery:'Out for delivery! Will arrive today.',
      delivered:'Delivered! Enjoy your product 🎉'
    };
    const cur = flow.indexOf(order.status);
    if (cur < flow.length - 1) {
      const next = flow[cur + 1];
      order.status = next;
      order.statusHistory.push({ status: next, time: new Date(), msg: msgs[next] });
      await order.save();
    }
    res.json(order);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
