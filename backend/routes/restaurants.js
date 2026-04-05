const express = require('express');
const router = express.Router();
const {
  getRestaurants, getRestaurant, createRestaurant, updateRestaurant, deleteRestaurant, getRecommendations
} = require('../controllers/restaurantController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

router.get('/', getRestaurants);
router.get('/recommendations', optionalAuth, getRecommendations);
router.get('/:id', getRestaurant);
router.post('/', protect, createRestaurant);
router.put('/:id', protect, updateRestaurant);
router.delete('/:id', protect, adminOnly, deleteRestaurant);

module.exports = router;
