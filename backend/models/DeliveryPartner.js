const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  vehicleType: { type: String, enum: ['bicycle', 'bike', 'scooter', 'car'], default: 'bike' },
  vehicleNumber: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  isOnDelivery: { type: Boolean, default: false },
  currentLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
  },
  activeOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  stats: {
    totalDeliveries: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 5, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    completionRate: { type: Number, default: 100 }
  },
  earnings: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    amount: Number,
    tip: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
  }],
  documents: {
    license: { type: String, default: '' },
    idProof: { type: String, default: '' },
    verified: { type: Boolean, default: false }
  }
}, { timestamps: true });

deliveryPartnerSchema.index({ 'currentLocation.lat': 1, 'currentLocation.lng': 1 });
deliveryPartnerSchema.index({ isAvailable: 1, isOnDelivery: 1 });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
