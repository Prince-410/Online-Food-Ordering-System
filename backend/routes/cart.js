const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.post('/coupon', protect, applyCoupon);
router.put('/:itemId', protect, updateCartItem);
router.delete('/clear', protect, clearCart);
router.delete('/:itemId', protect, removeFromCart);

module.exports = router;
