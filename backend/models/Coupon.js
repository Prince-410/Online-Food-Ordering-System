const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, required: true },
  discountType: { type: String, enum: ['percentage', 'flat'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: null },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  applicableRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
  userRestrictions: {
    newUsersOnly: { type: Boolean, default: false },
    maxUsesPerUser: { type: Number, default: 1 }
  }
}, { timestamps: true });

couponSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && 
    now >= this.validFrom && 
    now <= this.validUntil && 
    (this.usageLimit === null || this.usedCount < this.usageLimit);
};

couponSchema.methods.calculateDiscount = function(subtotal) {
  if (subtotal < this.minOrderAmount) return 0;
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = subtotal * (this.discountValue / 100);
    if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  } else {
    discount = this.discountValue;
  }
  return Math.min(discount, subtotal);
};

module.exports = mongoose.model('Coupon', couponSchema);
