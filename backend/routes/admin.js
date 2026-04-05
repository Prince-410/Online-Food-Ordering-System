const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getAllUsers, 
  getAllOrders, 
  updateUserRole,
  toggleUserBan,
  deleteRestaurant,
  getRevenueAnalytics,
  getOrderAnalytics,
  getPopularItems,
  getOrderHeatmap,
  getAIInsights
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// Dashboard
router.get('/stats', getDashboardStats);

// Analytics
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/orders', getOrderAnalytics);
router.get('/analytics/popular', getPopularItems);
router.get('/analytics/heatmap', getOrderHeatmap);

// AI Insights
router.get('/ai-insights', getAIInsights);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/ban', toggleUserBan);

// Orders
router.get('/orders', getAllOrders);

// Restaurants
router.delete('/restaurants/:id', deleteRestaurant);

module.exports = router;
