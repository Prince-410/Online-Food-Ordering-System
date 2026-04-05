const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  category: { type: String, required: true },
  image: { type: String, default: '' },
  isVeg: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  spiceLevel: { type: String, enum: ['mild', 'medium', 'hot', 'extra-hot'], default: 'mild' },
  tags: [{ type: String }],
  customizations: [
    {
      name: String,
      options: [{ label: String, extraCost: Number }]
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
