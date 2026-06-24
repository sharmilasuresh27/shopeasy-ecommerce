const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  description:  { type: String, default: '' },
  price:        { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  discount:     { type: Number, default: 0 },
  image:        { type: String, default: '' },
  stock:        { type: Number, default: 10 },
  category:     { type: String, default: 'General' },
  views:        { type: Number, default: 0 },
  sold:         { type: Number, default: 0 },
  rating:       { type: Number, default: 4.5 },
  priceHistory: [{ price: Number, date: { type: Date, default: Date.now } }]
}, { timestamps: true });
module.exports = mongoose.model('Product', ProductSchema);
