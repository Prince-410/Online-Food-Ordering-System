const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  items: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
      name: String,
      price: Number,
      image: String,
      quantity: { type: Number, default: 1, min: 1 },
      customizations: [{ name: String, option: String, extraCost: Number }]
    }
  ],
  discount: { type: Number, default: 0 },
  appliedCoupon: { type: String, default: null }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, item) => {
    const extras = item.customizations.reduce((s, c) => s + (c.extraCost || 0), 0);
    return sum + (item.price + extras) * item.quantity;
  }, 0);
});

module.exports = mongoose.model('Cart', cartSchema);
