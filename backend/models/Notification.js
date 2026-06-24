const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['price_drop', 'back_in_stock', 'new_arrival'], default: 'price_drop' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  oldPrice: { type: Number },
  newPrice: { type: Number },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
