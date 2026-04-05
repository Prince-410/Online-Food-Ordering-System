const express = require('express');
const router = express.Router();
const { getPersonalized, getMoodBased, getSearchSuggestions, getTrending } = require('../controllers/recommendationController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/personalized', optionalAuth, getPersonalized);
router.get('/mood', getMoodBased);
router.get('/search', getSearchSuggestions);
router.get('/trending', getTrending);

module.exports = router;
