const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { 
  getAvailableCoupons, applyCoupon, removeCoupon, 
  createCoupon, getAllCoupons, deleteCoupon 
} = require('../controllers/couponController');

// User routes
router.get('/', protect, getAvailableCoupons);
router.post('/apply', protect, applyCoupon);
router.post('/remove', protect, removeCoupon);

// Admin routes
router.get('/all', protect, adminOnly, getAllCoupons);
router.post('/create', protect, adminOnly, createCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);

module.exports = router;
