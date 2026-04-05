const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

// @desc  Get all restaurants (with filters)
// @route GET /api/restaurants
exports.getRestaurants = async (req, res) => {
  try {
    const { search, cuisine, sort, isOpen, minRating, maxPrice } = req.query;
    let query = { isActive: true };

    if (search) query.name = { $regex: search, $options: 'i' };
    if (cuisine) query.cuisines = { $in: [cuisine] };
    if (isOpen !== undefined) query.isOpen = isOpen === 'true';
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (maxPrice) query.minOrder = { $lte: Number(maxPrice) };

    let sortOption = {};
    if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'popularity') sortOption = { totalRatings: -1 };
    else if (sort === 'price') sortOption = { minOrder: 1 };
    else if (sort === 'delivery') sortOption = { deliveryFee: 1 };
    else sortOption = { createdAt: -1 };

    const restaurants = await Restaurant.find(query).sort(sortOption);
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get single restaurant
// @route GET /api/restaurants/:id
exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create restaurant (admin/owner)
// @route POST /api/restaurants
exports.createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create({ ...req.body, owner: req.user._id });
    res.status(201).json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update restaurant
// @route PUT /api/restaurants/:id
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete restaurant
// @route DELETE /api/restaurants/:id
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json({ message: 'Restaurant deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get AI-based recommendations
// @route GET /api/restaurants/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    let recommended = [];
    
    // Check if user is logged in and has order history
    if (req.user) {
      const pastOrders = await Order.find({ user: req.user._id }).populate('restaurant');
      if (pastOrders.length > 0) {
        // Simple AI logic: match user's previously ordered cuisines
        const userCuisines = new Set();
        pastOrders.forEach(o => {
          if (o.restaurant && o.restaurant.cuisines) {
            o.restaurant.cuisines.forEach(c => userCuisines.add(c));
          }
        });

        if (userCuisines.size > 0) {
          recommended = await Restaurant.find({
            cuisines: { $in: Array.from(userCuisines) },
            isActive: true
          }).sort({ rating: -1 }).limit(10);
        }
      }
    }

    // Default to popular restaurants if no recommendations found from history
    if (recommended.length === 0) {
      recommended = await Restaurant.find({ isActive: true })
        .sort({ totalRatings: -1, rating: -1 })
        .limit(10);
    }

    res.json(recommended);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
