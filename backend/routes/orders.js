const express = require('express');
const router = express.Router();
const {
  placeOrder, getUserOrders, getOrderById, updateOrderStatus, cancelOrder
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/place', protect, placeOrder);
router.get('/my', protect, getUserOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, updateOrderStatus);
router.patch('/:id/cancel', protect, cancelOrder);

module.exports = router;
