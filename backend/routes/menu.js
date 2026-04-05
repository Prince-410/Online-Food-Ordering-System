const express = require('express');
const router = express.Router();
const {
  getMenu, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem, getFeaturedItems
} = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/featured', getFeaturedItems);
router.get('/:restaurantId', getMenu);
router.get('/item/:id', getMenuItem);
router.post('/', protect, createMenuItem);
router.put('/:id', protect, updateMenuItem);
router.delete('/:id', protect, adminOnly, deleteMenuItem);

module.exports = router;
