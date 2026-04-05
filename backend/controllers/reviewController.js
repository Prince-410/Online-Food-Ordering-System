const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');

// POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { restaurant, order, rating, comment } = req.body;
    
    // Check if user already reviewed this order
    const existing = await Review.findOne({ order, user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this order' });
    }

    const review = await Review.create({
      user: req.user._id,
      restaurant,
      order,
      rating,
      comment
    });

    // Update restaurant average rating
    const allReviews = await Review.find({ restaurant });
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
    
    await Restaurant.findByIdAndUpdate(restaurant, {
      rating: parseFloat(avgRating.toFixed(1)),
      reviewCount: allReviews.length
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit review', error: err.message });
  }
};

// GET /api/reviews/restaurant/:id
const getRestaurantReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
};

module.exports = { createReview, getRestaurantReviews };
