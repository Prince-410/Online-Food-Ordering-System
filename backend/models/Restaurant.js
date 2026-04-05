const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  cuisines: [{ type: String }],
  image: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    coordinates: { lat: Number, lng: Number }
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  deliveryTime: { type: String, default: '30-45 min' },
  deliveryFee: { type: Number, default: 0 },
  minOrder: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }],
  openingHours: {
    mon: String, tue: String, wed: String,
    thu: String, fri: String, sat: String, sun: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
