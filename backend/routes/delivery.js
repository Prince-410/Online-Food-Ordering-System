const express = require('express');
const router = express.Router();
const {
  getProfile,
  toggleAvailability,
  updateLocation,
  getPendingOrders,
  acceptOrder,
  completeDelivery,
  getEarnings
} = require('../controllers/deliveryController');
const { protect } = require('../middleware/auth');

// All delivery routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.put('/availability', toggleAvailability);
router.put('/location', updateLocation);
router.get('/pending-orders', getPendingOrders);
router.post('/accept/:orderId', acceptOrder);
router.post('/complete/:orderId', completeDelivery);
router.get('/earnings', getEarnings);

module.exports = router;
