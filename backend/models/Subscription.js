const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'family'],
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  features: [{ type: String }],
  mealsPerDay: { type: Number, default: 1 },
  durationDays: { type: Number, default: 30 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  selectedMeals: [{
    day: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] },
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }
  }],
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  payment: {
    method: { type: String, default: 'razorpay' },
    status: { type: String, enum: ['pending', 'active', 'expired', 'cancelled'], default: 'pending' },
    razorpaySubscriptionId: { type: String }
  }
}, { timestamps: true });

subscriptionSchema.pre('save', function() {
  if (!this.endDate) {
    this.endDate = new Date(this.startDate.getTime() + this.durationDays * 24 * 60 * 60 * 1000);
  }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
