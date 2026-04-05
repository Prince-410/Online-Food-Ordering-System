const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// ─── GET /api/recommendations/personalized ───────────────────────────────────
exports.getPersonalized = async (req, res) => {
  try {
    const userId = req.user?._id;
    let recommendations = [];

    if (userId) {
      // Get user's past orders
      const pastOrders = await Order.find({ user: userId, orderStatus: 'delivered' })
        .sort({ createdAt: -1 })
        .limit(20);

      // Extract cuisines and categories from past orders
      const orderedItemIds = pastOrders.flatMap(o => o.items.map(i => i.menuItem));

      // Find similar items (collaborative filtering simulation)
      if (orderedItemIds.length > 0) {
        const orderedItems = await MenuItem.find({ _id: { $in: orderedItemIds } });
        const categories = [...new Set(orderedItems.map(i => i.category))];
        const restaurantIds = [...new Set(orderedItems.map(i => i.restaurant.toString()))];

        recommendations = await MenuItem.find({
          $or: [
            { category: { $in: categories } },
            { restaurant: { $in: restaurantIds } }
          ],
          _id: { $nin: orderedItemIds },
          isAvailable: true
        })
          .populate('restaurant', 'name image rating')
          .sort({ rating: -1, isFeatured: -1 })
          .limit(12);
      }
    }

    // Fallback: trending items
    if (recommendations.length < 6) {
      const trending = await MenuItem.find({ isAvailable: true, isFeatured: true })
        .populate('restaurant', 'name image rating')
        .sort({ rating: -1 })
        .limit(12);
      
      const existingIds = new Set(recommendations.map(r => r._id.toString()));
      recommendations.push(...trending.filter(t => !existingIds.has(t._id.toString())));
    }

    res.json({ recommendations: recommendations.slice(0, 12) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/recommendations/mood ───────────────────────────────────────────
exports.getMoodBased = async (req, res) => {
  try {
    const { mood } = req.query;
    const moodMap = {
      happy: { tags: ['comfort', 'pizza', 'burger', 'dessert'], spice: ['mild', 'medium'] },
      sad: { tags: ['comfort', 'chocolate', 'ice-cream', 'dessert'], spice: ['mild'] },
      energetic: { tags: ['healthy', 'protein', 'salad', 'smoothie'], spice: ['medium', 'hot'] },
      spicy: { tags: ['indian', 'thai', 'mexican', 'korean'], spice: ['hot', 'extra-hot'] },
      chill: { tags: ['snack', 'pizza', 'pasta', 'sandwich'], spice: ['mild', 'medium'] },
      adventurous: { tags: ['sushi', 'thai', 'korean', 'mediterranean'], spice: ['medium', 'hot'] },
      romantic: { tags: ['italian', 'french', 'dessert', 'wine'], spice: ['mild', 'medium'] },
      healthy: { tags: ['salad', 'smoothie', 'vegan', 'grilled'], spice: ['mild', 'medium'] }
    };

    const moodConfig = moodMap[mood] || moodMap.happy;

    const items = await MenuItem.find({
      isAvailable: true,
      $or: [
        { tags: { $in: moodConfig.tags } },
        { category: { $regex: moodConfig.tags.join('|'), $options: 'i' } },
        { spiceLevel: { $in: moodConfig.spice } }
      ]
    })
      .populate('restaurant', 'name image rating deliveryTime')
      .sort({ rating: -1 })
      .limit(12);

    // Fallback to featured items if mood-based search returns too few
    if (items.length < 4) {
      const featured = await MenuItem.find({ isAvailable: true, isFeatured: true })
        .populate('restaurant', 'name image rating deliveryTime')
        .sort({ rating: -1 })
        .limit(12);
      items.push(...featured);
    }

    res.json({ mood, suggestions: items.slice(0, 12) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/recommendations/search ─────────────────────────────────────────
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ items: [], restaurants: [] });

    const [items, restaurants] = await Promise.all([
      MenuItem.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { tags: { $regex: q, $options: 'i' } }
        ],
        isAvailable: true
      })
        .populate('restaurant', 'name image')
        .sort({ rating: -1 })
        .limit(6),
      Restaurant.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { cuisines: { $regex: q, $options: 'i' } },
          { tags: { $regex: q, $options: 'i' } }
        ],
        isActive: true
      })
        .sort({ rating: -1 })
        .limit(4)
    ]);

    res.json({ items, restaurants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/recommendations/trending ───────────────────────────────────────
exports.getTrending = async (req, res) => {
  try {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const trending = await Order.aggregate([
      { $match: { createdAt: { $gte: lastWeek } } },
      { $unwind: '$items' },
      { $group: {
        _id: '$items.menuItem',
        name: { $first: '$items.name' },
        image: { $first: '$items.image' },
        price: { $first: '$items.price' },
        orderCount: { $sum: '$items.quantity' }
      }},
      { $sort: { orderCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({ trending });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
