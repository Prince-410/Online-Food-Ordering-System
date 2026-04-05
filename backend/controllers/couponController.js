const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');

// GET /api/coupons — Get available coupons
const getAvailableCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    }).select('-usedCount -usageLimit');

    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch coupons', error: err.message });
  }
};

// POST /api/coupons/apply — Apply coupon to cart
const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });
    if (!coupon.isValid()) return res.status(400).json({ message: 'Coupon has expired or is no longer valid' });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || !cart.items.length) return res.status(400).json({ message: 'Cart is empty' });

    const subtotal = cart.subtotal;
    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount is ₹${coupon.minOrderAmount}` 
      });
    }

    const discount = coupon.calculateDiscount(subtotal);
    
    cart.discount = discount;
    cart.appliedCoupon = coupon.code;
    await cart.save();

    res.json({ 
      success: true, 
      message: `Coupon applied! You save ₹${discount.toFixed(0)}`,
      discount,
      coupon: { code: coupon.code, description: coupon.description, discountType: coupon.discountType, discountValue: coupon.discountValue }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to apply coupon', error: err.message });
  }
};

// POST /api/coupons/remove — Remove coupon from cart
const removeCoupon = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { discount: 0, appliedCoupon: null },
      { new: true }
    );
    res.json({ success: true, message: 'Coupon removed', cart });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove coupon', error: err.message });
  }
};

// ADMIN: POST /api/coupons — Create coupon
const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create coupon', error: err.message });
  }
};

// ADMIN: GET /api/coupons/all 
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch coupons', error: err.message });
  }
};

// ADMIN: DELETE /api/coupons/:id
const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete coupon', error: err.message });
  }
};

module.exports = { getAvailableCoupons, applyCoupon, removeCoupon, createCoupon, getAllCoupons, deleteCoupon };
