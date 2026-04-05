const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  points: { type: Number, default: 0 },
  level: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], default: 'bronze' },
  totalPointsEarned: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  badges: [{
    name: { type: String, required: true },
    icon: { type: String, default: '🏆' },
    description: String,
    earnedAt: { type: Date, default: Date.now },
    category: { type: String, enum: ['order', 'review', 'loyalty', 'special'], default: 'order' }
  }],
  streaks: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastOrderDate: { type: Date }
  },
  history: [{
    type: { type: String, enum: ['earned', 'redeemed', 'bonus', 'expired'] },
    points: Number,
    description: String,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

rewardSchema.methods.addPoints = function(amount, description, orderId) {
  const points = Math.floor(amount / 10); // 1 point per ₹10
  this.points += points;
  this.totalPointsEarned += points;
  this.totalOrders += 1;
  this.history.push({ type: 'earned', points, description, orderId });
  
  // Level up logic
  if (this.totalPointsEarned >= 5000) this.level = 'diamond';
  else if (this.totalPointsEarned >= 2000) this.level = 'platinum';
  else if (this.totalPointsEarned >= 1000) this.level = 'gold';
  else if (this.totalPointsEarned >= 500) this.level = 'silver';
  
  return points;
};

module.exports = mongoose.model('Reward', rewardSchema);
