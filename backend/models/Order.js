const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  customizations: [{ name: String, option: String, extraCost: Number }],
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },

    items: [orderItemSchema],

    // Snapshot of address — mirrors User.addresses sub-doc fields exactly
    deliveryAddress: {
      label: { type: String, default: 'Home' },
      fullName: { type: String, required: true },   // delivery contact name
      phone: { type: String, required: true },   // delivery contact phone
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
    },

    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 40 },
      tax: { type: Number, required: true }, // 5% GST
      total: { type: Number, required: true },
    },

    payment: {
      method: { type: String, enum: ['razorpay', 'cod'], default: 'razorpay' },
      status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
      razorpayOrderId: { type: String, default: null },
      razorpayPaymentId: { type: String, default: null },
      razorpaySignature: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },

    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },

    appliedCoupon: { type: String, default: null },
    estimatedDelivery: { type: Date },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
