const router = require('express').Router();
const auth   = require('../middleware/auth');

// Cart is stored in localStorage on frontend.
// These endpoints are for optional server-side cart sync.

// GET cart (just a placeholder — frontend handles cart via localStorage)
router.get('/', auth, (req, res) => {
  res.json({ message: 'Use localStorage cart on frontend', userId: req.user.id });
});

module.exports = router;

