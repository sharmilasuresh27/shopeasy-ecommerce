const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:         [{ product: mongoose.Schema.Types.ObjectId, name: String, qty: Number, price: Number, image: String }],
  total:         { type: Number, required: true },
  address:       { type: String, required: true },
  phone:         { type: String, required: true },
  paymentMethod: { type: String, default: 'cod', enum: ['cod','card','upi'] },
  status:        { type: String, default: 'confirmed', enum: ['confirmed','processing','shipped','out_for_delivery','delivered'] },
  statusHistory: [{ status: String, time: Date, msg: String }],
  otp:           { type: String },
  otpVerified:   { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Order', OrderSchema);
